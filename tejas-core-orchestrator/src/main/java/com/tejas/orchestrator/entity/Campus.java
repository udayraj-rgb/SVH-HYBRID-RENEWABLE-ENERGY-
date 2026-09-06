package com.tejas.orchestrator.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "campuses")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Campus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    @JsonIgnoreProperties("campuses")
    private District district;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "sanctioned_load_kw", nullable = false)
    private Double sanctionedLoadKw;

    @Column(name = "solar_capacity_kw", nullable = false)
    private Double solarCapacityKw;

    @Column(name = "wind_capacity_kw", nullable = false)
    private Double windCapacityKw;

    @Column(name = "battery_capacity_kwh", nullable = false)
    private Double batteryCapacityKwh;

    @OneToMany(mappedBy = "campus", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<TelemetryReading> telemetryReadings = new ArrayList<>();

    @OneToMany(mappedBy = "campus", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "campus", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<HostelBlock> hostelBlocks = new ArrayList<>();

    public Campus() {
    }

    public Campus(Long id, String name, District district, Double latitude, Double longitude,
                  Double sanctionedLoadKw, Double solarCapacityKw, Double windCapacityKw,
                  Double batteryCapacityKwh, List<TelemetryReading> telemetryReadings,
                  List<User> users, List<HostelBlock> hostelBlocks) {
        this.id = id;
        this.name = name;
        this.district = district;
        this.latitude = latitude;
        this.longitude = longitude;
        this.sanctionedLoadKw = sanctionedLoadKw;
        this.solarCapacityKw = solarCapacityKw;
        this.windCapacityKw = windCapacityKw;
        this.batteryCapacityKwh = batteryCapacityKwh;
        this.telemetryReadings = telemetryReadings != null ? telemetryReadings : new ArrayList<>();
        this.users = users != null ? users : new ArrayList<>();
        this.hostelBlocks = hostelBlocks != null ? hostelBlocks : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private District district;
        private Double latitude;
        private Double longitude;
        private Double sanctionedLoadKw;
        private Double solarCapacityKw;
        private Double windCapacityKw;
        private Double batteryCapacityKwh;
        private List<TelemetryReading> telemetryReadings = new ArrayList<>();
        private List<User> users = new ArrayList<>();
        private List<HostelBlock> hostelBlocks = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder district(District district) { this.district = district; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder sanctionedLoadKw(Double sanctionedLoadKw) { this.sanctionedLoadKw = sanctionedLoadKw; return this; }
        public Builder solarCapacityKw(Double solarCapacityKw) { this.solarCapacityKw = solarCapacityKw; return this; }
        public Builder windCapacityKw(Double windCapacityKw) { this.windCapacityKw = windCapacityKw; return this; }
        public Builder batteryCapacityKwh(Double batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; return this; }
        public Builder telemetryReadings(List<TelemetryReading> telemetryReadings) { this.telemetryReadings = telemetryReadings; return this; }
        public Builder users(List<User> users) { this.users = users; return this; }
        public Builder hostelBlocks(List<HostelBlock> hostelBlocks) { this.hostelBlocks = hostelBlocks; return this; }

        public Campus build() {
            return new Campus(id, name, district, latitude, longitude, sanctionedLoadKw,
                    solarCapacityKw, windCapacityKw, batteryCapacityKwh, telemetryReadings, users, hostelBlocks);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public District getDistrict() { return district; }
    public void setDistrict(District district) { this.district = district; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getSanctionedLoadKw() { return sanctionedLoadKw; }
    public void setSanctionedLoadKw(Double sanctionedLoadKw) { this.sanctionedLoadKw = sanctionedLoadKw; }

    public Double getSolarCapacityKw() { return solarCapacityKw; }
    public void setSolarCapacityKw(Double solarCapacityKw) { this.solarCapacityKw = solarCapacityKw; }

    public Double getWindCapacityKw() { return windCapacityKw; }
    public void setWindCapacityKw(Double windCapacityKw) { this.windCapacityKw = windCapacityKw; }

    public Double getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(Double batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }

    public List<TelemetryReading> getTelemetryReadings() { return telemetryReadings; }
    public void setTelemetryReadings(List<TelemetryReading> telemetryReadings) { this.telemetryReadings = telemetryReadings; }

    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = users; }

    public List<HostelBlock> getHostelBlocks() { return hostelBlocks; }
    public void setHostelBlocks(List<HostelBlock> hostelBlocks) { this.hostelBlocks = hostelBlocks; }
}
