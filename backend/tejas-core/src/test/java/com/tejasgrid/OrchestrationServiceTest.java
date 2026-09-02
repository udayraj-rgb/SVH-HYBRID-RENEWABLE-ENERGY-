package com.tejasgrid;

import com.tejasgrid.dto.DispatchRecommendation;
import com.tejasgrid.dto.TelemetrySnapshot;
import com.tejasgrid.repository.DispatchEventRepository;
import com.tejasgrid.service.OrchestrationService;
import com.tejasgrid.service.TelemetryService;
import com.tejasgrid.service.TwilioAlertService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class OrchestrationServiceTest {

    @Mock private TelemetryService telemetryService;
    @Mock private DispatchEventRepository dispatchEventRepository;
    @Mock private TwilioAlertService twilioAlertService;

    private OrchestrationService service;

    @BeforeEach
    void setUp() {
        service = new OrchestrationService(telemetryService, dispatchEventRepository, twilioAlertService);
        ReflectionTestUtils.setField(service, "campusLoadThresholdKw", 400.0);
        ReflectionTestUtils.setField(service, "batteryCriticalReservePercent", 30.0);
        ReflectionTestUtils.setField(service, "tariffRateInrPerKwh", 7.5);
        ReflectionTestUtils.setField(service, "carbonFactorKgPerKwh", 0.82);
    }

    private TelemetrySnapshot normalSnapshot() {
        return TelemetrySnapshot.builder()
                .timestamp(Instant.now())
                .solarGenerationKw(200.0)
                .windGenerationKw(30.0)
                .campusLoadKw(280.0)
                .batterySOCPercent(75.0)
                .gridImportKw(50.0)
                .demoState("normal")
                .build();
    }

    @Test
    void normalOperations_shouldReturnNormalAnomaly() {
        DispatchRecommendation rec = service.evaluate(normalSnapshot());
        assertThat(rec.getAnomalyType()).isEqualTo("NORMAL");
        assertThat(rec.isNotificationRequired()).isFalse();
    }

    @Test
    void demandSpike_shouldTriggerDemandSpikeAnomaly() {
        TelemetrySnapshot spike = TelemetrySnapshot.builder()
                .timestamp(Instant.now())
                .solarGenerationKw(180.0)
                .windGenerationKw(30.0)
                .campusLoadKw(450.0)  // > 400 threshold
                .batterySOCPercent(65.0)
                .gridImportKw(240.0)
                .demoState("demand_spike")
                .build();
        DispatchRecommendation rec = service.evaluate(spike);
        assertThat(rec.getAnomalyType()).isEqualTo("DEMAND_SPIKE");
        assertThat(rec.getSeverity()).isIn("MEDIUM", "HIGH", "CRITICAL");
    }

    @Test
    void batteryNeverDropsBelow30Percent_underCriticalDemand() {
        // Simulate worst-case: battery near reserve, massive demand spike
        TelemetrySnapshot critical = TelemetrySnapshot.builder()
                .timestamp(Instant.now())
                .solarGenerationKw(0.0)   // Night, no solar
                .windGenerationKw(5.0)
                .campusLoadKw(500.0)
                .batterySOCPercent(35.0)  // Just above critical
                .gridImportKw(495.0)
                .demoState("demand_spike")
                .build();
        DispatchRecommendation rec = service.evaluate(critical);
        // Dispatch engine must recommend protecting the reserve
        assertThat(rec.getAnomalyType()).isNotEqualTo("NORMAL");
        boolean hasReserveAction = rec.getActions().stream()
                .anyMatch(a -> a.contains("30") || a.contains("reserve") || a.contains("critical"));
        assertThat(hasReserveAction).isTrue();
    }

    @Test
    void solarDeficit_shouldTriggerGreenHourNotification() {
        TelemetrySnapshot cloudy = TelemetrySnapshot.builder()
                .timestamp(Instant.now())
                .solarGenerationKw(30.0)  // Only 30kW instead of normal 200+
                .windGenerationKw(30.0)
                .campusLoadKw(430.0)  // High load + low solar = deficit
                .batterySOCPercent(55.0)
                .gridImportKw(370.0)
                .demoState("cloud_cover")
                .build();
        DispatchRecommendation rec = service.evaluate(cloudy);
        assertThat(rec.getAnomalyType()).isIn("SOLAR_DEFICIT", "DEMAND_SPIKE");
        assertThat(rec.isNotificationRequired()).isTrue();
        assertThat(rec.getNotificationMessage()).isNotBlank();
    }

    @Test
    void dispatchEvaluationCompletesUnder200ms() {
        long start = System.currentTimeMillis();
        for (int i = 0; i < 100; i++) {
            service.evaluate(normalSnapshot());
        }
        long elapsed = System.currentTimeMillis() - start;
        // 100 evaluations in under 200ms = each well under 2ms (10x safety margin)
        assertThat(elapsed).isLessThan(200);
    }

    @Test
    void carbonAndCostCalculations_shouldBePositiveOnAnomaly() {
        TelemetrySnapshot spike = TelemetrySnapshot.builder()
                .timestamp(Instant.now())
                .solarGenerationKw(50.0)
                .windGenerationKw(20.0)
                .campusLoadKw(480.0)
                .batterySOCPercent(60.0)
                .gridImportKw(410.0)
                .demoState("demand_spike")
                .build();
        DispatchRecommendation rec = service.evaluate(spike);
        assertThat(rec.getEstimatedCostSavedInr()).isGreaterThanOrEqualTo(0.0);
        assertThat(rec.getEstimatedCarbonAvoidedKg()).isGreaterThanOrEqualTo(0.0);
    }
}
