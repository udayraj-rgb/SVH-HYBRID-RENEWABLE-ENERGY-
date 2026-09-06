package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.entity.Campus;
import com.tejas.orchestrator.entity.District;
import com.tejas.orchestrator.entity.OperationalAdvisory;
import com.tejas.orchestrator.entity.TelemetryReading;
import com.tejas.orchestrator.repository.CampusRepository;
import com.tejas.orchestrator.repository.DistrictRepository;
import com.tejas.orchestrator.repository.TelemetryReadingRepository;
import com.tejas.orchestrator.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/govt")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class GovtAdminController {

    private final DistrictRepository districtRepository;
    private final CampusRepository campusRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final com.tejas.orchestrator.service.OperationalAdvisoryService operationalAdvisoryService;

    public GovtAdminController(DistrictRepository districtRepository,
                               CampusRepository campusRepository,
                               TelemetryReadingRepository telemetryReadingRepository,
                               com.tejas.orchestrator.service.OperationalAdvisoryService operationalAdvisoryService) {
        this.districtRepository = districtRepository;
        this.campusRepository = campusRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
        this.operationalAdvisoryService = operationalAdvisoryService;
    }

    /**
     * GET /api/v1/admin/govt/districts
     * Returns all districts in Rajasthan with associated campuses.
     */
    @GetMapping("/districts")
    public ResponseEntity<List<District>> getAllDistricts() {
        return ResponseEntity.ok(districtRepository.findAll());
    }

    /**
     * GET /api/v1/admin/govt/campuses
     * Returns unrestricted statewide list of all technical education campuses.
     */
    @GetMapping("/campuses")
    public ResponseEntity<List<Campus>> getAllCampuses() {
        return ResponseEntity.ok(campusRepository.findAll());
    }

    /**
     * GET /api/v1/admin/govt/campuses/{id}
     * Returns detailed profile of any campus across districts.
     */
    @GetMapping("/campuses/{id}")
    public ResponseEntity<?> getCampusById(@PathVariable Long id) {
        return campusRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/admin/govt/campuses/{id}/telemetry
     * Returns telemetry history for any campus.
     */
    @GetMapping("/campuses/{id}/telemetry")
    public ResponseEntity<List<TelemetryReading>> getCampusTelemetry(@PathVariable Long id) {
        if (!campusRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(telemetryReadingRepository.findByCampusIdOrderByTimestampDesc(id));
    }

    /**
     * GET /api/v1/admin/govt/statewide-summary
     * Computes statewide aggregate capacity and clean energy metrics across all Rajasthan campuses.
     */
    @GetMapping("/statewide-summary")
    public ResponseEntity<Map<String, Object>> getStatewideSummary() {
        List<Campus> campuses = campusRepository.findAll();

        double totalSanctionedLoadKw = campuses.stream().mapToDouble(Campus::getSanctionedLoadKw).sum();
        double totalSolarCapacityKw = campuses.stream().mapToDouble(Campus::getSolarCapacityKw).sum();
        double totalWindCapacityKw = campuses.stream().mapToDouble(Campus::getWindCapacityKw).sum();
        double totalBatteryCapacityKwh = campuses.stream().mapToDouble(Campus::getBatteryCapacityKwh).sum();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("state", "Rajasthan");
        summary.put("department", "Department of Technical Education (DTE)");
        summary.put("totalDistricts", districtRepository.count());
        summary.put("totalCampuses", campuses.size());
        summary.put("totalSanctionedLoadKw", Math.round(totalSanctionedLoadKw * 100.0) / 100.0);
        summary.put("totalSolarCapacityKw", Math.round(totalSolarCapacityKw * 100.0) / 100.0);
        summary.put("totalWindCapacityKw", Math.round(totalWindCapacityKw * 100.0) / 100.0);
        summary.put("totalBatteryCapacityKwh", Math.round(totalBatteryCapacityKwh * 100.0) / 100.0);
        summary.put("campuses", campuses);

        return ResponseEntity.ok(summary);
    }

    /**
     * GET /api/v1/admin/govt/optimization-summary
     * Statewide executive rollup: Total financial savings today, peak demand reduction in MW across
     * all 20 technical campuses, and total avoided CO2 emissions under statutory RERC ToD tariffs.
     */
    @GetMapping("/optimization-summary")
    public ResponseEntity<Map<String, Object>> getOptimizationSummary() {
        List<Campus> campuses = campusRepository.findAll();

        double totalStatewideSavingsInr = 0.0;
        double totalPeakDemandShavedKw = 0.0;
        double totalAvoidedCarbonKg = 0.0;
        double totalTreesPlanted = 0.0;
        List<Map<String, Object>> campusBreakdowns = new java.util.ArrayList<>();

        for (Campus c : campuses) {
            Map<String, Object> fin = operationalAdvisoryService.calculateFinancialSummary(c.getId(), "today");
            double sav = fin.get("totalFinancialBenefitInr") != null ? Double.parseDouble(fin.get("totalFinancialBenefitInr").toString()) : 0.0;
            double peakKw = fin.get("peakDemandShavedKw") != null ? Double.parseDouble(fin.get("peakDemandShavedKw").toString()) : 0.0;
            double carbKg = fin.get("carbonAvoidedTodayKg") != null ? Double.parseDouble(fin.get("carbonAvoidedTodayKg").toString()) : 0.0;
            double trees = fin.get("equivalentTreesPlanted") != null ? Double.parseDouble(fin.get("equivalentTreesPlanted").toString()) : 0.0;

            totalStatewideSavingsInr += sav;
            totalPeakDemandShavedKw += peakKw;
            totalAvoidedCarbonKg += carbKg;
            totalTreesPlanted += trees;

            campusBreakdowns.add(fin);
        }

        double totalPeakDemandReductionMw = Math.round((totalPeakDemandShavedKw / 1000.0) * 1000.0) / 1000.0;

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("state", "Rajasthan");
        resp.put("department", "Department of Technical Education (DTE)");
        resp.put("authority", "Rajasthan Electricity Regulatory Commission (RERC) Compliance");
        resp.put("campusesAudited", campuses.size());
        resp.put("totalStatewideSavingsInrToday", Math.round(totalStatewideSavingsInr * 100.0) / 100.0);
        resp.put("totalPeakDemandReductionMw", totalPeakDemandReductionMw);
        resp.put("totalPeakDemandReductionKw", Math.round(totalPeakDemandShavedKw * 10.0) / 10.0);
        resp.put("totalAvoidedCarbonKg", Math.round(totalAvoidedCarbonKg * 10.0) / 10.0);
        resp.put("totalEquivalentTreesPlanted", Math.round(totalTreesPlanted * 10.0) / 10.0);
        resp.put("tariffStructure", "RERC High-Tension (Solar: ₹5.80, Normal: ₹7.50, Peak: ₹9.50, Export: ₹3.14)");
        resp.put("campusBreakdowns", campusBreakdowns);

        return ResponseEntity.ok(resp);
    }

    /**
     * GET /api/v1/admin/govt/advisories/active
     * Statewide active bilingual (English + Hindi) operational advisories across all Rajasthan campuses.
     */
    @GetMapping("/advisories/active")
    public ResponseEntity<List<OperationalAdvisory>> getActiveStatewideAdvisories() {
        return ResponseEntity.ok(operationalAdvisoryService.getAllActiveAdvisories());
    }

    /**
     * POST /api/v1/admin/govt/advisories/{advisoryId}/acknowledge
     * Acknowledges an active operational advisory on behalf of the DTE Directorate.
     */
    @PostMapping("/advisories/{advisoryId}/acknowledge")
    public ResponseEntity<?> acknowledgeAdvisory(
            @PathVariable Long advisoryId,
            @AuthenticationPrincipal UserPrincipal principal) {
        String username = principal != null ? principal.getUsername() : "govt_admin";
        return ResponseEntity.ok(operationalAdvisoryService.acknowledgeAdvisory(advisoryId, username));
    }
}
