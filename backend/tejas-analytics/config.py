"""
config.py — Application configuration for TEJAS GRID Analytics service.

All settings can be overridden via environment variables or a .env file placed
next to main.py.  Pydantic-settings handles type coercion and validation.

Usage:
    from config import settings
    print(settings.influx_url)
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Central settings object.  All values are read from environment variables
    (case-insensitive) or from a `.env` file in the working directory.

    Override any field by setting the matching env-var before launching the
    service, e.g.:
        INFLUX_URL=http://influxdb:8086 uvicorn main:app
    """

    # ── InfluxDB connection ────────────────────────────────────────────────────
    influx_url: str = "http://localhost:8086"
    influx_token: str = "tejas-influx-token-super-secret"
    influx_org: str = "tejas-org"
    influx_bucket: str = "campus-telemetry"

    # ── Optional OpenWeatherMap integration ───────────────────────────────────
    # Set to a real API key to enable live weather-based forecast adjustments.
    # Leave as "STUB_KEY" to use synthetic forecast generation.
    openweather_api_key: str = "STUB_KEY"
    campus_lat: float = 19.0760   # Default: Mumbai / IIT-B area
    campus_lon: float = 72.8777

    # ── Simulator behaviour ───────────────────────────────────────────────────
    simulation_interval_seconds: int = 5   # Scheduler tick cadence in seconds

    # ── Economics & carbon accounting ─────────────────────────────────────────
    tariff_rate_inr: float = 7.50          # ₹ per kWh for grid import cost
    carbon_factor_kg_kwh: float = 0.82     # kg CO₂ per kWh of grid electricity (India average)

    class Config:
        env_file = ".env"         # Auto-loaded if present
        env_prefix = ""           # Env-var names match field names (e.g. INFLUX_URL)
        case_sensitive = False    # INFLUX_URL and influx_url are both valid


# Module-level singleton — import this everywhere
settings = Settings()
