package com.tejas.orchestrator.dto;

import java.util.ArrayList;
import java.util.List;

public class WeatherForecastDTO {

    private Long campusId;
    private String campusName;
    private Double latitude;
    private Double longitude;
    private String timezone;
    private Double currentSolarIrradiance;       // W/m² (shortwave_radiation)
    private Double currentDirectNormalIrradiance; // W/m² (direct_normal_irradiance)
    private Double currentTemperature;           // °C (temperature_2m)
    private Double currentWindSpeed;             // km/h (windspeed_10m)
    private Integer forecastHoursCount;
    private List<HourlyForecast> hourly = new ArrayList<>();

    public WeatherForecastDTO() {
    }

    public static class HourlyForecast {
        private String time;
        private Double shortwaveRadiation;
        private Double directNormalIrradiance;
        private Double temperature2m;
        private Double windspeed10m;

        public HourlyForecast() {
        }

        public HourlyForecast(String time, Double shortwaveRadiation, Double directNormalIrradiance, Double temperature2m, Double windspeed10m) {
            this.time = time;
            this.shortwaveRadiation = shortwaveRadiation;
            this.directNormalIrradiance = directNormalIrradiance;
            this.temperature2m = temperature2m;
            this.windspeed10m = windspeed10m;
        }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }

        public Double getShortwaveRadiation() { return shortwaveRadiation; }
        public void setShortwaveRadiation(Double shortwaveRadiation) { this.shortwaveRadiation = shortwaveRadiation; }

        public Double getDirectNormalIrradiance() { return directNormalIrradiance; }
        public void setDirectNormalIrradiance(Double directNormalIrradiance) { this.directNormalIrradiance = directNormalIrradiance; }

        public Double getTemperature2m() { return temperature2m; }
        public void setTemperature2m(Double temperature2m) { this.temperature2m = temperature2m; }

        public Double getWindspeed10m() { return windspeed10m; }
        public void setWindspeed10m(Double windspeed10m) { this.windspeed10m = windspeed10m; }
    }

    public Long getCampusId() { return campusId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }

    public String getCampusName() { return campusName; }
    public void setCampusName(String campusName) { this.campusName = campusName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Double getCurrentSolarIrradiance() { return currentSolarIrradiance; }
    public void setCurrentSolarIrradiance(Double currentSolarIrradiance) { this.currentSolarIrradiance = currentSolarIrradiance; }

    public Double getCurrentDirectNormalIrradiance() { return currentDirectNormalIrradiance; }
    public void setCurrentDirectNormalIrradiance(Double currentDirectNormalIrradiance) { this.currentDirectNormalIrradiance = currentDirectNormalIrradiance; }

    public Double getCurrentTemperature() { return currentTemperature; }
    public void setCurrentTemperature(Double currentTemperature) { this.currentTemperature = currentTemperature; }

    public Double getCurrentWindSpeed() { return currentWindSpeed; }
    public void setCurrentWindSpeed(Double currentWindSpeed) { this.currentWindSpeed = currentWindSpeed; }

    public Integer getForecastHoursCount() { return forecastHoursCount; }
    public void setForecastHoursCount(Integer forecastHoursCount) { this.forecastHoursCount = forecastHoursCount; }

    public List<HourlyForecast> getHourly() { return hourly; }
    public void setHourly(List<HourlyForecast> hourly) { this.hourly = hourly; }
}
