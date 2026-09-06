package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.dto.TelemetryDto;
import com.tejas.orchestrator.entity.HostelBlock;
import com.tejas.orchestrator.entity.Student;
import com.tejas.orchestrator.repository.HostelBlockRepository;
import com.tejas.orchestrator.repository.StudentRepository;
import com.tejas.orchestrator.service.OrchestrationService;
import com.tejas.orchestrator.service.TwilioAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class StudentController {

    private final StudentRepository studentRepository;
    private final HostelBlockRepository hostelBlockRepository;
    private final TwilioAlertService twilioAlertService;
    private final OrchestrationService orchestrationService;

    public StudentController(StudentRepository studentRepository,
                             HostelBlockRepository hostelBlockRepository,
                             TwilioAlertService twilioAlertService,
                             OrchestrationService orchestrationService) {
        this.studentRepository = studentRepository;
        this.hostelBlockRepository = hostelBlockRepository;
        this.twilioAlertService = twilioAlertService;
        this.orchestrationService = orchestrationService;
    }

    /**
     * GET /api/v1/students?campusId={campusId}
     * Lists registered campus students with hostel & registration info (campus-scoped or all).
     */
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) Long campusId) {
        if (campusId != null) {
            return ResponseEntity.ok(studentRepository.findByCampusId(campusId));
        }
        return ResponseEntity.ok(studentRepository.findAll());
    }

    /**
     * POST /api/v1/students
     * Creates a new student (Facility Operator CRUD).
    /**
     * POST /api/v1/students
     * Creates or updates a student (Facility Operator CRUD / Auto-deduplicating).
     */
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody Map<String, Object> payload) {
        return handleEnrollmentOrCreation(payload, false);
    }

    /**
     * POST /api/v1/students/enroll
     * Enrolls a student directly (via WhatsApp QR scan / self-enrollment).
     */
    @PostMapping("/enroll")
    public ResponseEntity<?> enrollStudent(@RequestBody Map<String, Object> payload) {
        return handleEnrollmentOrCreation(payload, true);
    }

    private ResponseEntity<?> handleEnrollmentOrCreation(Map<String, Object> payload, boolean isEnrollment) {
        String name = (String) payload.get("name");
        String registrationNumber = (String) payload.get("registrationNumber");
        String phoneNumber = (String) payload.get("phoneNumber");
        String email = (String) payload.get("email");

        if (phoneNumber == null || phoneNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required."));
        }

        String cleanPhone = phoneNumber.replaceAll("[^0-9]", "");
        if (!cleanPhone.startsWith("91") && cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone;
        }

        // Check if student exists by phone number
        Optional<Student> existingByPhone = studentRepository.findByPhoneNumber(cleanPhone);
        if (existingByPhone.isEmpty()) {
            existingByPhone = studentRepository.findByPhoneNumber(phoneNumber);
        }

        if (existingByPhone.isPresent()) {
            Student existing = existingByPhone.get();
            existing.setWhatsappOptIn(true);
            if (name != null && !name.isBlank()) existing.setName(name);
            if (registrationNumber != null && !registrationNumber.isBlank()) existing.setRegistrationNumber(registrationNumber);
            Student saved = studentRepository.save(existing);
            return ResponseEntity.ok(Map.of(
                    "status", "enrolled_existing",
                    "message", "Student profile updated and WhatsApp opt-in enabled.",
                    "student", saved
            ));
        }

        // Check if student exists by registration number
        if (registrationNumber != null && !registrationNumber.isBlank()) {
            Optional<Student> existingByReg = studentRepository.findByRegistrationNumber(registrationNumber);
            if (existingByReg.isPresent()) {
                Student existing = existingByReg.get();
                existing.setWhatsappOptIn(true);
                existing.setPhoneNumber(cleanPhone);
                if (name != null && !name.isBlank()) existing.setName(name);
                Student saved = studentRepository.save(existing);
                return ResponseEntity.ok(Map.of(
                        "status", "enrolled_existing",
                        "message", "Student profile updated with new phone number and WhatsApp opt-in.",
                        "student", saved
                ));
            }
        }

        if (name == null || name.isBlank()) {
            name = "Student " + (cleanPhone.length() >= 4 ? cleanPhone.substring(cleanPhone.length() - 4) : cleanPhone);
        }
        if (registrationNumber == null || registrationNumber.isBlank()) {
            registrationNumber = "24BCE" + (cleanPhone.length() >= 4 ? cleanPhone.substring(cleanPhone.length() - 4) : cleanPhone);
        }
        if (email == null || email.isBlank()) {
            email = registrationNumber.toLowerCase().replaceAll("[^a-z0-9]", "") + "@campus.tejas.edu";
        }

        Long hostelId = 1L;
        if (payload.get("hostelId") != null) {
            try {
                hostelId = Long.valueOf(payload.get("hostelId").toString());
            } catch (Exception ignored) {}
        }

        Integer karmaPoints = 100;
        if (payload.get("karmaPoints") != null) {
            try {
                karmaPoints = Integer.valueOf(payload.get("karmaPoints").toString());
            } catch (Exception ignored) {}
        }

        HostelBlock hostel = hostelBlockRepository.findById(hostelId)
                .orElseGet(() -> hostelBlockRepository.findAll().get(0));

        Student newStudent = Student.builder()
                .name(name)
                .registrationNumber(registrationNumber)
                .phoneNumber(cleanPhone)
                .email(email)
                .karmaPoints(karmaPoints)
                .whatsappOptIn(true)
                .hostel(hostel)
                .campus(hostel.getCampus())
                .build();

        Student saved = studentRepository.save(newStudent);
        return ResponseEntity.ok(Map.of(
                "status", "enrolled_new",
                "message", "Student successfully enrolled into PostgreSQL Student Directory.",
                "student", saved
        ));
    }

    /**
     * PUT /api/v1/students/{id}
     * Updates an existing student (Facility Operator CRUD).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Student> opt = studentRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student s = opt.get();
        if (payload.containsKey("name") && payload.get("name") != null) {
            s.setName((String) payload.get("name"));
        }
        if (payload.containsKey("registrationNumber") && payload.get("registrationNumber") != null) {
            s.setRegistrationNumber((String) payload.get("registrationNumber"));
        }
        if (payload.containsKey("phoneNumber") && payload.get("phoneNumber") != null) {
            s.setPhoneNumber((String) payload.get("phoneNumber"));
        }
        if (payload.containsKey("email") && payload.get("email") != null) {
            s.setEmail((String) payload.get("email"));
        }
        if (payload.containsKey("karmaPoints") && payload.get("karmaPoints") != null) {
            try {
                s.setKarmaPoints(Integer.valueOf(payload.get("karmaPoints").toString()));
            } catch (Exception ignored) {}
        }
        if (payload.containsKey("whatsappOptIn") && payload.get("whatsappOptIn") != null) {
            s.setWhatsappOptIn(Boolean.valueOf(payload.get("whatsappOptIn").toString()));
        }
        if (payload.containsKey("hostelId") && payload.get("hostelId") != null) {
            try {
                Long hid = Long.valueOf(payload.get("hostelId").toString());
                hostelBlockRepository.findById(hid).ifPresent(s::setHostel);
            } catch (Exception ignored) {}
        }

        Student updated = studentRepository.save(s);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/v1/students/reg/{regNo}
     * Resolves student profile by university registration number.
     */
    @GetMapping("/reg/{regNo}")
    public ResponseEntity<?> getStudentByRegNo(@PathVariable String regNo) {
        return studentRepository.findByRegistrationNumber(regNo)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * POST /api/v1/students/{id}/redeem
     * Decrements student's Karma points in PostgreSQL when a voucher is redeemed.
     */
    @PostMapping("/{id}/redeem")
    public ResponseEntity<?> redeemKarmaPoints(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Student> opt = studentRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = opt.get();
        int pointsCost = 0;
        if (payload.containsKey("pointsCost") && payload.get("pointsCost") != null) {
            try {
                pointsCost = Integer.parseInt(payload.get("pointsCost").toString());
            } catch (Exception ignored) {}
        }
        String rewardName = payload.containsKey("rewardName") ? String.valueOf(payload.get("rewardName")) : "Campus Voucher";

        if (student.getKarmaPoints() < pointsCost) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Insufficient Karma points",
                    "currentBalance", student.getKarmaPoints(),
                    "requiredPoints", pointsCost
            ));
        }

        int previousBalance = student.getKarmaPoints();
        int newBalance = previousBalance - pointsCost;
        student.setKarmaPoints(newBalance);
        Student updated = studentRepository.save(student);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", "Voucher redeemed successfully.");
        response.put("studentId", updated.getId());
        response.put("registrationNumber", updated.getRegistrationNumber());
        response.put("rewardName", rewardName);
        response.put("pointsDeducted", pointsCost);
        response.put("previousBalance", previousBalance);
        response.put("currentBalance", newBalance);
        response.put("student", updated);

        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/students/{id}
     * Deletes a student from the database (Facility Operator CRUD).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "deleted", "id", id));
    }

    /**
     * POST /api/v1/students/{id}/toggle-whatsapp
     * Toggles the whatsappOptIn flag for a student.
     */
    @PostMapping("/{id}/toggle-whatsapp")
    public ResponseEntity<Student> toggleWhatsappOptIn(@PathVariable Long id) {
        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        boolean currentStatus = Boolean.TRUE.equals(student.getWhatsappOptIn());
        student.setWhatsappOptIn(!currentStatus);
        Student updatedStudent = studentRepository.save(student);

        return ResponseEntity.ok(updatedStudent);
    }

    /**
     * POST /api/v1/students/register
     * Legacy register endpoint.
     */
    @PostMapping("/register")
    public ResponseEntity<Student> registerStudent(
            @RequestParam String name,
            @RequestParam String registrationNumber,
            @RequestParam String phoneNumber,
            @RequestParam String email,
            @RequestParam(required = false, defaultValue = "1") Long hostelId) {

        HostelBlock hostel = hostelBlockRepository.findById(hostelId)
                .orElseGet(() -> hostelBlockRepository.findAll().get(0));

        Student newStudent = Student.builder()
                .name(name)
                .registrationNumber(registrationNumber)
                .phoneNumber(phoneNumber)
                .email(email)
                .karmaPoints(100)
                .whatsappOptIn(true)
                .hostel(hostel)
                .build();

        return ResponseEntity.ok(studentRepository.save(newStudent));
    }

    /**
     * POST /api/v1/students/send-deficit-alert
     * Directly triggers an automated deficit alert to a specific phone number (e.g. 8238893551).
     */
    @PostMapping("/send-deficit-alert")
    public ResponseEntity<Map<String, Object>> sendDirectDeficitAlert(
            @RequestParam(required = false, defaultValue = "+918238893551") String phoneNumber,
            @RequestParam(required = false) Double deficitKw) {

        double actualDeficit = deficitKw != null ? deficitKw : 180.4;
        try {
            TelemetryDto live = orchestrationService.fetchLiveTelemetry();
            if (live != null && live.getCampusLoadKw() != null && live.getTotalGenerationKw() != null) {
                double diff = live.getCampusLoadKw() - live.getTotalGenerationKw();
                if (diff > 0) actualDeficit = Math.round(diff * 10.0) / 10.0;
            }
        } catch (Exception ignored) {}

        twilioAlertService.sendGreenHourAlert(phoneNumber, "Block A (Aryabhata)", actualDeficit);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "dispatched");
        resp.put("targetPhone", phoneNumber);
        resp.put("deficitKw", actualDeficit);
        resp.put("message", "⚡ TEJAS GRID ALERT: Solar deficit of " + actualDeficit + " kW detected on campus! Green Hour is now active. Reduce non-essential appliances in Block A (Aryabhata) for 45 mins to earn 50 Karma points for your hostel leaderboard!");

        return ResponseEntity.ok(resp);
    }
}
