package com.tejas.orchestrator.dto;

import com.tejas.orchestrator.entity.DispatchEvent;

public class OrchestratorStatusResponse {

    private String gridStatus;
    private Double campusLoadKw;
    private Double totalGenerationKw;
    private Double solarGenerationKw;
    private Double windGenerationKw;
    private Double deficitKw;
    private Double batterySocPercent;
    private Double batteryDischargeKw;
    private Boolean criticalReserveLocked;
    private String recommendation;
    private Double estimatedCostSavedInr;
    private DispatchEvent activeDispatchEvent;

    public OrchestratorStatusResponse() {
    }

    public OrchestratorStatusResponse(String gridStatus, Double campusLoadKw, Double totalGenerationKw, Double solarGenerationKw, Double windGenerationKw, Double deficitKw, Double batterySocPercent, Double batteryDischargeKw, Boolean criticalReserveLocked, String recommendation, Double estimatedCostSavedInr, DispatchEvent activeDispatchEvent) {
        this.gridStatus = gridStatus;
        this.campusLoadKw = campusLoadKw;
        this.totalGenerationKw = totalGenerationKw;
        this.solarGenerationKw = solarGenerationKw;
        this.windGenerationKw = windGenerationKw;
        this.deficitKw = deficitKw;
        this.batterySocPercent = batterySocPercent;
        this.batteryDischargeKw = batteryDischargeKw;
        this.criticalReserveLocked = criticalReserveLocked;
        this.recommendation = recommendation;
        this.estimatedCostSavedInr = estimatedCostSavedInr;
        this.activeDispatchEvent = activeDispatchEvent;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String gridStatus;
        private Double campusLoadKw;
        private Double totalGenerationKw;
        private Double solarGenerationKw;
        private Double windGenerationKw;
        private Double deficitKw;
        private Double batterySocPercent;
        private Double batteryDischargeKw;
        private Boolean criticalReserveLocked;
        private String recommendation;
        private Double estimatedCostSavedInr;
        private DispatchEvent activeDispatchEvent;

        public Builder gridStatus(String gridStatus) { this.gridStatus = gridStatus; return this; }
        public Builder campusLoadKw(Double campusLoadKw) { this.campusLoadKw = campusLoadKw; return this; }
        public Builder totalGenerationKw(Double totalGenerationKw) { this.totalGenerationKw = totalGenerationKw; return this; }
        public Builder solarGenerationKw(Double solarGenerationKw) { this.solarGenerationKw = solarGenerationKw; return this; }
        public Builder windGenerationKw(Double windGenerationKw) { this.windGenerationKw = windGenerationKw; return this; }
        public Builder deficitKw(Double deficitKw) { this.deficitKw = deficitKw; return this; }
        public Builder batterySocPercent(Double batterySocPercent) { this.batterySocPercent = batterySocPercent; return this; }
        public Builder batteryDischargeKw(Double batteryDischargeKw) { this.batteryDischargeKw = batteryDischargeKw; return this; }
        public Builder criticalReserveLocked(Boolean criticalReserveLocked) { this.criticalReserveLocked = criticalReserveLocked; return this; }
        public Builder recommendation(String recommendation) { this.recommendation = recommendation; return this; }
        public Builder estimatedCostSavedInr(Double estimatedCostSavedInr) { this.estimatedCostSavedInr = estimatedCostSavedInr; return this; }
        public Builder activeDispatchEvent(DispatchEvent activeDispatchEvent) { this.activeDispatchEvent = activeDispatchEvent; return this; }

        public OrchestratorStatusResponse build() {
            return new OrchestratorStatusResponse(gridStatus, campusLoadKw, totalGenerationKw, solarGenerationKw, windGenerationKw, deficitKw, batterySocPercent, batteryDischargeKw, criticalReserveLocked, recommendation, estimatedCostSavedInr, activeDispatchEvent);
        }
    }

    public String getGridStatus() { return gridStatus; }
    public void setGridStatus(String gridStatus) { this.gridStatus = gridStatus; }

    public Double getCampusLoadKw() { return campusLoadKw; }
    public void setCampusLoadKw(Double campusLoadKw) { this.campusLoadKw = campusLoadKw; }

    public Double getTotalGenerationKw() { return totalGenerationKw; }
    public void setTotalGenerationKw(Double totalGenerationKw) { this.totalGenerationKw = totalGenerationKw; }

    public Double getSolarGenerationKw() { return solarGenerationKw; }
    public void setSolarGenerationKw(Double solarGenerationKw) { this.solarGenerationKw = solarGenerationKw; }

    public Double getWindGenerationKw() { return windGenerationKw; }
    public void setWindGenerationKw(Double windGenerationKw) { this.windGenerationKw = windGenerationKw; }

    public Double getDeficitKw() { return deficitKw; }
    public void setDeficitKw(Double deficitKw) { this.deficitKw = deficitKw; }

    public Double getBatterySocPercent() { return batterySocPercent; }
    public void setBatterySocPercent(Double batterySocPercent) { this.batterySocPercent = batterySocPercent; }

    public Double getBatteryDischargeKw() { return batteryDischargeKw; }
    public void setBatteryDischargeKw(Double batteryDischargeKw) { this.batteryDischargeKw = batteryDischargeKw; }

    public Boolean getCriticalReserveLocked() { return criticalReserveLocked; }
    public void setCriticalReserveLocked(Boolean criticalReserveLocked) { this.criticalReserveLocked = criticalReserveLocked; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public Double getEstimatedCostSavedInr() { return estimatedCostSavedInr; }
    public void setEstimatedCostSavedInr(Double estimatedCostSavedInr) { this.estimatedCostSavedInr = estimatedCostSavedInr; }

    public DispatchEvent getActiveDispatchEvent() { return activeDispatchEvent; }
    public void setActiveDispatchEvent(DispatchEvent activeDispatchEvent) { this.activeDispatchEvent = activeDispatchEvent; }
}
