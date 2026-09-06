package com.tejas.orchestrator.service;

import com.tejas.orchestrator.dto.DispatchScheduleItemDTO;
import com.tejas.orchestrator.dto.WeatherForecastDTO;
import com.tejas.orchestrator.entity.Campus;
import com.tejas.orchestrator.entity.DispatchAction;
import com.tejas.orchestrator.entity.TelemetryReading;
import com.tejas.orchestrator.repository.CampusRepository;
import com.tejas.orchestrator.repository.TelemetryReadingRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MicrogridDispatchOptimizerService {

    private final CampusRepository campusRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;
    private final WeatherForecastService weatherForecastService;
    private final TariffCalculationService tariffService;

    public MicrogridDispatchOptimizerService(CampusRepository campusRepository,
                                            TelemetryReadingRepository telemetryReadingRepository,
                                            WeatherForecastService weatherForecastService,
                                            TariffCalculationService tariffService) {
        this.campusRepository = campusRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
        this.weatherForecastService = weatherForecastService;
        this.tariffService = tariffService;
    }

    /**
     * Generates a 24-hour predictive dispatch optimization plan for a campus microgrid.
     * Aligns with RERC Time-of-Day (ToD) tariff windows to maximize bill savings, shave evening
     * peaks, and preserve battery life (25% - 95% SoC).
     */
    public List<DispatchScheduleItemDTO> generate24HourSchedule(Long campusId) {
        Campus campus = campusRepository.findById(campusId)
                .orElseThrow(() -> new IllegalArgumentException("Campus not found: " + campusId));

        Optional<TelemetryReading> latestReadingOpt =
                telemetryReadingRepository.findTopByCampusIdOrderByTimestampDesc(campusId);

        double currentSoc = latestReadingOpt.map(TelemetryReading::getBatterySocPct).orElse(75.0);
        double batteryCapacityKwh = campus.getBatteryCapacityKwh() > 0 ? campus.getBatteryCapacityKwh() : 200.0;
        double maxCrateKw = batteryCapacityKwh * 0.40; // Max 0.40C discharge/charge power per hour

        WeatherForecastDTO forecast = weatherForecastService.getForecastForCampus(campusId);
        List<WeatherForecastDTO.HourlyForecast> hourlyWeather = forecast.getHourly();

        List<DispatchScheduleItemDTO> schedule = new ArrayList<>();
        double runningSoc = currentSoc;

        for (int h = 0; h < 24; h++) {
            DispatchScheduleItemDTO item = new DispatchScheduleItemDTO();
            item.setHour(h);
            item.setTimeSlot(String.format("%02d:00 - %02d:00", h, (h + 1) % 24));
            item.setTariffWindow(tariffService.getTariffWindowName(h));
            double tariffRate = tariffService.getImportRate(h);
            item.setTariffRateInr(tariffRate);

            // 1. Weather-grounded renewable generation prediction
            double ghi = 0.0;
            double windspeed = 10.0;
            if (hourlyWeather != null && h < hourlyWeather.size()) {
                WeatherForecastDTO.HourlyForecast hf = hourlyWeather.get(h);
                ghi = hf.getShortwaveRadiation() != null ? hf.getShortwaveRadiation() : 0.0;
                windspeed = hf.getWindspeed10m() != null ? hf.getWindspeed10m() : 10.0;
            }

            double predictedSolarKw = 0.0;
            if (h >= 6 && h <= 18) {
                predictedSolarKw = Math.round((ghi / 1000.0) * campus.getSolarCapacityKw() * 0.88 * 10.0) / 10.0;
                predictedSolarKw = Math.min(campus.getSolarCapacityKw(), Math.max(0.0, predictedSolarKw));
            }
            double predictedWindKw = Math.round(campus.getWindCapacityKw() * Math.min(1.0, windspeed / 22.0) * 0.65 * 10.0) / 10.0;
            predictedWindKw = Math.min(campus.getWindCapacityKw(), Math.max(0.0, predictedWindKw));

            item.setPredictedSolarKw(predictedSolarKw);
            item.setPredictedWindKw(predictedWindKw);

            // 2. Diurnal Academic Load Curve
            double loadRatio;
            if (h >= 8 && h <= 17) {
                loadRatio = 0.72; // Academic / Labs
            } else if (h >= 18 && h <= 22) {
                loadRatio = 0.62; // Evening hostel peak
            } else if (h >= 6 && h < 8) {
                loadRatio = 0.40; // Morning ramp
            } else {
                loadRatio = 0.25; // Night baseload
            }
            double predictedLoadKw = Math.round(campus.getSanctionedLoadKw() * loadRatio * 10.0) / 10.0;
            item.setPredictedLoadKw(predictedLoadKw);

            double cleanGenKw = predictedSolarKw + predictedWindKw;
            double netSurplusKw = cleanGenKw - predictedLoadKw;

            // 3. Dispatch Decision Logic
            DispatchAction action;
            double chargeKw = 0.0;
            double dischargeKw = 0.0;
            double gridImportKw = 0.0;
            double gridExportKw = 0.0;

            if (tariffService.isEveningPeak(h)) {
                // Peak Surcharge Window (18:00 - 22:00, ₹9.50/kWh)
                // Discharge battery to avoid peak utility charges down to 25% floor
                double usableSocPct = Math.max(0.0, runningSoc - 25.0);
                double availableEnergyKwh = (usableSocPct / 100.0) * batteryCapacityKwh;
                double deficitKw = Math.max(0.0, predictedLoadKw - cleanGenKw);

                dischargeKw = Math.min(deficitKw, Math.min(maxCrateKw, availableEnergyKwh));
                dischargeKw = Math.round(dischargeKw * 10.0) / 10.0;

                double socDrop = (dischargeKw / batteryCapacityKwh) * 100.0;
                runningSoc = Math.max(25.0, Math.round((runningSoc - socDrop) * 10.0) / 10.0);

                gridImportKw = Math.max(0.0, deficitKw - dischargeKw);
                action = DispatchAction.DISCHARGE_PEAK_SHAVING;

                item.setAdvisorySummaryEn(String.format("Peak Tariff Window: Discharging %.1f kW to avoid ₹%.2f/kWh peak tariff.", dischargeKw, tariffRate));
                item.setAdvisorySummaryHi(String.format("शाम का पीक टैरिफ: ₹%.2f/kWh ग्रिड दर से बचने के लिए %.1f kW बैटरी डिस्चार्ज।", tariffRate, dischargeKw));

            } else if (netSurplusKw > 0) {
                // Renewable Surplus Window
                if (h >= 11 && h <= 14 && netSurplusKw > (campus.getSanctionedLoadKw() * 0.20)) {
                    // Solar generation exceeds demand significantly -> Trigger load-shifting
                    action = DispatchAction.LOAD_SHIFT_TRIGGER;

                    // Charge battery up to 95%
                    double headroomSocPct = Math.max(0.0, 95.0 - runningSoc);
                    double maxChargeEnergy = (headroomSocPct / 100.0) * batteryCapacityKwh;
                    chargeKw = Math.min(netSurplusKw * 0.50, Math.min(maxCrateKw, maxChargeEnergy));
                    chargeKw = Math.round(chargeKw * 10.0) / 10.0;

                    double socRise = (chargeKw / batteryCapacityKwh) * 100.0;
                    runningSoc = Math.min(95.0, Math.round((runningSoc + socRise) * 10.0) / 10.0);

                    gridExportKw = Math.max(0.0, netSurplusKw - chargeKw);
                    item.setAdvisorySummaryEn("Excess Solar Surge: Trigger load-shifting (hostel water pumping, EV charging).");
                    item.setAdvisorySummaryHi("सौर ऊर्जा अधिशेष: लोड शिफ्टिंग सक्रिय करें (हॉस्टल वाटर पंपिंग, वाहन चार्जिंग)।");
                } else if (runningSoc < 95.0) {
                    action = DispatchAction.CHARGE_SOLAR;
                    double headroomSocPct = Math.max(0.0, 95.0 - runningSoc);
                    double maxChargeEnergy = (headroomSocPct / 100.0) * batteryCapacityKwh;
                    chargeKw = Math.min(netSurplusKw, Math.min(maxCrateKw, maxChargeEnergy));
                    chargeKw = Math.round(chargeKw * 10.0) / 10.0;

                    double socRise = (chargeKw / batteryCapacityKwh) * 100.0;
                    runningSoc = Math.min(95.0, Math.round((runningSoc + socRise) * 10.0) / 10.0);

                    gridExportKw = Math.max(0.0, netSurplusKw - chargeKw);
                    item.setAdvisorySummaryEn(String.format("Clean Surplus: Absorbing %.1f kW into battery (SoC %.1f%%).", chargeKw, runningSoc));
                    item.setAdvisorySummaryHi(String.format("अक्षय ऊर्जा अधिशेष: बैटरी में %.1f kW चार्ज किया जा रहा है (SoC %.1f%%)।", chargeKw, runningSoc));
                } else {
                    action = DispatchAction.GRID_SUPPORT_IDLE;
                    gridExportKw = netSurplusKw;
                    item.setAdvisorySummaryEn("Battery Full: Exporting surplus green energy to RERC grid at ₹3.14/kWh.");
                    item.setAdvisorySummaryHi("बैटरी पूर्ण: ₹3.14/kWh पर अतिरिक्त हरित ऊर्जा ग्रिड को निर्यात।");
                }
            } else {
                // Deficit during normal or off-peak hours
                action = DispatchAction.GRID_SUPPORT_IDLE;
                gridImportKw = Math.abs(netSurplusKw);
                item.setAdvisorySummaryEn(String.format("Off-Peak Operations: Preserving battery floor. Grid import at ₹%.2f/kWh.", tariffRate));
                item.setAdvisorySummaryHi(String.format("सामान्य परिचालन: बैटरी रिजर्व सुरक्षित। ₹%.2f/kWh पर आवश्यक ग्रिड आपूर्ति।", tariffRate));
            }

            item.setRecommendedAction(action);
            item.setBatteryTargetSocPct(runningSoc);
            item.setBatteryChargeKw(chargeKw);
            item.setBatteryDischargeKw(dischargeKw);
            item.setEstimatedGridImportKw(Math.round(gridImportKw * 10.0) / 10.0);
            item.setEstimatedGridExportKw(Math.round(gridExportKw * 10.0) / 10.0);

            // Financial Calculations
            double netGridCost = tariffService.calculateHourlyNetCost(h, gridImportKw, gridExportKw);
            double unmanagedCost = predictedLoadKw * tariffRate;
            double savings = Math.max(0.0, Math.round((unmanagedCost - netGridCost) * 100.0) / 100.0);

            item.setEstimatedGridCostInr(netGridCost);
            item.setEstimatedSavingsInr(savings);

            schedule.add(item);
        }

        return schedule;
    }
}
