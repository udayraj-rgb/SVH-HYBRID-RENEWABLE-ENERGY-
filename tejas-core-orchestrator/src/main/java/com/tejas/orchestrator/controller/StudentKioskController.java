package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.dto.StudentKioskDTO;
import com.tejas.orchestrator.security.CampusSecurityEvaluator;
import com.tejas.orchestrator.service.StudentKioskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class StudentKioskController {

    private final StudentKioskService studentKioskService;
    private final CampusSecurityEvaluator campusSecurity;

    public StudentKioskController(StudentKioskService studentKioskService,
                                  CampusSecurityEvaluator campusSecurity) {
        this.studentKioskService = studentKioskService;
        this.campusSecurity = campusSecurity;
    }

    /**
     * GET /api/v1/student/campuses/{campusId}/kiosk
     * Public-safe interactive kiosk display endpoint.
     * Delivers live renewable %, real-time status badge, avoided carbon, tree equivalent,
     * live generation kW, hostel leaderboard, and bilingual eco-tips.
     * Strictly audited to guarantee zero disclosure of financial, tariff, or utility billing data.
     */
    @GetMapping("/campuses/{campusId}/kiosk")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<StudentKioskDTO> getCampusKioskData(@PathVariable Long campusId) {
        StudentKioskDTO kioskData = studentKioskService.getKioskData(campusId);
        return ResponseEntity.ok(kioskData);
    }
}
