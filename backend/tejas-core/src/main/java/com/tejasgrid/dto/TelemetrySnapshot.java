package com.tejasgrid.dto;

import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetrySnapshot {
    private Instant timestamp;
    private double solarGenerationKw;
    private double windGenerationKw;
    private double campusLoadKw;
    private double batterySOCPercent;
    private double gridImportKw;
    private String demoState;
}
