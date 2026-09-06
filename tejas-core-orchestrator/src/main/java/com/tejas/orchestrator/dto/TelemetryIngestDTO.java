package com.tejas.orchestrator.dto;

import java.time.LocalDateTime;

public class TelemetryIngestDTO {

    private Long campusId;
    private Double solarKw;
    private Double windKw;
    private Double campusLoadKw;
    private Double batterySocPct;
    private Double gridImportKw;
    private Double gridExportKw;
    private LocalDateTime recordedAt;

    public TelemetryIngestDTO() {
    }

    public TelemetryIngestDTO(Long campusId, Double solarKw, Double windKw, Double campusLoadKw,
                              Double batterySocPct, Double gridImportKw, Double gridExportKw,
                              LocalDateTime recordedAt) {
        this.campusId = campusId;
        this.solarKw = solarKw;
        this.windKw = windKw;
        this.campusLoadKw = campusLoadKw;
        this.batterySocPct = batterySocPct;
        this.gridImportKw = gridImportKw;
        this.gridExportKw = gridExportKw;
        this.recordedAt = recordedAt;
    }

    public Long getCampusId() { return campusId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }

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

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
