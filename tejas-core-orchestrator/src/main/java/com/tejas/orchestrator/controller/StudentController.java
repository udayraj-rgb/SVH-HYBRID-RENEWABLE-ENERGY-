package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.entity.Student;
import com.tejas.orchestrator.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
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
}
