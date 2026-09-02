import os
import time
import math
import random
import logging
import asyncio
from datetime import datetime, timezone
from influxdb_client import Point
from app.database import get_write_api, INFLUXDB_BUCKET, INFLUXDB_ORG

logger = logging.getLogger("tejas.telemetry")

# Global simulation state
cloud_cover_drop: bool = False

# Stateful variables for smooth continuous simulation
_current_wind_kw: float = 75.0
_current_battery_soc: float = 82.5
_current_load_offset: float = 120.0

# Demo mode flag (defaults to True to allow daytime solar simulation regardless of wall-clock testing time)
DEMO_DAYLIGHT_MODE: bool = os.getenv("DEMO_DAYLIGHT_MODE", "true").lower() in ("true", "1", "yes")


def set_cloud_cover_drop(value: bool) -> bool:
    """Update global cloud_cover_drop state."""
    global cloud_cover_drop
    cloud_cover_drop = value
    logger.info("Anomaly state changed: cloud_cover_drop=%s", cloud_cover_drop)
    return cloud_cover_drop


def get_cloud_cover_drop() -> bool:
    """Get current cloud_cover_drop status."""
    return cloud_cover_drop


def calculate_solar_generation(simulated_hour: float, drop_active: bool) -> float:
    """
    Calculate solar generation in kW along a midday bell curve.
    - 0 kW at night (hour < 6 or hour > 18).
    - Peaks at 1200 kW at midday (hour = 12.0).
    - If drop_active is True, instantaneously drops generation by 65% (0.35x multiplier).
    """
    if 6.0 <= simulated_hour <= 18.0:
        # Midday half-sine curve peaking at 12.0
        normalized_time = (simulated_hour - 6.0) / 12.0
        curve = math.sin(math.pi * normalized_time)
        base_solar = 1200.0 * curve
        # Add realistic micro-variations (+/- 15 kW)
        jitter = random.uniform(-15.0, 15.0)
        base_solar = max(0.0, min(1200.0, base_solar + jitter))
    else:
        base_solar = 0.0

    if drop_active:
        # Instant 65% drop -> 35% remaining
        solar_output = base_solar * 0.35
    else:
        solar_output = base_solar

    return round(solar_output, 2)


def calculate_wind_generation() -> float:
    """
    Simulate wind power using a bounded random walk between 20.0 kW and 140.0 kW.
    """
    global _current_wind_kw
    step = random.uniform(-5.0, 5.0)
    _current_wind_kw += step
    _current_wind_kw = max(20.0, min(140.0, _current_wind_kw))
    return round(_current_wind_kw, 2)


def calculate_campus_load() -> float:
    """
    Simulate campus electrical load: base 450.0 kW with variations up to 850.0 kW.
    """
    global _current_load_offset
    # Smooth walk for demand offset (0 to 400 kW above base)
    step = random.uniform(-10.0, 10.0)
    _current_load_offset = max(0.0, min(400.0, _current_load_offset + step))
    total_load = 450.0 + _current_load_offset
    return round(total_load, 2)


def calculate_battery_soc(total_generation: float, load: float) -> float:
    """
    Update battery state of charge (SoC) between 20.0% and 100.0% based on net grid energy.
    """
    global _current_battery_soc
    net_power = total_generation - load
    # If surplus, charge slowly; if deficit, discharge slowly
    soc_delta = (net_power / 2500.0) * 0.2 + random.uniform(-0.02, 0.02)
    _current_battery_soc += soc_delta
    _current_battery_soc = max(20.0, min(100.0, _current_battery_soc))
    return round(_current_battery_soc, 2)


def generate_telemetry_sample() -> dict:
    """Generate a single campus telemetry data sample."""
    now = datetime.now(timezone.utc)
    
    # Determine simulated hour for solar calculation
    if DEMO_DAYLIGHT_MODE:
        # In demo mode, use dynamic daytime hour around 12:30 or cyclic day
        # (Allows testing at any wall-clock time without waiting for daylight)
        time_cycle = (time.time() / 120.0) % 6.0  # 6-minute day cycle between 9:00 and 15:00
        sim_hour = 9.0 + time_cycle
    else:
        sim_hour = now.hour + (now.minute / 60.0) + (now.second / 3600.0)

    is_cloud_covered = get_cloud_cover_drop()
    solar_kw = calculate_solar_generation(sim_hour, is_cloud_covered)
    wind_kw = calculate_wind_generation()
    load_kw = calculate_campus_load()
    total_gen = solar_kw + wind_kw
    soc_pct = calculate_battery_soc(total_gen, load_kw)

    return {
        "timestamp": now.isoformat(),
        "solar_generation_kw": solar_kw,
        "wind_generation_kw": wind_kw,
        "total_generation_kw": round(total_gen, 2),
        "campus_load_kw": load_kw,
        "net_power_kw": round(total_gen - load_kw, 2),
        "battery_soc_percent": soc_pct,
        "cloud_cover_drop": is_cloud_covered,
    }


def write_telemetry_to_influx(sample: dict) -> None:
    """Write telemetry sample point to InfluxDB."""
    write_api = get_write_api()
    point = (
        Point("campus_telemetry")
        .tag("facility", "tejas_campus_01")
        .tag("grid", "tejas_vpp")
        .field("solar_generation_kw", float(sample["solar_generation_kw"]))
        .field("wind_generation_kw", float(sample["wind_generation_kw"]))
        .field("total_generation_kw", float(sample["total_generation_kw"]))
        .field("campus_load_kw", float(sample["campus_load_kw"]))
        .field("net_power_kw", float(sample["net_power_kw"]))
        .field("battery_soc_percent", float(sample["battery_soc_percent"]))
        .field("cloud_cover_drop", bool(sample["cloud_cover_drop"]))
    )
    write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)


async def run_telemetry_loop() -> None:
    """
    Background asynchronous task executing every 5 seconds.
    Generates campus telemetry and writes to InfluxDB.
    """
    logger.info("Starting background telemetry ingestion loop (5s interval)...")
    while True:
        try:
            sample = generate_telemetry_sample()
            write_telemetry_to_influx(sample)
            logger.debug(
                "Telemetry written: solar=%.1f kW (drop=%s), wind=%.1f kW, load=%.1f kW, soc=%.1f%%",
                sample["solar_generation_kw"],
                sample["cloud_cover_drop"],
                sample["wind_generation_kw"],
                sample["campus_load_kw"],
                sample["battery_soc_percent"],
            )
        except Exception as exc:
            logger.error("Error writing telemetry to InfluxDB: %s", exc)

        await asyncio.sleep(5)
