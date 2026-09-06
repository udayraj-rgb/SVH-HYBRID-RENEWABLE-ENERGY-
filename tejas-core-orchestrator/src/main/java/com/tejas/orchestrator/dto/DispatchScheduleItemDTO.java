package com.tejas.orchestrator.dto;

import com.tejas.orchestrator.entity.DispatchAction;

public class DispatchScheduleItemDTO {

    private Integer hour;
    private String timeSlot;
    private String tariffWindow;
    private Double tariffRateInr;
    private Double predictedSolarKw;
    private Double predictedWindKw;
    private Double predictedLoadKw;
    private DispatchAction recommendedAction;
    private Double batteryTargetSocPct;
    private Double batteryDischargeKw;
    private Double batteryChargeKw;
    private Double estimatedGridImportKw;
    private Double estimatedGridExportKw;
    private Double estimatedGridCostInr;
    private Double estimatedSavingsInr;
    private String advisorySummaryEn;
    private String advisorySummaryHi;

    public DispatchScheduleItemDTO() {
    }

    public Integer getHour() { return hour; }
    public void setHour(Integer hour) { this.hour = hour; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getTariffWindow() { return tariffWindow; }
    public void setTariffWindow(String tariffWindow) { this.tariffWindow = tariffWindow; }

    public Double getTariffRateInr() { return tariffRateInr; }
    public void setTariffRateInr(Double tariffRateInr) { this.tariffRateInr = tariffRateInr; }

    public Double getPredictedSolarKw() { return predictedSolarKw; }
    public void setPredictedSolarKw(Double predictedSolarKw) { this.predictedSolarKw = predictedSolarKw; }

    public Double getPredictedWindKw() { return predictedWindKw; }
    public void setPredictedWindKw(Double predictedWindKw) { this.predictedWindKw = predictedWindKw; }

    public Double getPredictedLoadKw() { return predictedLoadKw; }
    public void setPredictedLoadKw(Double predictedLoadKw) { this.predictedLoadKw = predictedLoadKw; }

    public DispatchAction getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(DispatchAction recommendedAction) { this.recommendedAction = recommendedAction; }

    public Double getBatteryTargetSocPct() { return batteryTargetSocPct; }
    public void setBatteryTargetSocPct(Double batteryTargetSocPct) { this.batteryTargetSocPct = batteryTargetSocPct; }

    public Double getBatteryDischargeKw() { return batteryDischargeKw; }
    public void setBatteryDischargeKw(Double batteryDischargeKw) { this.batteryDischargeKw = batteryDischargeKw; }

    public Double getBatteryChargeKw() { return batteryChargeKw; }
    public void setBatteryChargeKw(Double batteryChargeKw) { this.batteryChargeKw = batteryChargeKw; }

    public Double getEstimatedGridImportKw() { return estimatedGridImportKw; }
    public void setEstimatedGridImportKw(Double estimatedGridImportKw) { this.estimatedGridImportKw = estimatedGridImportKw; }

    public Double getEstimatedGridExportKw() { return estimatedGridExportKw; }
    public void setEstimatedGridExportKw(Double estimatedGridExportKw) { this.estimatedGridExportKw = estimatedGridExportKw; }

    public Double getEstimatedGridCostInr() { return estimatedGridCostInr; }
    public void setEstimatedGridCostInr(Double estimatedGridCostInr) { this.estimatedGridCostInr = estimatedGridCostInr; }

    public Double getEstimatedSavingsInr() { return estimatedSavingsInr; }
    public void setEstimatedSavingsInr(Double estimatedSavingsInr) { this.estimatedSavingsInr = estimatedSavingsInr; }

    public String getAdvisorySummaryEn() { return advisorySummaryEn; }
    public void setAdvisorySummaryEn(String advisorySummaryEn) { this.advisorySummaryEn = advisorySummaryEn; }

    public String getAdvisorySummaryHi() { return advisorySummaryHi; }
    public void setAdvisorySummaryHi(String advisorySummaryHi) { this.advisorySummaryHi = advisorySummaryHi; }
}
