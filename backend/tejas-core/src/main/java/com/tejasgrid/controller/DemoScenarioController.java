package com.tejasgrid.controller;

import com.tejasgrid.dto.DispatchRecommendation;
import com.tejasgrid.service.OrchestrationService;
import com.tejasgrid.service.TwilioAlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoScenarioController {

    private final OrchestrationService orchestrationService;
    private final TwilioAlertService twilioAlertService;
    private final RestTemplate restTemplate;

    private static final String ANALYTICS_URL = "http://localhost:8000";

    @PostMapping("/scenario/normal")
    public ResponseEntity<Map<String, Object>> triggerNormal() {
        return triggerScenario("normal",
            "Normal Operations",
            "All systems operating at optimal capacity.");
    }

    @PostMapping("/scenario/cloud-cover")
    public ResponseEntity<Map<String, Object>> triggerCloudCover() {
        return triggerScenario("cloud_cover",
            "Midday Cloud Cover Event (-65% Solar)",
            "Green Hour Alert: Solar generation has dropped. Switch off non-essential appliances in your hostel to earn 50 Karma Points!");
    }

    @PostMapping("/scenario/demand-spike")
    public ResponseEntity<Map<String, Object>> triggerDemandSpike() {
        return triggerScenario("demand_spike",
            "Hostel Evening Demand Spike",
            "High Demand Alert: Campus load has spiked! Help reduce load now to earn 50 Karma Points!");
    }

    @GetMapping("/scenario/current")
    public ResponseEntity<DispatchRecommendation> getCurrentState() {
        return ResponseEntity.ok(orchestrationService.getLastRecommendation());
    }

    private ResponseEntity<Map<String, Object>> triggerScenario(
            String state, String name, String message) {
        log.info("[DEMO] Triggering scenario: {}", name);

        // 1. Update the analytics simulator state
        try {
            restTemplate.postForEntity(
                ANALYTICS_URL + "/api/demo/state/" + state,
                null, String.class
            );
        } catch (Exception e) {
            log.warn("Could not reach analytics service to set demo state: {}", e.getMessage());
        }

        // 2. Trigger immediate dispatch evaluation
        orchestrationService.evaluateAndDispatch();

        // 3. Fire WhatsApp broadcast if applicable
        if (!"normal".equals(state)) {
            twilioAlertService.broadcastGreenHourAlert(message);
        }

        return ResponseEntity.ok(Map.of(
            "status", "TRIGGERED",
            "scenario", name,
            "state", state,
            "message", message
        ));
    }
}
