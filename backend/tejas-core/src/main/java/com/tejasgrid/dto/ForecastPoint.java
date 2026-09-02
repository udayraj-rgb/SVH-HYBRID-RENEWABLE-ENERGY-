package com.tejasgrid.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastPoint {
    private int hour;
    private double forecastSolarKw;
    private double forecastLoadKw;
    private double forecastNetKw;  // positive = surplus, negative = deficit
}
