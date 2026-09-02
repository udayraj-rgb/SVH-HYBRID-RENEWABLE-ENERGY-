"""
telemetry_simulator.py — Physics-based campus energy telemetry simulator.

Produces realistic second/minute-resolution synthetic data for:
  - Solar PV generation     (bell-curve + cloud factor + noise)
  - Wind generation         (diurnal variation + stochastic noise)
  - Campus electrical load  (multi-peak academic profile + spike factor)
  - Battery SoC             (net power flow through 300 kWh BESS)
  - Grid import             (residual deficit after BESS discharge)

Data is written to InfluxDB.  A global `simulator` singleton is used by
the APScheduler job in main.py and the /api/telemetry router.
"""

import math
import random
from datetime import datetime, timedelta, timezone

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

from config import settings

# ─────────────────────────────────────────────────────────────────────────────
# GENERATION & LOAD MODELS
# ─────────────────────────────────────────────────────────────────────────────


def solar_generation_kw(hour: float, cloud_factor: float = 1.0) -> float:
    """
    Bell-curve solar model — peaks at ~13:00, zero before 06:00 and after 19:00.

    Args:
        hour:         Fractional hour of day in [0, 24).
        cloud_factor: 0.0 = fully overcast, 1.0 = clear sky.

    Returns:
        Estimated solar generation in kW (≥ 0).
    """
    if hour < 6.0 or hour > 19.0:
        return 0.0

    # Gaussian bell-curve centred at 13:00 (slight left-skew for morning haze)
    peak_kw = 245.0   # Installed capacity ~250 kW, derated for panel efficiency
    center = 13.0
    width = 3.5       # σ — controls ramp speed

    base = peak_kw * math.exp(-((hour - center) ** 2) / (2 * width**2))
    noise = random.gauss(0, base * 0.03)   # ±3 % micro-fluctuation
    return max(0.0, (base + noise) * cloud_factor)


def wind_generation_kw(hour: float) -> float:
    """
    Wind generation model — higher at night/early morning, dips midday due
    to thermal boundary-layer suppression.

    Args:
        hour: Fractional hour of day in [0, 24).

    Returns:
        Estimated wind generation in kW, clamped to [0, 50] kW.
    """
    base = 35.0        # Average output; installed = 50 kW, capacity factor ≈ 0.70
    diurnal = 8.0 * math.sin(math.pi * (hour - 2) / 12)  # ±8 kW diurnal swing
    noise = random.gauss(0, 2.5)
    return max(0.0, min(50.0, base + diurnal + noise))


def campus_load_kw(hour: float, spike_factor: float = 1.0) -> float:
    """
    Campus electrical load model with two daily peaks:
      - Morning/lab peak  : ~10:00–16:00 (academic activity)
      - Evening/hostel peak: ~19:00–21:00 (residential demand)

    Args:
        hour:         Fractional hour of day in [0, 24).
        spike_factor: Multiplier > 1 simulates demand spike events.

    Returns:
        Estimated load in kW (minimum 50 kW for critical infrastructure).
    """
    night_base = 120.0   # Servers, security lighting, HVAC minimum at night

    if 0 <= hour < 6:
        # Deep-night — only critical loads
        base = night_base + random.gauss(0, 5)

    elif 6 <= hour < 9:
        # Morning ramp-up (linear from 120 → 200 kW)
        base = night_base + (200 - night_base) * ((hour - 6) / 3)

    elif 9 <= hour < 17:
        # Peak academic hours — sinusoidal variation around 380 kW
        base = 380 + 40 * math.sin(math.pi * (hour - 9) / 8)

    elif 17 <= hour < 19:
        # Transition / trough between academic and hostel peaks
        base = 300 + (hour - 17) * 50

    elif 19 <= hour < 22:
        # Hostel evening peak — sinusoidal around 420 kW
        base = 420 + 60 * math.sin(math.pi * (hour - 19) / 3)

    else:
        # Late-night wind-down (22:00 → 24:00)
        base = 200 - (hour - 22) * 40

    noise = random.gauss(0, base * 0.04)   # ±4 % random noise
    return max(50.0, (base + noise) * spike_factor)


def battery_soc_percent(
    prev_soc: float,
    solar: float,
    wind: float,
    load: float,
    dt_hours: float,
) -> float:
    """
    Battery Energy Storage System (BESS) State-of-Charge model.

    Capacity : 300 kWh lithium-ion bank.
    Hard floor: 30 % (critical lab & life-safety reserve).
    Hard ceil : 98 % (avoid over-charge degradation).
    Round-trip efficiency: 92 % charge / (1/0.92) discharge.

    Args:
        prev_soc:  Previous SoC in percent [30, 98].
        solar:     Current solar generation kW.
        wind:      Current wind generation kW.
        load:      Current campus load kW.
        dt_hours:  Timestep duration in hours.

    Returns:
        New SoC clamped to [30.0, 98.0].
    """
    capacity_kwh = 300.0
    net_power = solar + wind - load          # kW: positive = surplus, negative = deficit
    delta_kwh = net_power * dt_hours         # Energy exchanged this timestep

    # Apply efficiency: charge at 92 %, discharge at 1/92 %
    if net_power >= 0:
        efficiency = 0.92
    else:
        efficiency = 1.0 / 0.92

    delta_soc = (delta_kwh * efficiency / capacity_kwh) * 100.0
    new_soc = prev_soc + delta_soc
    return max(30.0, min(98.0, new_soc))


def grid_import_kw(solar: float, wind: float, load: float, soc: float) -> float:
    """
    Grid import = demand not satisfied by renewables, minus available BESS discharge.

    The BESS will not discharge below the 30 % hard floor.

    Args:
        solar: Solar generation kW.
        wind:  Wind generation kW.
        load:  Campus load kW.
        soc:   Current battery SoC percent.

    Returns:
        Grid import in kW (0 if renewables + BESS cover all demand).
    """
    renewable = solar + wind
    deficit = load - renewable

    if deficit <= 0:
        return 0.0   # Surplus — either charge battery or export to grid

    # Energy available in BESS above the critical reserve floor
    bess_available_kwh = max(0.0, (soc - 30.0) / 100.0 * 300.0)
    # Simplified discharge-rate limit: treat available kWh as instantaneous kW headroom
    # (In a real system this would be bounded by inverter rating, e.g., 150 kW max)
    bess_discharge = min(deficit, bess_available_kwh * 12)   # 12C simplified rate
    return max(0.0, deficit - bess_discharge)


# ─────────────────────────────────────────────────────────────────────────────
# SIMULATOR CLASS
# ─────────────────────────────────────────────────────────────────────────────


class TelemetrySimulator:
    """
    Stateful simulator that maintains running SoC and writes to InfluxDB.

    Lifecycle:
      - Instantiated once at module load (singleton pattern).
      - `write_tick()` called by APScheduler every N seconds.
      - `simulate_24h_history()` called once at startup (or via /seed-history).
      - `set_demo_state()` called by /api/demo routes to inject fault scenarios.
    """

    def __init__(self) -> None:
        self.client = InfluxDBClient(
            url=settings.influx_url,
            token=settings.influx_token,
            org=settings.influx_org,
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)

        # Running state
        self.current_soc: float = 75.0   # Starting SoC (%)
        self._last_tick: dict = {}        # Cache of last written snapshot

        # Demo scenario flags
        self._demo_state: str = "normal"
        self._cloud_event_active: bool = False
        self._spike_event_active: bool = False

    # ── Demo control ──────────────────────────────────────────────────────────

    def set_demo_state(self, state: str) -> None:
        """
        Switch between simulation scenarios for live demo purposes.

        Allowed states:
          - "normal"       — standard simulation
          - "cloud_cover"  — 65 % solar reduction (overcast event)
          - "demand_spike" — 45 % load surge (event / exam / sports)
        """
        self._demo_state = state
        self._cloud_event_active = (state == "cloud_cover")
        self._spike_event_active = (state == "demand_spike")

    def get_current_state(self) -> dict:
        """Return the current demo state label."""
        return {"demo_state": self._demo_state}

    # ── Real-time tick ────────────────────────────────────────────────────────

    def write_tick(self) -> dict:
        """
        Compute one telemetry snapshot using current wall-clock time and write
        it to InfluxDB.  Returns the snapshot dict so callers can stream it.
        """
        now = datetime.now(timezone.utc)
        hour = now.hour + now.minute / 60.0 + now.second / 3600.0
        dt_hours = settings.simulation_interval_seconds / 3600.0

        # Apply active demo overrides
        cloud_factor = 0.35 if self._cloud_event_active else 1.0   # 65 % solar drop
        spike_factor = 1.45 if self._spike_event_active else 1.0   # 45 % load surge

        solar = solar_generation_kw(hour, cloud_factor)
        wind = wind_generation_kw(hour)
        load = campus_load_kw(hour, spike_factor)

        self.current_soc = battery_soc_percent(
            self.current_soc, solar, wind, load, dt_hours
        )
        grid = grid_import_kw(solar, wind, load, self.current_soc)

        # Derived economics & carbon (incremental, for this tick period)
        cost_inr = grid * dt_hours * settings.tariff_rate_inr
        carbon_kg = grid * dt_hours * settings.carbon_factor_kg_kwh

        point = (
            Point("energy_metrics")
            .field("solar_generation_kw", round(solar, 3))
            .field("wind_generation_kw", round(wind, 3))
            .field("campus_load_kw", round(load, 3))
            .field("battery_soc_percent", round(self.current_soc, 2))
            .field("grid_import_kw", round(grid, 3))
            .field("cost_inr", round(cost_inr, 4))
            .field("carbon_kg", round(carbon_kg, 5))
            .field("demo_state", self._demo_state)
            .time(now, WritePrecision.SECONDS)
        )

        self.write_api.write(bucket=settings.influx_bucket, record=[point])

        snapshot = {
            "timestamp": now.isoformat(),
            "solar_generation_kw": round(solar, 3),
            "wind_generation_kw": round(wind, 3),
            "campus_load_kw": round(load, 3),
            "battery_soc_percent": round(self.current_soc, 2),
            "grid_import_kw": round(grid, 3),
            "cost_inr_per_tick": round(cost_inr, 4),
            "carbon_kg_per_tick": round(carbon_kg, 5),
            "demo_state": self._demo_state,
        }
        self._last_tick = snapshot
        return snapshot

    def get_last_tick(self) -> dict:
        """Return the most-recently written snapshot without querying InfluxDB."""
        return self._last_tick

    # ── Historical backfill ───────────────────────────────────────────────────

    def simulate_24h_history(self) -> dict:
        """
        Write 24 hours of synthetic historical data (1-minute intervals = 1 440 points)
        to InfluxDB so that the frontend charts have data on first load.

        Returns:
            dict with status and point count.
        """
        soc = 65.0   # Starting SoC for historical run
        points: list[Point] = []
        base_time = datetime.now(timezone.utc) - timedelta(hours=24)
        interval = timedelta(seconds=60)   # 1-minute granularity for history
        total_points = 24 * 60            # 1 440

        for i in range(total_points):
            t = base_time + i * interval
            h = t.hour + t.minute / 60.0

            solar = solar_generation_kw(h)
            wind = wind_generation_kw(h)
            load = campus_load_kw(h)
            dt_h = 60.0 / 3600.0   # 1 minute in hours
            soc = battery_soc_percent(soc, solar, wind, load, dt_h)
            grid = grid_import_kw(solar, wind, load, soc)
            cost_inr = grid * dt_h * settings.tariff_rate_inr
            carbon_kg = grid * dt_h * settings.carbon_factor_kg_kwh

            p = (
                Point("energy_metrics")
                .field("solar_generation_kw", round(solar, 3))
                .field("wind_generation_kw", round(wind, 3))
                .field("campus_load_kw", round(load, 3))
                .field("battery_soc_percent", round(soc, 2))
                .field("grid_import_kw", round(grid, 3))
                .field("cost_inr", round(cost_inr, 4))
                .field("carbon_kg", round(carbon_kg, 5))
                .field("demo_state", "historical")
                .time(t, WritePrecision.SECONDS)
            )
            points.append(p)

            # Batch-write every 500 points to avoid memory pressure
            if len(points) >= 500:
                self.write_api.write(bucket=settings.influx_bucket, record=points)
                points = []

        # Flush remaining points
        if points:
            self.write_api.write(bucket=settings.influx_bucket, record=points)

        return {"status": "ok", "points_written": total_points}


# ─────────────────────────────────────────────────────────────────────────────
# Module-level singleton — imported by routers and main.py scheduler
# ─────────────────────────────────────────────────────────────────────────────
simulator = TelemetrySimulator()
