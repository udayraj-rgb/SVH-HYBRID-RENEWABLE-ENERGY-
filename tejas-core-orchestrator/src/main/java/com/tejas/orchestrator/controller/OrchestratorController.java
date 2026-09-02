package com.tejas.orchestrator.controller;

import com.tejas.orchestrator.dto.OrchestratorStatusResponse;
import com.tejas.orchestrator.entity.DispatchEvent;
import com.tejas.orchestrator.service.OrchestrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orchestrator")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class OrchestratorController {

    private final OrchestrationService orchestrationService;

    public OrchestratorController(OrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    /**
     * GET /api/v1/orchestrator/status
     * Returns current grid status, recommendation, and safety lock state.
     * Supports optional ?simulatedSoc=28.0 to test the 30% safety reserve constraint.
     */
    @GetMapping("/status")
    public ResponseEntity<OrchestratorStatusResponse> getOrchestratorStatus(
            @RequestParam(required = false) Double simulatedSoc) {
        if (simulatedSoc != null) {
            return ResponseEntity.ok(orchestrationService.evaluateGridHealthWithSimulatedSoc(simulatedSoc));
        }
        return ResponseEntity.ok(orchestrationService.evaluateGridHealth());
    }

    /**
     * POST /api/v1/orchestrator/execute-dispatch
     * Confirms active recommendation, updates event status to EXECUTED, and distributes Karma points.
     */
    @PostMapping("/execute-dispatch")
    public ResponseEntity<DispatchEvent> executeDispatch() {
        DispatchEvent executedEvent = orchestrationService.executeActiveDispatch();
        return ResponseEntity.ok(executedEvent);
    }
}
