package com.tejas.orchestrator.service;

import com.tejas.orchestrator.entity.Campus;
import com.tejas.orchestrator.entity.TelemetryReading;
import com.tejas.orchestrator.repository.CampusRepository;
import com.tejas.orchestrator.repository.TelemetryReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ExecutiveReportService {

    private final CampusRepository campusRepository;
    private final TelemetryReadingRepository telemetryReadingRepository;

    public ExecutiveReportService(CampusRepository campusRepository,
                                  TelemetryReadingRepository telemetryReadingRepository) {
        this.campusRepository = campusRepository;
        this.telemetryReadingRepository = telemetryReadingRepository;
    }

    /**
     * Generates comprehensive accreditation metrics formatted for NAAC Criterion 7.1.2:
     * - Alternate Sources of Energy & Energy Conservation Measures
     * Computes installed capacities (Solar, Wind, Battery), annual clean generation (kWh),
     * avoided utility billing expenditures (₹), and Scope 2 carbon emissions displaced (MT CO2e).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getNaacCriterionSummary() {
        List<Campus> campuses = campusRepository.findAll();

        double totalSolarCapacityKw = 0.0;
        double totalWindCapacityKw = 0.0;
        double totalBatteryCapacityKwh = 0.0;
        double totalAnnualCleanKwh = 0.0;
        double totalAnnualAvoidedCostInr = 0.0;
        double totalAnnualScope2Mt = 0.0;

        List<Map<String, Object>> campusAudits = new ArrayList<>();

        for (Campus c : campuses) {
            double solarKw = c.getSolarCapacityKw();
            double windKw = c.getWindCapacityKw();
            double batteryKwh = c.getBatteryCapacityKwh();
            double totalCleanKw = solarKw + windKw;

            // Rajasthan high-DNI solar yield: ~1380 kWh/kW/year (300 days x 4.6 kWh/kW/day)
            // Regional desert wind yield: ~960 kWh/kW/year (300 days x 3.2 kWh/kW/day)
            double annualSolarKwh = solarKw * 1380.0;
            double annualWindKwh = windKw * 960.0;
            double annualCleanKwh = Math.round((annualSolarKwh + annualWindKwh) * 10.0) / 10.0;

            // Avoided institutional electricity cost at RERC high-tension base tariff (₹7.50 / kWh)
            double annualAvoidedInr = Math.round(annualCleanKwh * 7.50 * 100.0) / 100.0;

            // Scope 2 Greenhouse Gas Avoidance under CEA Baseline Database v19.0: 0.820 kg CO2/kWh
            // Displaced in Metric Tonnes CO2 equivalent (MT CO2e = kg / 1000)
            double annualScope2Mt = Math.round(((annualCleanKwh * 0.820) / 1000.0) * 100.0) / 100.0;
            double annualTrees = Math.round(((annualCleanKwh * 0.820) / 21.77) * 10.0) / 10.0;

            String naacStatus = totalCleanKw >= 400.0
                    ? "EXEMPLARY_CONTRIBUTOR"
                    : (totalCleanKw >= 200.0 ? "SIGNIFICANT_CONTRIBUTOR" : "COMMENDED");

            Map<String, Object> audit = new LinkedHashMap<>();
            audit.put("campusId", c.getId());
            audit.put("campusName", c.getName());
            audit.put("district", c.getDistrict() != null ? c.getDistrict().getName() : "Rajasthan");
            audit.put("districtCode", c.getDistrict() != null ? c.getDistrict().getCode() : "RAJ");
            audit.put("sanctionedLoadKw", c.getSanctionedLoadKw());
            audit.put("solarCapacityKw", solarKw);
            audit.put("windCapacityKw", windKw);
            audit.put("batteryCapacityKwh", batteryKwh);
            audit.put("totalCleanCapacityKw", Math.round(totalCleanKw * 10.0) / 10.0);
            audit.put("annualCleanGenerationKwh", annualCleanKwh);
            audit.put("annualAvoidedCostInr", annualAvoidedInr);
            audit.put("annualScope2CarbonDisplacedMt", annualScope2Mt);
            audit.put("equivalentMatureTrees", annualTrees);
            audit.put("naacComplianceTier", naacStatus);

            campusAudits.add(audit);

            totalSolarCapacityKw += solarKw;
            totalWindCapacityKw += windKw;
            totalBatteryCapacityKwh += batteryKwh;
            totalAnnualCleanKwh += annualCleanKwh;
            totalAnnualAvoidedCostInr += annualAvoidedInr;
            totalAnnualScope2Mt += annualScope2Mt;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("criterion", "NAAC Criterion 7.1.2 - Institutional Values and Social Responsibilities");
        response.put("subCategory", "Alternate Sources of Energy & Energy Conservation Measures");
        response.put("governingBody", "Directorate of Technical Education (DTE), Government of Rajasthan");
        response.put("baselineStandard", "Central Electricity Authority (CEA) CO2 Emission Database v19.0 (0.820 kg CO2/kWh)");
        response.put("campusesAudited", campuses.size());
        response.put("statewideSolarCapacityKw", Math.round(totalSolarCapacityKw * 100.0) / 100.0);
        response.put("statewideWindCapacityKw", Math.round(totalWindCapacityKw * 100.0) / 100.0);
        response.put("statewideBatteryCapacityKwh", Math.round(totalBatteryCapacityKwh * 100.0) / 100.0);
        response.put("statewideTotalCleanCapacityKw", Math.round((totalSolarCapacityKw + totalWindCapacityKw) * 100.0) / 100.0);
        response.put("statewideAnnualCleanGenerationKwh", Math.round(totalAnnualCleanKwh * 10.0) / 10.0);
        response.put("statewideAnnualAvoidedCostInr", Math.round(totalAnnualAvoidedCostInr * 100.0) / 100.0);
        response.put("statewideAnnualScope2CarbonDisplacedMt", Math.round(totalAnnualScope2Mt * 100.0) / 100.0);
        response.put("totalTreesEquivalent", Math.round(((totalAnnualCleanKwh * 0.820) / 21.77) * 10.0) / 10.0);
        response.put("campusesAuditList", campusAudits);

        return response;
    }

    /**
     * Ranks all 20 Rajasthan technical campuses by Renewable Self-Consumption Index (%).
     * Self-Consumption Index measures the percentage of on-site generated clean energy
     * that is utilized directly within campus buildings rather than curtailed or exported.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCampusRenewableRanking() {
        List<Campus> campuses = campusRepository.findAll();
        List<Map<String, Object>> rankingCandidates = new ArrayList<>();

        for (Campus c : campuses) {
            Optional<TelemetryReading> readingOpt =
                    telemetryReadingRepository.findTopByCampusIdOrderByTimestampDesc(c.getId());

            double solarKw = readingOpt.map(TelemetryReading::getSolarKw).orElse(c.getSolarCapacityKw() * 0.70);
            double windKw = readingOpt.map(TelemetryReading::getWindKw).orElse(c.getWindCapacityKw() * 0.50);
            double loadKw = readingOpt.map(TelemetryReading::getCampusLoadKw).orElse(c.getSanctionedLoadKw() * 0.65);

            double cleanGenKw = Math.round((solarKw + windKw) * 10.0) / 10.0;
            double selfConsumedKw = Math.min(cleanGenKw, loadKw);

            // Self-consumption ratio: how much generated green energy is consumed on campus
            double selfConsumptionIndexPct = cleanGenKw > 0
                    ? Math.min(100.0, Math.round((selfConsumedKw / cleanGenKw) * 1000.0) / 10.0)
                    : 100.0;

            // Renewable penetration: how much of campus load is satisfied by green generation
            double renewablePenetrationPct = loadKw > 0
                    ? Math.min(100.0, Math.round((cleanGenKw / loadKw) * 1000.0) / 10.0)
                    : 100.0;

            // Combined Eco Score (70% Self-Consumption + 30% Penetration)
            double compositeEcoScore = Math.round((selfConsumptionIndexPct * 0.70 + renewablePenetrationPct * 0.30) * 10.0) / 10.0;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("campusId", c.getId());
            item.put("campusName", c.getName());
            item.put("district", c.getDistrict() != null ? c.getDistrict().getName() : "Rajasthan");
            item.put("districtCode", c.getDistrict() != null ? c.getDistrict().getCode() : "RAJ");
            item.put("solarCapacityKw", c.getSolarCapacityKw());
            item.put("windCapacityKw", c.getWindCapacityKw());
            item.put("totalCleanCapacityKw", c.getSolarCapacityKw() + c.getWindCapacityKw());
            item.put("liveSolarKw", solarKw);
            item.put("liveWindKw", windKw);
            item.put("liveLoadKw", loadKw);
            item.put("selfConsumptionIndexPct", selfConsumptionIndexPct);
            item.put("renewablePenetrationPct", renewablePenetrationPct);
            item.put("compositeEcoScore", compositeEcoScore);

            rankingCandidates.add(item);
        }

        // Sort descending by compositeEcoScore, then by totalCleanCapacityKw
        rankingCandidates.sort((a, b) -> {
            double scoreA = (double) a.get("compositeEcoScore");
            double scoreB = (double) b.get("compositeEcoScore");
            if (Double.compare(scoreB, scoreA) != 0) {
                return Double.compare(scoreB, scoreA);
            }
            double capA = (double) a.get("totalCleanCapacityKw");
            double capB = (double) b.get("totalCleanCapacityKw");
            return Double.compare(capB, capA);
        });

        // Assign ranks and performance tiers
        int rank = 1;
        for (Map<String, Object> entry : rankingCandidates) {
            entry.put("rank", rank);

            String tier;
            String badge;
            if (rank <= 5) {
                tier = "TIER_1_PLATINUM";
                badge = "State Clean Energy Pioneer";
            } else if (rank <= 12) {
                tier = "TIER_2_GOLD";
                badge = "High Self-Consumption Performer";
            } else {
                tier = "TIER_3_SILVER";
                badge = "Developing Green Microgrid";
            }

            entry.put("tier", tier);
            entry.put("distinctionBadge", badge);
            rank++;
        }

        return rankingCandidates;
    }
}
