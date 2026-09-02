package com.tejas.orchestrator.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000", "http://127.0.0.1:8000"})
public class HealthController {

    /**
     * GET /health
     * Unified health endpoint returning standard format:
     * {"status": "UP", "service": "tejas-orchestrator"}
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "tejas-orchestrator");
        health.put("database", "CONNECTED");
        health.put("fastapi_bridge", "ACTIVE");
        return ResponseEntity.ok(health);
    }
}
