package com.tejas.orchestrator.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TelemetryDto {

    private String timestamp;

    @JsonProperty("solar_generation_kw")
    private Double solarGenerationKw;

    @JsonProperty("wind_generation_kw")
    private Double windGenerationKw;

    @JsonProperty("total_generation_kw")
    private Double totalGenerationKw;

    @JsonProperty("campus_load_kw")
    private Double campusLoadKw;

    @JsonProperty("net_power_kw")
    private Double netPowerKw;

    @JsonProperty("battery_soc_percent")
    private Double batterySocPercent;

    @JsonProperty("cloud_cover_drop")
    private Boolean cloudCoverDrop;

    @JsonProperty("data_source")
    private String dataSource;

    public TelemetryDto() {
    }

    public TelemetryDto(String timestamp, Double solarGenerationKw, Double windGenerationKw, Double totalGenerationKw, Double campusLoadKw, Double netPowerKw, Double batterySocPercent, Boolean cloudCoverDrop, String dataSource) {
        this.timestamp = timestamp;
        this.solarGenerationKw = solarGenerationKw;
        this.windGenerationKw = windGenerationKw;
        this.totalGenerationKw = totalGenerationKw;
        this.campusLoadKw = campusLoadKw;
        this.netPowerKw = netPowerKw;
        this.batterySocPercent = batterySocPercent;
        this.cloudCoverDrop = cloudCoverDrop;
        this.dataSource = dataSource;
    }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Double getSolarGenerationKw() { return solarGenerationKw; }
    public void setSolarGenerationKw(Double solarGenerationKw) { this.solarGenerationKw = solarGenerationKw; }

    public Double getWindGenerationKw() { return windGenerationKw; }
    public void setWindGenerationKw(Double windGenerationKw) { this.windGenerationKw = windGenerationKw; }

    public Double getTotalGenerationKw() { return totalGenerationKw; }
    public void setTotalGenerationKw(Double totalGenerationKw) { this.totalGenerationKw = totalGenerationKw; }

    public Double getCampusLoadKw() { return campusLoadKw; }
    public void setCampusLoadKw(Double campusLoadKw) { this.campusLoadKw = campusLoadKw; }

    public Double getNetPowerKw() { return netPowerKw; }
    public void setNetPowerKw(Double netPowerKw) { this.netPowerKw = netPowerKw; }

    public Double getBatterySocPercent() { return batterySocPercent; }
    public void setBatterySocPercent(Double batterySocPercent) { this.batterySocPercent = batterySocPercent; }

    public Boolean getCloudCoverDrop() { return cloudCoverDrop; }
    public void setCloudCoverDrop(Boolean cloudCoverDrop) { this.cloudCoverDrop = cloudCoverDrop; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
}
