package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.entity.Campus;
import com.tejas.orchestrator.entity.TelemetryReading;
import com.tejas.orchestrator.repository.CampusRepository;
import com.tejas.orchestrator.repository.TelemetryReadingRepository;
import com.tejas.orchestrator.security.CampusSecurityEvaluator;
import com.tejas.orchestrator.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/operator")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class OperatorController {

    private final CampusRepository campusRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final CampusSecurityEvaluator campusSecurity;
    private final com.tejas.orchestrator.service.WeatherForecastService weatherForecastService;
    private final com.tejas.orchestrator.service.MicrogridDispatchOptimizerService dispatchOptimizerService;
    private final com.tejas.orchestrator.service.OperationalAdvisoryService operationalAdvisoryService;

    public OperatorController(CampusRepository campusRepository,
                              TelemetryReadingRepository telemetryReadingRepository,
                              CampusSecurityEvaluator campusSecurity,
                              com.tejas.orchestrator.service.WeatherForecastService weatherForecastService,
                              com.tejas.orchestrator.service.MicrogridDispatchOptimizerService dispatchOptimizerService,
                              com.tejas.orchestrator.service.OperationalAdvisoryService operationalAdvisoryService) {
        this.campusRepository = campusRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
        this.campusSecurity = campusSecurity;
        this.weatherForecastService = weatherForecastService;
        this.dispatchOptimizerService = dispatchOptimizerService;
        this.operationalAdvisoryService = operationalAdvisoryService;
    }

    /**
     * GET /api/v1/operator/campus
     * Resolves the operator's assigned campus automatically from their authenticated security principal.
     */
    @GetMapping("/campus")
    public ResponseEntity<?> getAssignedCampus(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getCampusId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No campus assigned to operator."));
        }

        return campusRepository.findById(principal.getCampusId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}
     * Returns campus specs strictly scoped to the operator's assigned campus.
     * Attempting to access another campus throws HTTP 403 Forbidden.
     */
    @GetMapping("/campuses/{campusId}")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> getCampusById(@PathVariable Long campusId) {
        return campusRepository.findById(campusId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}/telemetry
     * Returns telemetry history for the operator's assigned campus.
     */
    @GetMapping("/campuses/{campusId}/telemetry")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<List<TelemetryReading>> getCampusTelemetry(@PathVariable Long campusId) {
        return ResponseEntity.ok(telemetryReadingRepository.findByCampusIdOrderByTimestampDesc(campusId));
    }

    /**
     * POST /api/v1/operator/campuses/{campusId}/telemetry
     * Ingests a new telemetry reading for the assigned campus.
     */
    @PostMapping("/campuses/{campusId}/telemetry")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> recordTelemetryReading(
            @PathVariable Long campusId,
            @RequestBody Map<String, Object> payload) {

        Campus campus = campusRepository.findById(campusId)
                .orElseThrow(() -> new IllegalArgumentException("Campus not found: " + campusId));

        double solarKw = payload.get("solarKw") != null ? Double.parseDouble(payload.get("solarKw").toString()) : 0.0;
        double windKw = payload.get("windKw") != null ? Double.parseDouble(payload.get("windKw").toString()) : 0.0;
        double loadKw = payload.get("campusLoadKw") != null ? Double.parseDouble(payload.get("campusLoadKw").toString()) : 500.0;
        double socPct = payload.get("batterySocPct") != null ? Double.parseDouble(payload.get("batterySocPct").toString()) : 50.0;
        double gridImport = payload.get("gridImportKw") != null ? Double.parseDouble(payload.get("gridImportKw").toString()) : 0.0;
        double gridExport = payload.get("gridExportKw") != null ? Double.parseDouble(payload.get("gridExportKw").toString()) : 0.0;

        TelemetryReading reading = TelemetryReading.builder()
                .campus(campus)
                .timestamp(LocalDateTime.now())
                .solarKw(solarKw)
                .windKw(windKw)
                .campusLoadKw(loadKw)
                .batterySocPct(socPct)
                .gridImportKw(gridImport)
                .gridExportKw(gridExport)
                .build();

        TelemetryReading saved = telemetryReadingRepository.save(reading);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "recorded");
        resp.put("readingId", saved.getId());
        resp.put("campusId", campus.getId());
        resp.put("campusName", campus.getName());
        resp.put("reading", saved);

        return ResponseEntity.ok(resp);
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}/weather-forecast
     * Scoped weather forecast with solar irradiance and wind metrics from Open-Meteo.
     */
    @GetMapping("/campuses/{campusId}/weather-forecast")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> getWeatherForecast(@PathVariable Long campusId) {
        return ResponseEntity.ok(weatherForecastService.getForecastForCampus(campusId));
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}/telemetry/live
     * Returns the latest telemetry reading for the assigned campus.
     */
    @GetMapping("/campuses/{campusId}/telemetry/live")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> getLiveTelemetry(@PathVariable Long campusId) {
        return telemetryReadingRepository.findTopByCampusIdOrderByTimestampDesc(campusId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}/telemetry/history?range=24h
     * Returns chronological readings for time-series charts (default past 24 hours).
     */
    @GetMapping("/campuses/{campusId}/telemetry/history")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<List<TelemetryReading>> getTelemetryHistory(
            @PathVariable Long campusId,
            @RequestParam(name = "range", defaultValue = "24h") String range) {

        int hours = "7d".equalsIgnoreCase(range) ? 168 : 24;
        LocalDateTime start = LocalDateTime.now().minusHours(hours);
        LocalDateTime end = LocalDateTime.now();

        return ResponseEntity.ok(
                telemetryReadingRepository.findByCampusIdAndTimestampBetweenOrderByTimestampAsc(campusId, start, end)
        );
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}/dispatch-schedule
     * Returns 24-hour predictive dispatch schedule optimized for RERC ToD tariffs.
     */
    @GetMapping("/campuses/{campusId}/dispatch-schedule")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> getDispatchSchedule(@PathVariable Long campusId) {
        return ResponseEntity.ok(dispatchOptimizerService.generate24HourSchedule(campusId));
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}/advisories/active
     * Returns active bilingual (English + Hindi) operational recommendations.
     */
    @GetMapping("/campuses/{campusId}/advisories/active")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> getActiveAdvisories(@PathVariable Long campusId) {
        return ResponseEntity.ok(operationalAdvisoryService.getActiveAdvisories(campusId));
    }

    /**
     * POST /api/v1/operator/campuses/{campusId}/advisories/{advisoryId}/acknowledge
     * Acknowledges an active operational advisory.
     */
    @PostMapping("/campuses/{campusId}/advisories/{advisoryId}/acknowledge")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> acknowledgeAdvisory(
            @PathVariable Long campusId,
            @PathVariable Long advisoryId,
            @AuthenticationPrincipal UserPrincipal principal) {

        String username = principal != null ? principal.getUsername() : "operator";
        return ResponseEntity.ok(operationalAdvisoryService.acknowledgeAdvisory(advisoryId, username));
    }

    /**
     * GET /api/v1/operator/campuses/{campusId}/financial-summary?period=today
     * Computes avoided grid cost in ₹, ToD peak savings, export revenue, and carbon reduction.
     */
    @GetMapping("/campuses/{campusId}/financial-summary")
    @PreAuthorize("@campusSecurity.canAccessCampus(#campusId)")
    public ResponseEntity<?> getFinancialSummary(
            @PathVariable Long campusId,
            @RequestParam(name = "period", defaultValue = "today") String period) {

        return ResponseEntity.ok(operationalAdvisoryService.calculateFinancialSummary(campusId, period));
    }
}
