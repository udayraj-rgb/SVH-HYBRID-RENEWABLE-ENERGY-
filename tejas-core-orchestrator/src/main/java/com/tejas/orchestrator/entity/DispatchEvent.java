package com.tejas.orchestrator.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispatch_events")
public class DispatchEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String status; // PENDING, EXECUTED, OVERRIDDEN

    @Column(nullable = false)
    private Double solarDeficitKw;

    @Column(nullable = false)
    private Double batteryDischargeKw;

    @Column(nullable = false)
    private Double loadShiftedKw;

    @Column(nullable = false)
    private Double costSavedInr;

    @Column(nullable = false)
    private Boolean criticalReserveLocked;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String recommendationText;

    public DispatchEvent() {
    }

    public DispatchEvent(Long id, LocalDateTime timestamp, String status, Double solarDeficitKw, Double batteryDischargeKw, Double loadShiftedKw, Double costSavedInr, Boolean criticalReserveLocked, String recommendationText) {
        this.id = id;
        this.timestamp = timestamp;
        this.status = status;
        this.solarDeficitKw = solarDeficitKw;
        this.batteryDischargeKw = batteryDischargeKw;
        this.loadShiftedKw = loadShiftedKw;
        this.costSavedInr = costSavedInr;
        this.criticalReserveLocked = criticalReserveLocked;
        this.recommendationText = recommendationText;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private LocalDateTime timestamp;
        private String status;
        private Double solarDeficitKw;
        private Double batteryDischargeKw;
        private Double loadShiftedKw;
        private Double costSavedInr;
        private Boolean criticalReserveLocked;
        private String recommendationText;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder solarDeficitKw(Double solarDeficitKw) { this.solarDeficitKw = solarDeficitKw; return this; }
        public Builder batteryDischargeKw(Double batteryDischargeKw) { this.batteryDischargeKw = batteryDischargeKw; return this; }
        public Builder loadShiftedKw(Double loadShiftedKw) { this.loadShiftedKw = loadShiftedKw; return this; }
        public Builder costSavedInr(Double costSavedInr) { this.costSavedInr = costSavedInr; return this; }
        public Builder criticalReserveLocked(Boolean criticalReserveLocked) { this.criticalReserveLocked = criticalReserveLocked; return this; }
        public Builder recommendationText(String recommendationText) { this.recommendationText = recommendationText; return this; }

        public DispatchEvent build() {
            return new DispatchEvent(id, timestamp, status, solarDeficitKw, batteryDischargeKw, loadShiftedKw, costSavedInr, criticalReserveLocked, recommendationText);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getSolarDeficitKw() { return solarDeficitKw; }
    public void setSolarDeficitKw(Double solarDeficitKw) { this.solarDeficitKw = solarDeficitKw; }

    public Double getBatteryDischargeKw() { return batteryDischargeKw; }
    public void setBatteryDischargeKw(Double batteryDischargeKw) { this.batteryDischargeKw = batteryDischargeKw; }

    public Double getLoadShiftedKw() { return loadShiftedKw; }
    public void setLoadShiftedKw(Double loadShiftedKw) { this.loadShiftedKw = loadShiftedKw; }

    public Double getCostSavedInr() { return costSavedInr; }
    public void setCostSavedInr(Double costSavedInr) { this.costSavedInr = costSavedInr; }

    public Boolean getCriticalReserveLocked() { return criticalReserveLocked; }
    public void setCriticalReserveLocked(Boolean criticalReserveLocked) { this.criticalReserveLocked = criticalReserveLocked; }

    public String getRecommendationText() { return recommendationText; }
    public void setRecommendationText(String recommendationText) { this.recommendationText = recommendationText; }
}
