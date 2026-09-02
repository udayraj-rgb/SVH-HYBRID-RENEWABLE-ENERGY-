package com.tejasgrid.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DispatchRecommendation {
    private String eventId;         // UUID string
    private Instant timestamp;
    private String anomalyType;     // "SOLAR_DEFICIT", "DEMAND_SPIKE", "BATTERY_LOW", "NORMAL"
    private String severity;        // "LOW", "MEDIUM", "HIGH", "CRITICAL"
    private double campusLoadKw;
    private double totalGenerationKw;
    private double batterySocPercent;
    private double projectedPeakReductionKw;
    private double estimatedCostSavedInr;
    private double estimatedCarbonAvoidedKg;
    private List<String> actions;   // Human-readable action list
    private boolean notificationRequired;
    private String notificationMessage;
}
