package com.tejasgrid.controller;

import com.tejasgrid.dto.TelemetrySnapshot;
import com.tejasgrid.entity.DispatchEvent;
import com.tejasgrid.repository.DispatchEventRepository;
import com.tejasgrid.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TelemetryService telemetryService;
    private final DispatchEventRepository dispatchEventRepository;

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKpis() {
        TelemetrySnapshot snap = telemetryService.getLatestSnapshot();

        // Aggregate today's dispatch events for cost/carbon metrics
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        List<DispatchEvent> todayEvents = dispatchEventRepository.findEventsSince(startOfDay);

        double totalCostSaved = todayEvents.stream()
                .mapToDouble(e -> e.getCostSavedInr() != null ? e.getCostSavedInr().doubleValue() : 0.0)
                .sum();
        double totalCarbonAvoided = todayEvents.stream()
                .mapToDouble(e -> e.getCarbonAvoidedKg() != null ? e.getCarbonAvoidedKg().doubleValue() : 0.0)
                .sum();

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("solar_generation_kw", snap.getSolarGenerationKw());
        kpis.put("wind_generation_kw", snap.getWindGenerationKw());
        kpis.put("campus_load_kw", snap.getCampusLoadKw());
        kpis.put("battery_soc_percent", snap.getBatterySOCPercent());
        kpis.put("grid_import_kw", snap.getGridImportKw());
        kpis.put("total_generation_kw", snap.getSolarGenerationKw() + snap.getWindGenerationKw());
        kpis.put("demo_state", snap.getDemoState());
        kpis.put("cost_saved_today_inr", Math.round(totalCostSaved * 100.0) / 100.0);
        kpis.put("carbon_avoided_today_kg", Math.round(totalCarbonAvoided * 100.0) / 100.0);
        kpis.put("dispatch_events_today", todayEvents.size());
        kpis.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(kpis);
    }
}
