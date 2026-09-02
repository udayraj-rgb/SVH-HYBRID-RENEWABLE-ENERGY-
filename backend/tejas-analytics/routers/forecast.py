"""
routers/forecast.py — 24-hour energy forecast endpoints for TEJAS GRID Analytics.

Prefix  : /api/forecast
Tags    : Forecast

Routes:
    GET /24h — 24-hour ahead solar generation and campus load forecast (hourly resolution)

Forecast strategy:
    - If `openweather_api_key` is set to a real key (not 'STUB_KEY'), fetch current
      weather conditions from the OpenWeatherMap One Call API and use the cloud-cover
      percentage to modulate the solar forecast.
    - Otherwise, generate a purely synthetic forecast using the physics-based bell-curve
      model with ±10 % random variation per hour to simulate model uncertainty.
"""

import logging
import random
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException

from config import settings
from telemetry_simulator import campus_load_kw, solar_generation_kw

logger = logging.getLogger("tejas-analytics.forecast")

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# Weather helpers
# ─────────────────────────────────────────────────────────────────────────────

async def _fetch_cloud_cover_percent() -> float | None:
    """
    Fetch the current cloud-cover percentage from OpenWeatherMap.

    Uses the "Current Weather" endpoint (free tier compatible).
    Returns None on any error so the caller can fall back gracefully.
    """
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": settings.campus_lat,
        "lon": settings.campus_lon,
        "appid": settings.openweather_api_key,
        "units": "metric",
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            # clouds.all is 0–100 (% cloud cover)
            cloud_pct = data.get("clouds", {}).get("all", 0)
            logger.info("OpenWeather cloud cover: %d %%", cloud_pct)
            return float(cloud_pct)
    except Exception as exc:  # noqa: BLE001
        logger.warning("OpenWeather fetch failed (%s) — using synthetic forecast", exc)
        return None


def _cloud_pct_to_factor(cloud_pct: float) -> float:
    """
    Convert cloud-cover percentage (0–100) to a solar multiplier (0–1).

    Relationship is not strictly linear:
      - 0 %   cloud → factor 1.00  (clear sky)
      - 50 %  cloud → factor 0.65  (partly cloudy)
      - 100 % cloud → factor 0.20  (heavy overcast)
    Uses a simple quadratic approximation.
    """
    normalised = cloud_pct / 100.0
    return max(0.05, 1.0 - 0.8 * (normalised**0.75))


# ─────────────────────────────────────────────────────────────────────────────
# GET /24h
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/24h", summary="Get 24-hour energy forecast")
async def get_24h_forecast() -> dict:
    """
    Return a 24-hour ahead forecast of solar generation and campus load,
    with one data-point per hour (hours 0–23).

    **Solar forecast**:
    - If a real OpenWeatherMap API key is configured, cloud-cover data is fetched
      and used as a modulation factor for all daylight hours.
    - Otherwise a purely synthetic forecast is generated with ±10 % random noise
      added per hour to mimic forecast uncertainty.

    **Load forecast**:
    - Always uses the physics-based `campus_load_kw()` model with ±10 % noise.

    Returns:
        `generated_at`: ISO 8601 timestamp of forecast generation.
        `source`:       "openweather" | "synthetic"
        `cloud_cover_pct`: Cloud cover used (null for synthetic).
        `points`:       List of 24 hourly forecast points.
    """
    now = datetime.now(timezone.utc)

    # ── Determine cloud factor ────────────────────────────────────────────────
    cloud_cover_pct: float | None = None
    source = "synthetic"

    if settings.openweather_api_key != "STUB_KEY":
        cloud_cover_pct = await _fetch_cloud_cover_percent()
        if cloud_cover_pct is not None:
            source = "openweather"

    # ── Build hourly forecast points ──────────────────────────────────────────
    points: list[dict] = []

    for h in range(24):
        # Add ±10 % random variation to each hour to simulate forecast uncertainty
        solar_variation = random.uniform(0.90, 1.10)
        load_variation = random.uniform(0.90, 1.10)

        # Solar
        if source == "openweather" and cloud_cover_pct is not None:
            cloud_factor = _cloud_pct_to_factor(cloud_cover_pct)
        else:
            # Synthetic: apply a random per-hour cloud factor skewed towards clear
            cloud_factor = random.uniform(0.80, 1.0)

        forecast_solar = round(
            solar_generation_kw(float(h), cloud_factor) * solar_variation, 2
        )

        # Load — spike_factor = 1.0 for forecast baseline; variation models uncertainty
        forecast_load = round(campus_load_kw(float(h), spike_factor=1.0) * load_variation, 2)

        points.append(
            {
                "hour": h,
                "forecast_solar_kw": forecast_solar,
                "forecast_load_kw": forecast_load,
                # Derived — net renewable surplus/deficit
                "forecast_net_kw": round(forecast_solar - forecast_load, 2),
            }
        )

    return {
        "generated_at": now.isoformat(),
        "source": source,
        "cloud_cover_pct": cloud_cover_pct,
        "campus_lat": settings.campus_lat,
        "campus_lon": settings.campus_lon,
        "points": points,
    }
