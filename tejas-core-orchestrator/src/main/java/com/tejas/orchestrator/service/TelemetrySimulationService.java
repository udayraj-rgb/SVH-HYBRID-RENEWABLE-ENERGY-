package com.tejas.orchestrator.service;

import com.tejas.orchestrator.entity.Campus;
import com.tejas.orchestrator.entity.TelemetryReading;
import com.tejas.orchestrator.repository.CampusRepository;
import com.tejas.orchestrator.repository.TelemetryReadingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class TelemetrySimulationService {

    private static final Logger log = LoggerFactory.getLogger(TelemetrySimulationService.class);

    private final CampusRepository campusRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.simulation.enabled:true}")
    private boolean simulationEnabled;

    public TelemetrySimulationService(CampusRepository campusRepository,
                                      TelemetryReadingRepository telemetryReadingRepository,
                                      SimpMessagingTemplate messagingTemplate) {
        this.campusRepository = campusRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Periodic background simulation task executing across all Rajasthan campuses.
     */
    @Scheduled(fixedRateString = "${app.simulation.interval-ms:60000}")
    public void runScheduledSimulation() {
        if (!simulationEnabled) {
            return;
        }

        try {
            List<Map<String, Object>> results = simulateCycle();
            log.info("Telemetry simulator completed periodic tick for {} campuses.", results.size());
        } catch (Exception ex) {
            log.error("Telemetry simulation scheduled run encountered an error: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Executes one synchronized simulation cycle across all registered campuses.
     * Computes physically realistic solar, wind, campus load, battery SoC, and grid exchange.
     */
    @Transactional
    public List<Map<String, Object>> simulateCycle() {
        List<Campus> campuses = campusRepository.findAll();
        List<Map<String, Object>> summaryList = new ArrayList<>();

        LocalTime now = LocalTime.now();
        double hourDecimal = now.getHour() + (now.getMinute() / 60.0);
        LocalDateTime currentTimestamp = LocalDateTime.now();

        // Western high-wind desert district codes
        Set<String> westernDistricts = Set.of("BKN", "JDH", "BME", "NGO", "PALI", "CUR");

        for (Campus campus : campuses) {
            String districtCode = campus.getDistrict() != null ? campus.getDistrict().getCode() : "JPR";

            // 1. SOLAR GENERATION (Diurnal Bell Curve)
            // Sunrise ~06:00, Peak 11:30 - 14:00, Sunset ~18:30
            double solarKw = 0.0;
            if (hourDecimal >= 6.0 && hourDecimal <= 18.5) {
                double progress = (hourDecimal - 6.0) / (18.5 - 6.0); // 0.0 to 1.0
                double sunAngle = Math.sin(progress * Math.PI);
                double diurnalFactor = Math.pow(Math.max(0.0, sunAngle), 1.15);

                // Slight cloud fluctuation +/- 4%
                double cloudNoise = 0.96 + (Math.random() * 0.08);
                solarKw = Math.round(campus.getSolarCapacityKw() * diurnalFactor * cloudNoise * 10.0) / 10.0;
                solarKw = Math.min(campus.getSolarCapacityKw(), Math.max(0.0, solarKw));
            }

            // 2. WIND GENERATION (Regional geographic modeling)
            double windBaseRatio = westernDistricts.contains(districtCode)
                    ? 0.45 + (Math.random() * 0.35)  // 45% - 80% capacity in Western Thar regions
                    : 0.15 + (Math.random() * 0.25); // 15% - 40% in Eastern/Southern plains
            double windKw = Math.round(campus.getWindCapacityKw() * windBaseRatio * 10.0) / 10.0;
            windKw = Math.min(campus.getWindCapacityKw(), Math.max(0.0, windKw));

            // 3. CAMPUS LOAD PROFILE (Academic & residential cycles)
            double loadRatio;
            if (hourDecimal >= 8.5 && hourDecimal <= 17.5) {
                // Peak Academic & Laboratory hours (8:30 AM - 5:30 PM)
                loadRatio = 0.68 + (Math.random() * 0.22); // 68% - 90%
            } else if (hourDecimal > 17.5 && hourDecimal <= 23.0) {
                // Evening hostel & library lighting hours (5:30 PM - 11:00 PM)
                loadRatio = 0.52 + (Math.random() * 0.20); // 52% - 72%
            } else if (hourDecimal >= 6.0 && hourDecimal < 8.5) {
                // Morning ramp-up (6:00 AM - 8:30 AM)
                loadRatio = 0.38 + (Math.random() * 0.15); // 38% - 53%
            } else {
                // Night minimum baseload (11:00 PM - 6:00 AM)
                loadRatio = 0.22 + (Math.random() * 0.10); // 22% - 32%
            }

            double campusLoadKw = Math.round(campus.getSanctionedLoadKw() * loadRatio * 10.0) / 10.0;

            // 4. POWER BALANCE, BATTERY SOC & GRID IMPORT/EXPORT
            double cleanGenerationKw = Math.round((solarKw + windKw) * 10.0) / 10.0;
            double netPowerKw = Math.round((cleanGenerationKw - campusLoadKw) * 10.0) / 10.0;

            Optional<TelemetryReading> prevReadingOpt =
                    telemetryReadingRepository.findTopByCampusIdOrderByTimestampDesc(campus.getId());
            double previousSoc = prevReadingOpt.map(TelemetryReading::getBatterySocPct).orElse(72.0);

            double batterySocPct;
            double gridImportKw;
            double gridExportKw;

            double batteryCapacityKwh = campus.getBatteryCapacityKwh() > 0 ? campus.getBatteryCapacityKwh() : 100.0;

            if (netPowerKw >= 0) {
                // Surplus green generation -> Charge battery, export remaining
                double chargeDeltaSoc = ((netPowerKw * 0.25) / batteryCapacityKwh) * 100.0;
                batterySocPct = Math.min(98.0, Math.round((previousSoc + chargeDeltaSoc) * 10.0) / 10.0);

                double batteryAbsorbedKw = Math.min(netPowerKw, batteryCapacityKwh * 0.40);
                double excessExport = Math.max(0.0, netPowerKw - batteryAbsorbedKw);

                gridExportKw = Math.round(excessExport * 10.0) / 10.0;
                gridImportKw = 0.0;
            } else {
                // Deficit green generation -> Discharge battery down to 25% floor, import rest
                double deficitKw = Math.abs(netPowerKw);
                double availableBatteryDischarge = previousSoc > 25.0
                        ? Math.min(deficitKw, batteryCapacityKwh * 0.40)
                        : 0.0;

                double dischargeDeltaSoc = ((availableBatteryDischarge * 0.25) / batteryCapacityKwh) * 100.0;
                batterySocPct = Math.max(25.0, Math.round((previousSoc - dischargeDeltaSoc) * 10.0) / 10.0);

                double unmetDeficit = Math.max(0.0, deficitKw - availableBatteryDischarge);
                gridImportKw = Math.round(unmetDeficit * 10.0) / 10.0;
                gridExportKw = 0.0;
            }

            TelemetryReading reading = TelemetryReading.builder()
                    .campus(campus)
                    .timestamp(currentTimestamp)
                    .solarKw(solarKw)
                    .windKw(windKw)
                    .campusLoadKw(campusLoadKw)
                    .batterySocPct(batterySocPct)
                    .gridImportKw(gridImportKw)
                    .gridExportKw(gridExportKw)
                    .build();

            TelemetryReading saved = telemetryReadingRepository.save(reading);

            Map<String, Object> campusResult = new LinkedHashMap<>();
            campusResult.put("campusId", campus.getId());
            campusResult.put("campusName", campus.getName());
            campusResult.put("solarKw", saved.getSolarKw());
            campusResult.put("windKw", saved.getWindKw());
            campusResult.put("campusLoadKw", saved.getCampusLoadKw());
            campusResult.put("batterySocPct", saved.getBatterySocPct());
            campusResult.put("gridImportKw", saved.getGridImportKw());
            campusResult.put("gridExportKw", saved.getGridExportKw());
            campusResult.put("readingId", saved.getId());
            summaryList.add(campusResult);

            if (messagingTemplate != null) {
                try {
                    messagingTemplate.convertAndSend("/topic/campus/" + campus.getId() + "/live-telemetry", campusResult);
                } catch (Exception ex) {
                    log.debug("Could not broadcast live telemetry for campus {}: {}", campus.getId(), ex.getMessage());
                }
            }
        }

        // Broadcast aggregated statewide rollup to /topic/statewide/rollup
        if (messagingTemplate != null && !summaryList.isEmpty()) {
            try {
                double totalSolarKw = summaryList.stream().mapToDouble(m -> (Double) m.get("solarKw")).sum();
                double totalWindKw = summaryList.stream().mapToDouble(m -> (Double) m.get("windKw")).sum();
                double totalLoadKw = summaryList.stream().mapToDouble(m -> (Double) m.get("campusLoadKw")).sum();
                double totalImportKw = summaryList.stream().mapToDouble(m -> (Double) m.get("gridImportKw")).sum();
                double totalExportKw = summaryList.stream().mapToDouble(m -> (Double) m.get("gridExportKw")).sum();
                double totalCleanKw = Math.round((totalSolarKw + totalWindKw) * 10.0) / 10.0;
                double greenMixPct = totalLoadKw > 0 ? Math.min(100.0, Math.round((totalCleanKw / totalLoadKw) * 1000.0) / 10.0) : 100.0;

                Map<String, Object> statewideRollup = new LinkedHashMap<>();
                statewideRollup.put("timestamp", LocalDateTime.now());
                statewideRollup.put("campusesCount", summaryList.size());
                statewideRollup.put("totalSolarKw", Math.round(totalSolarKw * 10.0) / 10.0);
                statewideRollup.put("totalWindKw", Math.round(totalWindKw * 10.0) / 10.0);
                statewideRollup.put("totalCleanKw", totalCleanKw);
                statewideRollup.put("totalCampusLoadKw", Math.round(totalLoadKw * 10.0) / 10.0);
                statewideRollup.put("totalGridImportKw", Math.round(totalImportKw * 10.0) / 10.0);
                statewideRollup.put("totalGridExportKw", Math.round(totalExportKw * 10.0) / 10.0);
                statewideRollup.put("statewideGreenMixPct", greenMixPct);

                messagingTemplate.convertAndSend("/topic/statewide/rollup", statewideRollup);
            } catch (Exception ex) {
                log.debug("Could not broadcast statewide rollup: {}", ex.getMessage());
            }
        }

        return summaryList;
    }
}
