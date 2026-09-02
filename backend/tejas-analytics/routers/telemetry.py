"""
routers/telemetry.py — Telemetry data endpoints for TEJAS GRID Analytics.

Prefix  : /api/telemetry
Tags    : Telemetry

Routes:
    GET  /latest       — Last written telemetry snapshot (in-memory, no DB round-trip)
    GET  /history      — Last 24 h of time-series data from InfluxDB via Flux
    POST /seed-history — Backfill 24 h of synthetic history into InfluxDB
    GET  /live-tick    — Manually fire one simulator tick and return the result
"""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException

from config import settings
from influxdb_client import InfluxDBClient
from telemetry_simulator import simulator

logger = logging.getLogger("tejas-analytics.telemetry")

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Helper — InfluxDB query client (lazy, per-request)
# ─────────────────────────────────────────────────────────────────────────────

def _get_query_api():
    """Return an InfluxDB query API client using settings from config."""
    client = InfluxDBClient(
        url=settings.influx_url,
        token=settings.influx_token,
        org=settings.influx_org,
    )
    return client.query_api()


# ─────────────────────────────────────────────────────────────────────────────
# GET /latest
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/latest", summary="Get latest telemetry snapshot")
async def get_latest() -> dict[str, Any]:
    """
    Return the most recent telemetry tick written by the simulator.

    This reads from an in-memory cache (O(1)) — no InfluxDB query required.
    Returns 404 if the simulator has not yet written its first tick.
    """
    data = simulator.get_last_tick()
    if not data:
        raise HTTPException(
            status_code=404,
            detail="No telemetry data available yet. Wait for the first simulator tick.",
        )
    return data


# ─────────────────────────────────────────────────────────────────────────────
# GET /history
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/history", summary="Get last 24 h telemetry history")
async def get_history(window_hours: int = 24) -> dict[str, Any]:
    """
    Query InfluxDB for the last `window_hours` of telemetry data using Flux.

    Args:
        window_hours: Look-back window in hours (default 24, max 168 / 7 days).

    Returns:
        JSON with `points` list, each containing timestamp + all energy fields.
    """
    window_hours = max(1, min(window_hours, 168))   # Clamp to [1, 168]

    flux_query = f"""
    from(bucket: "{settings.influx_bucket}")
      |> range(start: -{window_hours}h)
      |> filter(fn: (r) => r["_measurement"] == "energy_metrics")
      |> filter(fn: (r) =>
            r["_field"] == "solar_generation_kw"
         or r["_field"] == "wind_generation_kw"
         or r["_field"] == "campus_load_kw"
         or r["_field"] == "battery_soc_percent"
         or r["_field"] == "grid_import_kw"
         or r["_field"] == "cost_inr"
         or r["_field"] == "carbon_kg"
         or r["_field"] == "demo_state"
      )
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
    """

    try:
        query_api = _get_query_api()
        tables = query_api.query(query=flux_query, org=settings.influx_org)
    except Exception as exc:
        logger.error("InfluxDB query failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail=f"InfluxDB query error: {exc}",
        ) from exc

    points: list[dict] = []
    for table in tables:
        for record in table.records:
            points.append(
                {
                    "timestamp": record.get_time().isoformat(),
                    "solar_generation_kw": record.values.get("solar_generation_kw"),
                    "wind_generation_kw": record.values.get("wind_generation_kw"),
                    "campus_load_kw": record.values.get("campus_load_kw"),
                    "battery_soc_percent": record.values.get("battery_soc_percent"),
                    "grid_import_kw": record.values.get("grid_import_kw"),
                    "cost_inr": record.values.get("cost_inr"),
                    "carbon_kg": record.values.get("carbon_kg"),
                    "demo_state": record.values.get("demo_state"),
                }
            )

    return {
        "window_hours": window_hours,
        "point_count": len(points),
        "points": points,
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /seed-history
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/seed-history", summary="Backfill 24 h of synthetic history")
async def seed_history() -> dict[str, Any]:
    """
    Trigger a synchronous 24 h historical data backfill.

    Writes 1 440 data points (one per minute) to InfluxDB representing the
    previous 24 hours.  Call this once on initial setup or after flushing the
    bucket.  The startup lifespan event also calls this automatically.

    ⚠️  This operation takes ~1–3 seconds and blocks the request thread.
    """
    try:
        result = simulator.simulate_24h_history()
        logger.info("History seeded: %s", result)
        return {"status": "ok", **result}
    except Exception as exc:
        logger.error("History seed failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail=f"Failed to seed history: {exc}",
        ) from exc


# ─────────────────────────────────────────────────────────────────────────────
# GET /live-tick
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/live-tick", summary="Manually fire one simulator tick")
async def live_tick() -> dict[str, Any]:
    """
    Immediately compute and write one telemetry snapshot to InfluxDB.

    Useful for testing or forcing an update between scheduled intervals.
    Returns the full snapshot including computed cost and carbon KPIs.
    """
    try:
        result = simulator.write_tick()
        logger.debug("Manual live-tick fired: %s", result)
        return {"status": "ok", "data": result}
    except Exception as exc:
        logger.error("Live tick failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail=f"Simulator tick error: {exc}",
        ) from exc
