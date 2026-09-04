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
     * GET /api/v1/students
     * Lists all registered campus students with hostel & registration info.
     */
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    /**
     * POST /api/v1/students
     * Creates a new student (Facility Operator CRUD).
     */
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String registrationNumber = (String) payload.get("registrationNumber");
        String phoneNumber = (String) payload.get("phoneNumber");
        String email = (String) payload.get("email");

        if (name == null || name.isBlank() || registrationNumber == null || registrationNumber.isBlank() || phoneNumber == null || phoneNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, Registration Number, and Phone Number are required."));
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
                .phoneNumber(phoneNumber)
                .email(email)
                .karmaPoints(karmaPoints)
                .whatsappOptIn(true)
                .hostel(hostel)
                .build();

        Student saved = studentRepository.save(newStudent);
        return ResponseEntity.ok(saved);
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
