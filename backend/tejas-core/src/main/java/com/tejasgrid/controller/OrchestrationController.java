package com.tejasgrid.controller;

import com.tejasgrid.dto.DispatchRecommendation;
import com.tejasgrid.dto.TelemetrySnapshot;
import com.tejasgrid.entity.DispatchEvent;
import com.tejasgrid.repository.DispatchEventRepository;
import com.tejasgrid.service.OrchestrationService;
import com.tejasgrid.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orchestration")
@RequiredArgsConstructor
public class OrchestrationController {

    private final OrchestrationService orchestrationService;
    private final TelemetryService telemetryService;
    private final DispatchEventRepository dispatchEventRepository;

    @GetMapping("/telemetry/latest")
    public ResponseEntity<TelemetrySnapshot> getLatestTelemetry() {
        return ResponseEntity.ok(telemetryService.getLatestSnapshot());
    }

    @GetMapping("/dispatch/recommendation")
    public ResponseEntity<DispatchRecommendation> getCurrentRecommendation() {
        return ResponseEntity.ok(orchestrationService.getLastRecommendation());
    }

    @PostMapping("/dispatch/evaluate")
    public ResponseEntity<DispatchRecommendation> triggerEvaluation() {
        TelemetrySnapshot snapshot = telemetryService.getLatestSnapshot();
        DispatchRecommendation rec = orchestrationService.evaluate(snapshot);
        return ResponseEntity.ok(rec);
    }

    @PatchMapping("/dispatch/events/{id}/acknowledge")
    public ResponseEntity<Map<String, String>> acknowledgeEvent(@PathVariable UUID id) {
        return dispatchEventRepository.findById(id).map(event -> {
            event.setStatus(DispatchEvent.EventStatus.ACKNOWLEDGED);
            dispatchEventRepository.save(event);
            return ResponseEntity.ok(Map.of("status", "ACKNOWLEDGED", "eventId", id.toString()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/dispatch/events/{id}/execute")
    public ResponseEntity<Map<String, String>> executeEvent(@PathVariable UUID id) {
        return dispatchEventRepository.findById(id).map(event -> {
            event.setStatus(DispatchEvent.EventStatus.EXECUTED);
            dispatchEventRepository.save(event);
            return ResponseEntity.ok(Map.of("status", "EXECUTED", "eventId", id.toString()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dispatch/events")
    public ResponseEntity<List<DispatchEvent>> getRecentEvents() {
        return ResponseEntity.ok(dispatchEventRepository.findTop10ByOrderByEventTimestampDesc());
    }
}
