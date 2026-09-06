package com.tejas.orchestrator.service;

import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class TariffCalculationService {

    // Statutory RERC High-Tension Institutional Time-of-Day (ToD) Rates (₹ / kWh)
    public static final double RATE_OFF_PEAK_SOLAR = 5.80;      // 10:00 - 16:00 (Solar rebate window)
    public static final double RATE_NORMAL = 7.50;              // 06:00 - 10:00, 16:00 - 18:00, 22:00 - 24:00
    public static final double RATE_EVENING_PEAK = 9.50;        // 18:00 - 22:00 (Peak surcharge window)
    public static final double RATE_GRID_FEED_IN_EXPORT = 3.14; // Net metering export feed-in tariff
    public static final double OVERDRAW_PENALTY_MULTIPLIER = 1.25; // 25% surcharge on demand overdraw

    /**
     * Resolves the RERC import tariff rate for a given hour of the day (0-23).
     */
    public double getImportRate(int hourOfDay) {
        if (hourOfDay >= 18 && hourOfDay < 22) {
            return RATE_EVENING_PEAK;
        } else if (hourOfDay >= 10 && hourOfDay < 16) {
            return RATE_OFF_PEAK_SOLAR;
        } else {
            return RATE_NORMAL;
        }
    }

    /**
     * Resolves the RERC import tariff rate for a specific LocalTime.
     */
    public double getImportRate(LocalTime time) {
        return getImportRate(time.getHour());
    }

    /**
     * Grid export feed-in tariff rate (₹3.14/kWh).
     */
    public double getExportRate() {
        return RATE_GRID_FEED_IN_EXPORT;
    }

    /**
     * Returns the formal name of the RERC tariff window.
     */
    public String getTariffWindowName(int hourOfDay) {
        if (hourOfDay >= 18 && hourOfDay < 22) {
            return "Evening Peak Surcharge (₹9.50/kWh)";
        } else if (hourOfDay >= 10 && hourOfDay < 16) {
            return "Off-Peak Solar Incentive (₹5.80/kWh)";
        } else {
            return "Normal Tariff (₹7.50/kWh)";
        }
    }

    public boolean isEveningPeak(int hourOfDay) {
        return hourOfDay >= 18 && hourOfDay < 22;
    }

    public boolean isSolarOffPeak(int hourOfDay) {
        return hourOfDay >= 10 && hourOfDay < 16;
    }

    /**
     * Checks if instantaneous demand exceeds the sanctioned contract demand.
     */
    public boolean isDemandOverdrawn(double currentLoadKw, double sanctionedLoadKw) {
        return currentLoadKw > sanctionedLoadKw;
    }

    /**
     * Calculates net cost for a 1-hour interval based on grid import and export.
     */
    public double calculateHourlyNetCost(int hourOfDay, double gridImportKw, double gridExportKw) {
        double importRate = getImportRate(hourOfDay);
        double importCost = gridImportKw * importRate;
        double exportCredit = gridExportKw * RATE_GRID_FEED_IN_EXPORT;
        return Math.round((importCost - exportCredit) * 100.0) / 100.0;
    }

    /**
     * Calculates financial savings achieved by generating clean power or discharging battery
     * instead of purchasing from the utility grid at the prevailing ToD rate.
     */
    public double calculateAvoidedCost(int hourOfDay, double cleanKwOffset) {
        double rate = getImportRate(hourOfDay);
        return Math.round(cleanKwOffset * rate * 100.0) / 100.0;
    }
}
