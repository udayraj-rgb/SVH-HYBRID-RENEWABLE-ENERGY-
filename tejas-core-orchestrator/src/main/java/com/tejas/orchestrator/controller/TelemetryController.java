package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.dto.TelemetryIngestDTO;
import com.tejas.orchestrator.entity.Campus;
import com.tejas.orchestrator.entity.TelemetryReading;
import com.tejas.orchestrator.repository.CampusRepository;
import com.tejas.orchestrator.repository.TelemetryReadingRepository;
import com.tejas.orchestrator.security.CampusSecurityEvaluator;
import com.tejas.orchestrator.service.TelemetrySimulationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/telemetry")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class TelemetryController {

    private final CampusRepository campusRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final CampusSecurityEvaluator campusSecurity;
    private final TelemetrySimulationService simulationService;
    private final SimpMessagingTemplate messagingTemplate;

    public TelemetryController(CampusRepository campusRepository,
                               TelemetryReadingRepository telemetryReadingRepository,
                               CampusSecurityEvaluator campusSecurity,
                               TelemetrySimulationService simulationService,
                               SimpMessagingTemplate messagingTemplate) {
        this.campusRepository = campusRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
        this.campusSecurity = campusSecurity;
        this.simulationService = simulationService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * POST /api/v1/telemetry/ingest
     * Ingests a new telemetry reading. Scoped to the operator assigned to campusId or statewide ROLE_GOVT.
     */
    @PostMapping("/ingest")
    @PreAuthorize("hasRole('GOVT') or (hasRole('OPERATOR') and @campusSecurity.canAccessCampus(#dto.campusId))")
    public ResponseEntity<?> ingestTelemetry(@RequestBody TelemetryIngestDTO dto) {
        if (dto.getCampusId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "campusId is required"));
        }

        Campus campus = campusRepository.findById(dto.getCampusId())
                .orElseThrow(() -> new IllegalArgumentException("Campus not found: " + dto.getCampusId()));

        LocalDateTime recordedTime = dto.getRecordedAt() != null ? dto.getRecordedAt() : LocalDateTime.now();

        TelemetryReading reading = TelemetryReading.builder()
                .campus(campus)
                .timestamp(recordedTime)
                .solarKw(dto.getSolarKw() != null ? dto.getSolarKw() : 0.0)
                .windKw(dto.getWindKw() != null ? dto.getWindKw() : 0.0)
                .campusLoadKw(dto.getCampusLoadKw() != null ? dto.getCampusLoadKw() : 500.0)
                .batterySocPct(dto.getBatterySocPct() != null ? dto.getBatterySocPct() : 75.0)
                .gridImportKw(dto.getGridImportKw() != null ? dto.getGridImportKw() : 0.0)
                .gridExportKw(dto.getGridExportKw() != null ? dto.getGridExportKw() : 0.0)
                .build();

        TelemetryReading saved = telemetryReadingRepository.save(reading);

        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/campus/" + campus.getId() + "/live-telemetry", saved);
            } catch (Exception ex) {
                // Log and continue
            }
        }

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "success");
        resp.put("message", "Telemetry ingested successfully");
        resp.put("readingId", saved.getId());
        resp.put("campusId", campus.getId());
        resp.put("campusName", campus.getName());
        resp.put("recordedAt", saved.getTimestamp());
        resp.put("reading", saved);

        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/v1/telemetry/simulate/cycle
     * On-demand simulation cycle trigger for hackathon judge live demos.
     */
    @PostMapping("/simulate/cycle")
    @PreAuthorize("hasAnyRole('GOVT', 'OPERATOR')")
    public ResponseEntity<?> triggerSimulationCycle() {
        List<Map<String, Object>> results = simulationService.simulateCycle();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "success");
        resp.put("message", "Live simulation cycle executed across campuses");
        resp.put("timestamp", LocalDateTime.now());
        resp.put("campusesCount", results.size());
        resp.put("results", results);

        return ResponseEntity.ok(resp);
    }
}
