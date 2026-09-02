package com.tejas.orchestrator.service;

import com.tejas.orchestrator.dto.OrchestratorStatusResponse;
import com.tejas.orchestrator.dto.TelemetryDto;
import com.tejas.orchestrator.entity.DispatchEvent;
import com.tejas.orchestrator.entity.HostelBlock;
import com.tejas.orchestrator.entity.Student;
import com.tejas.orchestrator.repository.DispatchEventRepository;
import com.tejas.orchestrator.repository.HostelBlockRepository;
import com.tejas.orchestrator.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrchestrationService {

    private static final Logger log = LoggerFactory.getLogger(OrchestrationService.class);

    private final DispatchEventRepository dispatchEventRepository;
    private final HostelBlockRepository hostelBlockRepository;
    private final StudentRepository studentRepository;
    private final RestTemplate restTemplate;
    private final TwilioAlertService twilioAlertService;

    @Value("${fastapi.service.url:http://localhost:8000}")
    private String fastApiUrl;

    // Baseline historical solar peak (1200 kW nominal midday)
    private static final double NOMINAL_SOLAR_PEAK_KW = 1200.0;
    private static final double CRITICAL_SOC_THRESHOLD = 30.0;
    private static final double MAX_BATTERY_DISCHARGE_CAP_KW = 250.0;
    private static final double PEAK_TARIFF_INR_PER_KWH = 12.50;

    public OrchestrationService(DispatchEventRepository dispatchEventRepository,
                                HostelBlockRepository hostelBlockRepository,
                                StudentRepository studentRepository,
                                RestTemplate restTemplate,
                                TwilioAlertService twilioAlertService) {
        this.dispatchEventRepository = dispatchEventRepository;
        this.hostelBlockRepository = hostelBlockRepository;
        this.studentRepository = studentRepository;
        this.restTemplate = restTemplate;
        this.twilioAlertService = twilioAlertService;
    }

    /**
     * Fetch live telemetry from FastAPI microservice with graceful fallback.
     */
    public TelemetryDto fetchLiveTelemetry() {
        String endpoint = fastApiUrl + "/api/telemetry/live";
        try {
            TelemetryDto dto = restTemplate.getForObject(endpoint, TelemetryDto.class);
            if (dto != null) {
                return dto;
            }
        } catch (Exception exc) {
            log.warn("Failed fetching live telemetry from FastAPI ({}): {}. Using fallback telemetry.", endpoint, exc.getMessage());
        }

        // Resilient fallback telemetry if FastAPI is offline
        return new TelemetryDto(
                LocalDateTime.now().toString(),
                420.0, // solar
                75.0,  // wind
                495.0, // total
                680.0, // load
                -185.0, // net
                28.5,  // SoC
                true,  // cloud cover drop
                "orchestrator_internal_fallback"
        );
    }

    /**
     * Core Deterministic Safety & Dispatch Evaluation Engine.
     */
    @Transactional
    public OrchestratorStatusResponse evaluateGridHealth() {
        TelemetryDto telemetry = fetchLiveTelemetry();
        return evaluateGridWithTelemetry(telemetry, null);
    }

    /**
     * Overload supporting simulated Battery SoC for deterministic safety reserve testing.
     */
    @Transactional
    public OrchestratorStatusResponse evaluateGridHealthWithSimulatedSoc(Double simulatedSoc) {
        TelemetryDto telemetry = fetchLiveTelemetry();
        return evaluateGridWithTelemetry(telemetry, simulatedSoc);
    }

    private OrchestratorStatusResponse evaluateGridWithTelemetry(TelemetryDto telemetry, Double overrideSoc) {
        double solarKw = Optional.ofNullable(telemetry.getSolarGenerationKw()).orElse(0.0);
        double windKw = Optional.ofNullable(telemetry.getWindGenerationKw()).orElse(0.0);
        double loadKw = Optional.ofNullable(telemetry.getCampusLoadKw()).orElse(550.0);
        double soc = overrideSoc != null ? overrideSoc : Optional.ofNullable(telemetry.getBatterySocPercent()).orElse(50.0);
        boolean cloudDrop = Boolean.TRUE.equals(telemetry.getCloudCoverDrop());

        double totalGeneration = solarKw + windKw;
        double deficit = Math.max(0.0, loadKw - totalGeneration);

        // Check anomaly trigger: deficit > 150 kW OR solar dropped by > 40% (cloud cover drop)
        boolean hasHighDeficit = deficit > 150.0;
        boolean hasSolarDrop = cloudDrop || (solarKw < (NOMINAL_SOLAR_PEAK_KW * 0.60) && solarKw > 0.0);

        double batteryDischargeKw = 0.0;
        boolean criticalReserveLocked = false;
        StringBuilder recommendation = new StringBuilder();
        double loadShiftedKw = 0.0;
        double costSavedInr = 0.0;
        String gridStatus;

        if (hasHighDeficit || hasSolarDrop) {
            gridStatus = "DEFICIT_DETECTED";
            double desiredDischarge = Math.min(deficit, MAX_BATTERY_DISCHARGE_CAP_KW);

            // ==========================================
            // DETERMINISTIC SAFETY ENGINE: 30% RESERVE LOCK
            // ==========================================
            if (soc <= CRITICAL_SOC_THRESHOLD) {
                batteryDischargeKw = 0.0;
                criticalReserveLocked = true;
                recommendation.append("CRITICAL LAB RESERVE LOCKED (30% Emergency Threshold). Battery discharge restricted to protect research servers. ");
            } else {
                batteryDischargeKw = desiredDischarge;
                criticalReserveLocked = false;
                recommendation.append(String.format("Battery discharging at %.1f kW to mitigate grid deficit. ", batteryDischargeKw));
            }

            // Demand-side management recommendation
            loadShiftedKw = 60.0;
            recommendation.append("Shift non-critical water pumping to 16:00 (-60 kW).");

            // Peak tariff avoidance savings
            costSavedInr = Math.round(deficit * PEAK_TARIFF_INR_PER_KWH * 100.0) / 100.0;

            // ==========================================
            // PHASE 4: TWILIO WHATSAPP GREEN HOUR BROADCAST
            // ==========================================
            try {
                twilioAlertService.broadcastToOptedInStudents(Math.round(deficit * 100.0) / 100.0);
            } catch (Exception exc) {
                log.error("Error during WhatsApp broadcast: {}", exc.getMessage());
            }

        } else {
            gridStatus = "BALANCED";
            batteryDischargeKw = 0.0;
            criticalReserveLocked = (soc <= CRITICAL_SOC_THRESHOLD);
            recommendation.append("Grid stable. Solar and wind generation currently meet campus load requirements.");
        }

        // Persist DispatchEvent
        DispatchEvent event = DispatchEvent.builder()
                .timestamp(LocalDateTime.now())
                .status("PENDING")
                .solarDeficitKw(Math.round(deficit * 100.0) / 100.0)
                .batteryDischargeKw(Math.round(batteryDischargeKw * 100.0) / 100.0)
                .loadShiftedKw(loadShiftedKw)
                .costSavedInr(costSavedInr)
                .criticalReserveLocked(criticalReserveLocked)
                .recommendationText(recommendation.toString())
                .build();

        DispatchEvent savedEvent = dispatchEventRepository.save(event);

        return OrchestratorStatusResponse.builder()
                .gridStatus(gridStatus)
                .campusLoadKw(Math.round(loadKw * 100.0) / 100.0)
                .totalGenerationKw(Math.round(totalGeneration * 100.0) / 100.0)
                .solarGenerationKw(Math.round(solarKw * 100.0) / 100.0)
                .windGenerationKw(Math.round(windKw * 100.0) / 100.0)
                .deficitKw(Math.round(deficit * 100.0) / 100.0)
                .batterySocPercent(Math.round(soc * 100.0) / 100.0)
                .batteryDischargeKw(Math.round(batteryDischargeKw * 100.0) / 100.0)
                .criticalReserveLocked(criticalReserveLocked)
                .recommendation(recommendation.toString())
                .estimatedCostSavedInr(costSavedInr)
                .activeDispatchEvent(savedEvent)
                .build();
    }

    /**
     * Execute the active dispatch event, award Karma points to students, and update hostels.
     */
    @Transactional
    public DispatchEvent executeActiveDispatch() {
        Optional<DispatchEvent> latestEventOpt = dispatchEventRepository.findTopByOrderByTimestampDesc();
        if (latestEventOpt.isEmpty()) {
            throw new IllegalStateException("No active dispatch event available to execute.");
        }

        DispatchEvent event = latestEventOpt.get();
        event.setStatus("EXECUTED");
        DispatchEvent updatedEvent = dispatchEventRepository.save(event);

        // Distribute Karma Points (+50 points to all students who opted-in to WhatsApp alerts)
        List<Student> optedInStudents = studentRepository.findByWhatsappOptInTrue();
        for (Student student : optedInStudents) {
            student.setKarmaPoints(student.getKarmaPoints() + 50);
        }
        studentRepository.saveAll(optedInStudents);

        // Credit cumulative energy saving to hostels
        double kwhBonus = event.getLoadShiftedKw() != null ? event.getLoadShiftedKw() * 0.5 : 30.0;
        List<HostelBlock> hostels = hostelBlockRepository.findAll();
        for (HostelBlock hostel : hostels) {
            hostel.setCumulativeSavedKwh(hostel.getCumulativeSavedKwh() + kwhBonus);
            hostel.setCurrentKarmaPoints(hostel.getCurrentKarmaPoints() + 150);
        }
        hostelBlockRepository.saveAll(hostels);

        log.info("DispatchEvent #{} EXECUTED. Distributed 50 Karma points to {} students.", event.getId(), optedInStudents.size());
        return updatedEvent;
    }
}
