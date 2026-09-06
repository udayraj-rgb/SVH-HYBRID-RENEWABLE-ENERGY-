package com.tejas.orchestrator.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_readings")
public class TelemetryReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campus_id", nullable = false)
    @JsonIgnoreProperties({"telemetryReadings", "users", "hostelBlocks"})
    private Campus campus;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "solar_kw", nullable = false)
    private Double solarKw;

    @Column(name = "wind_kw", nullable = false)
    private Double windKw;

    @Column(name = "campus_load_kw", nullable = false)
    private Double campusLoadKw;

    @Column(name = "battery_soc_pct", nullable = false)
    private Double batterySocPct;

    @Column(name = "grid_import_kw", nullable = false)
    private Double gridImportKw;

    @Column(name = "grid_export_kw", nullable = false)
    private Double gridExportKw;

    public TelemetryReading() {
    }

    public TelemetryReading(Long id, Campus campus, LocalDateTime timestamp, Double solarKw,
                            Double windKw, Double campusLoadKw, Double batterySocPct,
                            Double gridImportKw, Double gridExportKw) {
        this.id = id;
        this.campus = campus;
        this.timestamp = timestamp;
        this.solarKw = solarKw;
        this.windKw = windKw;
        this.campusLoadKw = campusLoadKw;
        this.batterySocPct = batterySocPct;
        this.gridImportKw = gridImportKw;
        this.gridExportKw = gridExportKw;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Campus campus;
        private LocalDateTime timestamp;
        private Double solarKw;
        private Double windKw;
        private Double campusLoadKw;
        private Double batterySocPct;
        private Double gridImportKw;
        private Double gridExportKw;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder campus(Campus campus) { this.campus = campus; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public Builder solarKw(Double solarKw) { this.solarKw = solarKw; return this; }
        public Builder windKw(Double windKw) { this.windKw = windKw; return this; }
        public Builder campusLoadKw(Double campusLoadKw) { this.campusLoadKw = campusLoadKw; return this; }
        public Builder batterySocPct(Double batterySocPct) { this.batterySocPct = batterySocPct; return this; }
        public Builder gridImportKw(Double gridImportKw) { this.gridImportKw = gridImportKw; return this; }
        public Builder gridExportKw(Double gridExportKw) { this.gridExportKw = gridExportKw; return this; }

        public TelemetryReading build() {
            return new TelemetryReading(id, campus, timestamp, solarKw, windKw, campusLoadKw, batterySocPct, gridImportKw, gridExportKw);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Campus getCampus() { return campus; }
    public void setCampus(Campus campus) { this.campus = campus; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public LocalDateTime getRecordedAt() { return timestamp; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.timestamp = recordedAt; }

    public Double getSolarKw() { return solarKw; }
    public void setSolarKw(Double solarKw) { this.solarKw = solarKw; }

    public Double getWindKw() { return windKw; }
    public void setWindKw(Double windKw) { this.windKw = windKw; }

    public Double getCampusLoadKw() { return campusLoadKw; }
    public void setCampusLoadKw(Double campusLoadKw) { this.campusLoadKw = campusLoadKw; }

    public Double getBatterySocPct() { return batterySocPct; }
    public void setBatterySocPct(Double batterySocPct) { this.batterySocPct = batterySocPct; }

    public Double getGridImportKw() { return gridImportKw; }
    public void setGridImportKw(Double gridImportKw) { this.gridImportKw = gridImportKw; }

    public Double getGridExportKw() { return gridExportKw; }
    public void setGridExportKw(Double gridExportKw) { this.gridExportKw = gridExportKw; }
}
