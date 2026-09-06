package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.service.ExecutiveReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/govt/reports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class ExecutiveReportController {

    private final ExecutiveReportService executiveReportService;

    public ExecutiveReportController(ExecutiveReportService executiveReportService) {
        this.executiveReportService = executiveReportService;
    }

    /**
     * GET /api/v1/admin/govt/reports/naac-summary
     * Generates institutional ESG & Energy audit report compliant with NAAC Criterion 7.1.2
     * (Alternate sources of energy and energy conservation measures).
     * Strictly restricted to statewide ROLE_GOVT administrators.
     */
    @GetMapping("/naac-summary")
    @PreAuthorize("hasRole('GOVT')")
    public ResponseEntity<Map<String, Object>> getNaacCriterionSummary() {
        return ResponseEntity.ok(executiveReportService.getNaacCriterionSummary());
    }

    /**
     * GET /api/v1/admin/govt/reports/campuses-rank
     * Ranks all 20 Rajasthan technical campuses by Renewable Self-Consumption Index (%)
     * and composite clean energy utilization metrics.
     * Strictly restricted to statewide ROLE_GOVT administrators.
     */
    @GetMapping("/campuses-rank")
    @PreAuthorize("hasRole('GOVT')")
    public ResponseEntity<List<Map<String, Object>>> getCampusRenewableRanking() {
        return ResponseEntity.ok(executiveReportService.getCampusRenewableRanking());
    }
}
