package com.tejas.orchestrator.service;

import com.tejas.orchestrator.entity.Campus;
import com.tejas.orchestrator.entity.DispatchAction;
import com.tejas.orchestrator.entity.OperationalAdvisory;
import com.tejas.orchestrator.entity.TelemetryReading;
import com.tejas.orchestrator.repository.CampusRepository;
import com.tejas.orchestrator.repository.OperationalAdvisoryRepository;
import com.tejas.orchestrator.repository.TelemetryReadingRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class OperationalAdvisoryService {

    private final OperationalAdvisoryRepository advisoryRepository;
    private final CampusRepository campusRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final TariffCalculationService tariffService;
    private final SimpMessagingTemplate messagingTemplate;

    public OperationalAdvisoryService(OperationalAdvisoryRepository advisoryRepository,
                                      CampusRepository campusRepository,
                                      TelemetryReadingRepository telemetryReadingRepository,
                                      TariffCalculationService tariffService,
                                      SimpMessagingTemplate messagingTemplate) {
        this.advisoryRepository = advisoryRepository;
        this.campusRepository = campusRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
        this.tariffService = tariffService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Retrieves currently active bilingual operational advisories for a campus.
     * If none exist in the database, automatically generates context-aware advisories
     * based on live telemetry, RERC tariff window, and demand levels.
     */
    @Transactional
    public List<OperationalAdvisory> getActiveAdvisories(Long campusId) {
        Campus campus = campusRepository.findById(campusId)
                .orElseThrow(() -> new IllegalArgumentException("Campus not found: " + campusId));

        List<OperationalAdvisory> unackList =
                advisoryRepository.findByCampusIdAndAcknowledgedFalseOrderByTimestampDesc(campusId);

        if (!unackList.isEmpty()) {
            return unackList;
        }

        // Generate fresh situational advisories
        return generateLiveSituationalAdvisories(campus);
    }

    /**
     * Retrieves all active statewide advisories across all technical institutions.
     */
    @Transactional
    public List<OperationalAdvisory> getAllActiveAdvisories() {
        List<OperationalAdvisory> unackList = advisoryRepository.findByAcknowledgedFalseOrderByTimestampDesc();
        if (unackList.isEmpty()) {
            List<Campus> campuses = campusRepository.findAll();
            for (Campus c : campuses) {
                getActiveAdvisories(c.getId());
            }
            return advisoryRepository.findByAcknowledgedFalseOrderByTimestampDesc();
        }
        return unackList;
    }

    /**
     * Acknowledges an active operational advisory.
     */
    @Transactional
    public OperationalAdvisory acknowledgeAdvisory(Long advisoryId, String acknowledgedBy) {
        OperationalAdvisory advisory = advisoryRepository.findById(advisoryId)
                .orElseThrow(() -> new IllegalArgumentException("Advisory not found: " + advisoryId));

        advisory.setAcknowledged(true);
        advisory.setAcknowledgedAt(LocalDateTime.now());
        advisory.setAcknowledgedBy(acknowledgedBy != null ? acknowledgedBy : "operator");

        OperationalAdvisory saved = advisoryRepository.save(advisory);

        if (messagingTemplate != null && saved.getCampus() != null) {
            try {
                messagingTemplate.convertAndSend("/topic/campus/" + saved.getCampus().getId() + "/advisories", saved);
            } catch (Exception ex) {
                // Ignore broadcast error
            }
        }

        return saved;
    }

    /**
     * Computes today's financial summary under statutory RERC Time-of-Day (ToD) tariffs.
     */
    public Map<String, Object> calculateFinancialSummary(Long campusId, String period) {
        Campus campus = campusRepository.findById(campusId)
                .orElseThrow(() -> new IllegalArgumentException("Campus not found: " + campusId));

        Optional<TelemetryReading> latestReadingOpt =
                telemetryReadingRepository.findTopByCampusIdOrderByTimestampDesc(campusId);

        double solarKw = latestReadingOpt.map(TelemetryReading::getSolarKw).orElse(campus.getSolarCapacityKw() * 0.70);
        double windKw = latestReadingOpt.map(TelemetryReading::getWindKw).orElse(campus.getWindCapacityKw() * 0.50);
        double loadKw = latestReadingOpt.map(TelemetryReading::getCampusLoadKw).orElse(campus.getSanctionedLoadKw() * 0.65);
        double batterySoc = latestReadingOpt.map(TelemetryReading::getBatterySocPct).orElse(75.0);

        double cleanGenKw = solarKw + windKw;

        // Daily energy estimates based on 7 effective renewable operating hours
        double estCleanKwhToday = cleanGenKw * 7.0;
        double estAvoidedGridCostInr = estCleanKwhToday * 7.50; // Average base RERC avoided tariff
        double estPeakShavedKw = Math.min(campus.getBatteryCapacityKwh() * 0.40, loadKw * 0.50);
        double estTodPeakSavingsInr = estPeakShavedKw * 4.0 * (TariffCalculationService.RATE_EVENING_PEAK - TariffCalculationService.RATE_NORMAL);
        double estExportRevenueInr = Math.max(0.0, cleanGenKw - loadKw) * 3.5 * TariffCalculationService.RATE_GRID_FEED_IN_EXPORT;

        // Central Electricity Authority (CEA Baseline v19.0): 0.820 kg CO2/kWh
        double carbonAvoidedTodayKg = Math.round(estCleanKwhToday * 0.820 * 10.0) / 10.0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("campusId", campus.getId());
        summary.put("campusName", campus.getName());
        summary.put("period", "today");
        summary.put("currentTariffRateInr", tariffService.getImportRate(LocalTime.now()));
        summary.put("currentTariffWindow", tariffService.getTariffWindowName(LocalTime.now().getHour()));
        summary.put("avoidedGridCostInr", Math.round(estAvoidedGridCostInr * 100.0) / 100.0);
        summary.put("todPeakSavingsInr", Math.round(estTodPeakSavingsInr * 100.0) / 100.0);
        summary.put("exportRevenueInr", Math.round(estExportRevenueInr * 100.0) / 100.0);
        summary.put("totalFinancialBenefitInr", Math.round((estAvoidedGridCostInr + estTodPeakSavingsInr + estExportRevenueInr) * 100.0) / 100.0);
        summary.put("carbonAvoidedTodayKg", carbonAvoidedTodayKg);
        summary.put("equivalentTreesPlanted", Math.round((carbonAvoidedTodayKg / 21.77) * 10.0) / 10.0);
        summary.put("peakDemandShavedKw", Math.round(estPeakShavedKw * 10.0) / 10.0);
        summary.put("rercTariffStructure", "RERC High-Tension (Solar: ₹5.80, Normal: ₹7.50, Peak: ₹9.50, Export: ₹3.14)");

        return summary;
    }

    private List<OperationalAdvisory> generateLiveSituationalAdvisories(Campus campus) {
        List<OperationalAdvisory> advisories = new ArrayList<>();
        LocalTime now = LocalTime.now();
        int hour = now.getHour();

        Optional<TelemetryReading> latestOpt =
                telemetryReadingRepository.findTopByCampusIdOrderByTimestampDesc(campus.getId());
        double currentLoad = latestOpt.map(TelemetryReading::getCampusLoadKw).orElse(campus.getSanctionedLoadKw() * 0.60);
        double solarKw = latestOpt.map(TelemetryReading::getSolarKw).orElse(0.0);

        // 1. Demand Warning if approaching 90% sanctioned load
        if (currentLoad >= (campus.getSanctionedLoadKw() * 0.88)) {
            advisories.add(OperationalAdvisory.builder()
                    .campus(campus)
                    .level("CRITICAL_WARNING")
                    .titleEn("Sanctioned Demand Warning (Overdraw Risk)")
                    .titleHi("अनुबंधित मांग चेतावनी (अतिभार जोखिम)")
                    .messageEn(String.format("Demand Warning: Current load (%.1f kW) is approaching 90%% of Sanctioned Load (%.1f kW). Stagger heavy HVAC/chillers to avoid RERC overdraw penalty.", currentLoad, campus.getSanctionedLoadKw()))
                    .messageHi("अनुबंधित मांग चेतावनी: लोड 90% के करीब, पेनल्टी से बचने के लिए भारी उपकरण बंद करें।")
                    .actionType(DispatchAction.GRID_SUPPORT_IDLE)
                    .build());
        }

        // 2. Evening Peak Surcharge Alert (18:00 - 22:00)
        if (tariffService.isEveningPeak(hour) || (hour == 17 && now.getMinute() >= 30)) {
            advisories.add(OperationalAdvisory.builder()
                    .campus(campus)
                    .level("RECOMMENDED_ACTION")
                    .titleEn("Peak Tariff Approaching (₹9.50/kWh Surcharge)")
                    .titleHi("शाम का पीक टैरिफ (₹9.50/kWh सरचार्ज)")
                    .messageEn("Peak Tariff Approaching: Battery entering peak-shaving discharge mode. Restrict non-critical workshop machinery.")
                    .messageHi("शाम का पीक टैरिफ: गैर-जरूरी मशीनों का उपयोग सीमित करें, बैटरी डिस्चार्ज मोड सक्रिय।")
                    .actionType(DispatchAction.DISCHARGE_PEAK_SHAVING)
                    .build());
        }

        // 3. Solar Surplus & Load-Shifting Opportunity (11:00 - 15:00)
        if ((hour >= 11 && hour <= 15) || solarKw > (campus.getSolarCapacityKw() * 0.40)) {
            advisories.add(OperationalAdvisory.builder()
                    .campus(campus)
                    .level("RECOMMENDED_ACTION")
                    .titleEn("Excess Solar Surge: Trigger Load-Shifting")
                    .titleHi("सौर ऊर्जा अधिशेष: लोड शिफ्टिंग सक्रिय करें")
                    .messageEn("Excess Solar Surge: Run hostel water pumps and EV charging now (11:30 AM - 2:30 PM) to maximize on-campus utilization.")
                    .messageHi("सौर ऊर्जा अधिशेष: कृपया हॉस्टल वाटर पंप और चार्जिंग चालू करें।")
                    .actionType(DispatchAction.LOAD_SHIFT_TRIGGER)
                    .build());
        }

        // 4. Default Microgrid Health Info
        if (advisories.isEmpty()) {
            advisories.add(OperationalAdvisory.builder()
                    .campus(campus)
                    .level("INFO")
                    .titleEn("Microgrid Equilibrium Optimal")
                    .titleHi("माइक्रोग्रिड संतुलन इष्टतम")
                    .messageEn("Microgrid dispatch is operating stably within RERC normal tariff parameters.")
                    .messageHi("माइक्रोग्रिड सामान्य RERC टैरिफ मानकों के तहत स्थिरता से कार्य कर रहा है।")
                    .actionType(DispatchAction.CHARGE_SOLAR)
                    .build());
        }

        List<OperationalAdvisory> savedList = advisoryRepository.saveAll(advisories);

        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/campus/" + campus.getId() + "/advisories", savedList);
            } catch (Exception ex) {
                // Ignore broadcast error
            }
        }

        return savedList;
    }
}
