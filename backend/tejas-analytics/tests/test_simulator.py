"""
tests/test_simulator.py — Unit tests for TEJAS GRID telemetry_simulator.py

Run with:
    pytest tests/test_simulator.py -v

No InfluxDB connection required — all tests operate on pure Python model functions.
"""

import sys
import os

# Allow imports from parent directory (tejas-analytics/) when running from tests/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import random
import pytest

from telemetry_simulator import (
    battery_soc_percent,
    campus_load_kw,
    grid_import_kw,
    solar_generation_kw,
    wind_generation_kw,
)


# ─────────────────────────────────────────────────────────────────────────────
# Solar generation model tests
# ─────────────────────────────────────────────────────────────────────────────


def test_solar_zero_at_night():
    """Solar generation must be exactly 0 during night hours (e.g., 02:00)."""
    result = solar_generation_kw(2.0)
    assert result == 0.0, f"Expected 0.0 at 02:00, got {result}"


def test_solar_zero_before_dawn():
    """Solar generation must be 0 before 06:00 on the dot."""
    for h in [0.0, 1.0, 2.5, 4.0, 5.99]:
        assert solar_generation_kw(h) == 0.0, f"Expected 0 at hour={h}"


def test_solar_zero_after_dusk():
    """Solar generation must be 0 after 19:00."""
    for h in [19.01, 20.0, 22.0, 23.5]:
        assert solar_generation_kw(h) == 0.0, f"Expected 0 at hour={h}"


def test_solar_peaks_midday():
    """
    Solar output at 13:00 (peak) must exceed output at 08:00 (morning ramp).
    Tested over 100 iterations to account for random noise.
    """
    for _ in range(100):
        peak = solar_generation_kw(13.0)
        morning = solar_generation_kw(8.0)
        assert peak > morning, (
            f"Expected peak ({peak:.2f} kW) > morning ({morning:.2f} kW)"
        )


def test_solar_cloud_factor():
    """
    Solar output at cloud_factor=0.35 must be less than half the clear-sky value.
    Tested 100 times to handle noise.
    """
    for _ in range(100):
        cloudy = solar_generation_kw(13.0, cloud_factor=0.35)
        clear = solar_generation_kw(13.0, cloud_factor=1.0)
        assert cloudy < clear * 0.50, (
            f"Cloudy ({cloudy:.2f}) should be < 50% of clear ({clear:.2f})"
        )


def test_solar_cloud_factor_zero():
    """cloud_factor=0.0 should produce zero or near-zero generation (noise may not be exactly 0)."""
    for _ in range(50):
        result = solar_generation_kw(13.0, cloud_factor=0.0)
        assert result >= 0.0, "Generation cannot be negative"
        # With cloud_factor=0, base=0, only noise*0 remains → should be 0
        assert result < 1.0, f"Expected near-zero with cloud_factor=0, got {result}"


def test_solar_non_negative():
    """Solar generation must never be negative for any valid input."""
    for h in [h * 0.5 for h in range(49)]:
        for cf in [0.0, 0.35, 0.7, 1.0]:
            assert solar_generation_kw(h, cf) >= 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Campus load model tests
# ─────────────────────────────────────────────────────────────────────────────


def test_campus_load_evening_spike():
    """
    Campus load at 20:00 with spike_factor=1.45 must exceed the baseline (1.0).
    The spike_factor models a large campus event.
    Tested 100 times to account for random noise.
    """
    for _ in range(100):
        spiked = campus_load_kw(20.0, spike_factor=1.45)
        baseline = campus_load_kw(20.0, spike_factor=1.0)
        assert spiked > baseline, (
            f"Spiked load ({spiked:.2f}) should exceed baseline ({baseline:.2f})"
        )


def test_campus_load_minimum_floor():
    """Campus load must never drop below the 50 kW critical infrastructure floor."""
    for h in [h * 0.5 for h in range(49)]:
        result = campus_load_kw(h)
        assert result >= 50.0, f"Load below floor at hour {h}: {result:.2f} kW"


def test_campus_load_night_is_lower_than_peak():
    """Night load (03:00) must be substantially lower than academic peak (12:00)."""
    for _ in range(50):
        night = campus_load_kw(3.0)
        peak = campus_load_kw(12.0)
        assert night < peak, f"Night ({night:.1f}) should be less than academic peak ({peak:.1f})"


# ─────────────────────────────────────────────────────────────────────────────
# Battery SoC model tests
# ─────────────────────────────────────────────────────────────────────────────


def test_battery_never_below_30():
    """
    Run 10 000 random simulator ticks.
    Battery SoC must NEVER drop below the 30 % hard floor.
    """
    soc = 75.0   # Starting SoC
    dt_hours = 5 / 3600.0   # 5-second tick interval

    violations = []
    for i in range(10_000):
        hour = random.uniform(0, 24)
        cloud_factor = random.uniform(0.0, 1.0)
        spike_factor = random.uniform(0.5, 2.0)

        solar = solar_generation_kw(hour, cloud_factor)
        wind = wind_generation_kw(hour)
        load = campus_load_kw(hour, spike_factor)
        soc = battery_soc_percent(soc, solar, wind, load, dt_hours)

        if soc < 30.0:
            violations.append((i, soc))

    assert not violations, (
        f"SoC dropped below 30 % on {len(violations)} ticks. "
        f"First violation: tick {violations[0][0]}, SoC={violations[0][1]:.4f}"
    )


def test_battery_never_above_98():
    """Battery SoC must NEVER exceed the 98 % hard ceiling."""
    soc = 95.0
    dt_hours = 60 / 3600.0   # 1-minute ticks

    for _ in range(1_000):
        # Simulate strong surplus (lots of solar, little load)
        soc = battery_soc_percent(soc, solar=240.0, wind=50.0, load=50.0, dt_hours=dt_hours)
        assert soc <= 98.0, f"SoC exceeded ceiling: {soc:.4f}"


def test_battery_charges_on_surplus():
    """When renewables exceed load, SoC should increase (unless already at ceiling)."""
    soc_before = 50.0
    soc_after = battery_soc_percent(soc_before, solar=200.0, wind=40.0, load=80.0, dt_hours=1.0)
    assert soc_after > soc_before or soc_after == 98.0, (
        f"SoC should increase on surplus: before={soc_before}, after={soc_after}"
    )


def test_battery_discharges_on_deficit():
    """When load exceeds renewables, SoC should decrease (unless at floor)."""
    soc_before = 75.0
    soc_after = battery_soc_percent(soc_before, solar=0.0, wind=10.0, load=400.0, dt_hours=1.0)
    assert soc_after < soc_before or soc_after == 30.0, (
        f"SoC should decrease on deficit: before={soc_before}, after={soc_after}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Grid import model tests
# ─────────────────────────────────────────────────────────────────────────────


def test_grid_import_zero_on_surplus():
    """No grid import when renewables exceed load."""
    result = grid_import_kw(solar=300.0, wind=50.0, load=200.0, soc=80.0)
    assert result == 0.0, f"Expected 0 grid import on surplus, got {result}"


def test_grid_import_non_negative():
    """Grid import must always be ≥ 0."""
    for _ in range(500):
        solar = random.uniform(0, 250)
        wind = random.uniform(0, 50)
        load = random.uniform(50, 500)
        soc = random.uniform(30, 98)
        result = grid_import_kw(solar, wind, load, soc)
        assert result >= 0.0, f"Negative grid import: {result}"


# ─────────────────────────────────────────────────────────────────────────────
# Wind model tests
# ─────────────────────────────────────────────────────────────────────────────


def test_wind_within_bounds():
    """Wind generation must stay within [0, 50] kW at all hours."""
    for h in [h * 0.25 for h in range(97)]:
        result = wind_generation_kw(h)
        assert 0.0 <= result <= 50.0, f"Wind out of bounds at hour {h}: {result:.2f}"
