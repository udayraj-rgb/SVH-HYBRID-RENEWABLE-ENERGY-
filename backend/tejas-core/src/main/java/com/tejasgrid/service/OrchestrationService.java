package com.tejasgrid.service;

import com.tejasgrid.dto.DispatchRecommendation;
import com.tejasgrid.dto.TelemetrySnapshot;
import com.tejasgrid.entity.DispatchEvent;
import com.tejasgrid.repository.DispatchEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrchestrationService {

    private final TelemetryService telemetryService;
    private final DispatchEventRepository dispatchEventRepository;
    private final TwilioAlertService twilioAlertService;

    @Value("${energy.campus-load-threshold-kw}")
    private double campusLoadThresholdKw;

    @Value("${energy.battery-critical-reserve-percent}")
    private double batteryCriticalReservePercent;

    @Value("${energy.tariff-rate-inr-per-kwh}")
    private double tariffRateInrPerKwh;

    @Value("${energy.carbon-factor-kg-per-kwh}")
    private double carbonFactorKgPerKwh;

    private DispatchRecommendation lastRecommendation;

    /**
     * Run the dispatch evaluation every 10 seconds.
     */
    @Scheduled(fixedDelay = 10_000)
    public void evaluateAndDispatch() {
        long start = System.currentTimeMillis();
        TelemetrySnapshot snapshot = telemetryService.getLatestSnapshot();
        DispatchRecommendation rec = evaluate(snapshot);
        this.lastRecommendation = rec;

        if (!"NORMAL".equals(rec.getAnomalyType())) {
            persistEvent(rec);
            if (rec.isNotificationRequired()) {
                twilioAlertService.broadcastGreenHourAlert(rec.getNotificationMessage());
            }
        }

        long elapsed = System.currentTimeMillis() - start;
        log.debug("Dispatch evaluation: anomaly={}, severity={}, elapsed={}ms",
                rec.getAnomalyType(), rec.getSeverity(), elapsed);
    }

    /**
     * Pure evaluation logic (testable without Spring context).
     */
    public DispatchRecommendation evaluate(TelemetrySnapshot s) {
        double totalGeneration = s.getSolarGenerationKw() + s.getWindGenerationKw();
        double deficit = s.getCampusLoadKw() - totalGeneration;
        double batteryAvailablePercent = s.getBatterySOCPercent() - batteryCriticalReservePercent;

        String anomalyType = "NORMAL";
        String severity = "LOW";
        List<String> actions = new ArrayList<>();
        boolean notifyStudents = false;
        String notificationMsg = "";

        // === RULE 1: Solar Deficit Detection ===
        boolean solarDeficit = s.getSolarGenerationKw() < (totalGeneration * 0.4)
                && s.getCampusLoadKw() > campusLoadThresholdKw * 0.8;

        // === RULE 2: Demand Spike ===
        boolean demandSpike = s.getCampusLoadKw() > campusLoadThresholdKw;

        // === RULE 3: Battery Low (approaching critical reserve) ===
        boolean batteryLow = s.getBatterySOCPercent() < (batteryCriticalReservePercent + 15.0);

        if (batteryLow && demandSpike) {
            anomalyType = "BATTERY_LOW";
            severity = "CRITICAL";
            actions.add("CRITICAL: Battery approaching reserve floor. Initiating grid import.");
            actions.add("Lock battery SoC at " + batteryCriticalReservePercent + "% — critical labs protected.");
            actions.add("Broadcast emergency Green Hour alert to all hostels.");
            notifyStudents = true;
            notificationMsg = "\uD83D\uDEA8 GRID ALERT: Campus power is critical! " +
                    "Switch off ALL non-essential appliances immediately to protect critical lab power. " +
                    "Emergency 100 Karma Points for participation!";
        } else if (demandSpike && solarDeficit) {
            anomalyType = "SOLAR_DEFICIT";
            severity = "HIGH";
            actions.add("Solar generation critically low. Triggering BESS discharge.");
            actions.add("Recommend shifting HVAC loads to off-peak window (23:00-06:00).");
            actions.add("Recommend deferring water pump operation by 2 hours.");
            actions.add("Broadcast Green Hour alert to opted-in students.");
            notifyStudents = true;
            notificationMsg = "\u2600\uFE0F Green Hour Alert: Solar generation has dropped. " +
                    "Switch off non-essential appliances in your hostel to earn 50 Karma Points!";
        } else if (demandSpike) {
            anomalyType = "DEMAND_SPIKE";
            severity = "MEDIUM";
            actions.add("Demand exceeds threshold. Recommend deferring deferrable loads.");
            actions.add("BESS discharge authorized down to " + batteryCriticalReservePercent + "% reserve.");
            notifyStudents = batteryAvailablePercent < 20.0;
            if (notifyStudents) {
                notificationMsg = "\u26A1 High Demand Alert: Help us save energy this hour and earn 50 Karma Points!";
            }
        } else if (solarDeficit) {
            anomalyType = "SOLAR_DEFICIT";
            severity = "MEDIUM";
            actions.add("Solar deficit detected. Monitoring BESS levels.");
            actions.add("Consider voluntary load reduction in hostels.");
        }

        // === Financial & Carbon Impact Estimation ===
        double peakReductionKw = Math.max(0.0, deficit * 0.6); // Estimate 60% reducible
        double durationHours = 1.0; // Estimated 1-hour event
        double costSaved = peakReductionKw * durationHours * tariffRateInrPerKwh;
        double carbonAvoided = peakReductionKw * durationHours * carbonFactorKgPerKwh;

        if (actions.isEmpty()) {
            actions.add("All systems operating within normal parameters.");
        }

        return DispatchRecommendation.builder()
                .eventId(UUID.randomUUID().toString())
                .timestamp(s.getTimestamp() != null ? s.getTimestamp() : Instant.now())
                .anomalyType(anomalyType)
                .severity(severity)
                .campusLoadKw(s.getCampusLoadKw())
                .totalGenerationKw(totalGeneration)
                .batterySocPercent(s.getBatterySOCPercent())
                .projectedPeakReductionKw(round2(peakReductionKw))
                .estimatedCostSavedInr(round2(costSaved))
                .estimatedCarbonAvoidedKg(round2(carbonAvoided))
                .actions(actions)
                .notificationRequired(notifyStudents)
                .notificationMessage(notificationMsg)
                .build();
    }

    public DispatchRecommendation getLastRecommendation() {
        if (lastRecommendation == null) {
            TelemetrySnapshot snapshot = telemetryService.getLatestSnapshot();
            lastRecommendation = evaluate(snapshot);
        }
        return lastRecommendation;
    }

    private void persistEvent(DispatchRecommendation rec) {
        try {
            DispatchEvent event = DispatchEvent.builder()
                    .eventTimestamp(rec.getTimestamp())
                    .eventType(rec.getAnomalyType())
                    .triggerCondition(rec.getSeverity() + " | Load: " +
                            rec.getCampusLoadKw() + "kW | Gen: " + rec.getTotalGenerationKw() + "kW")
                    .peakReductionKw(BigDecimal.valueOf(rec.getProjectedPeakReductionKw()))
                    .costSavedInr(BigDecimal.valueOf(rec.getEstimatedCostSavedInr()))
                    .carbonAvoidedKg(BigDecimal.valueOf(rec.getEstimatedCarbonAvoidedKg()))
                    .status(DispatchEvent.EventStatus.PENDING)
                    .build();
            dispatchEventRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to persist dispatch event: {}", e.getMessage());
        }
    }

    private double round2(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
