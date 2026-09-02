"""
routers/demo.py — Scenario control endpoints for TEJAS GRID Analytics.

Prefix  : /api/demo
Tags    : Demo Control

Routes:
    POST /state/{state} — Switch the simulator into a predefined fault/event scenario
    GET  /state         — Return the currently active demo state

Available states:
    normal        — Standard simulation (no overrides)
    cloud_cover   — 65 % solar reduction (overcast weather event)
    demand_spike  — 45 % load surge (large event / exam period / sports day)
"""

import logging
from typing import Literal

from fastapi import APIRouter, HTTPException

from telemetry_simulator import simulator

logger = logging.getLogger("tejas-analytics.demo")

router = APIRouter()

# Allowed state values — validated at runtime
VALID_STATES = {"normal", "cloud_cover", "demand_spike"}

# Human-readable descriptions for each state
STATE_MESSAGES = {
    "normal": (
        "Simulation returned to normal operation. "
        "All overrides cleared."
    ),
    "cloud_cover": (
        "Cloud cover event activated — solar generation reduced by ~65 %. "
        "Watch battery SoC drop and grid import increase."
    ),
    "demand_spike": (
        "Demand spike event activated — campus load increased by ~45 %. "
        "Simulates a large on-campus event or exam period."
    ),
}


# ─────────────────────────────────────────────────────────────────────────────
# POST /state/{state}
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/state/{state}",
    summary="Set demo simulation state",
)
async def set_demo_state(
    state: Literal["normal", "cloud_cover", "demand_spike"],
) -> dict:
    """
    Switch the live simulator into a predefined scenario.

    The new state takes effect on the **next** scheduler tick (within
    `simulation_interval_seconds` seconds) and is visible in the
    `/api/telemetry/latest` response and InfluxDB data.

    Args:
        state: One of `normal`, `cloud_cover`, or `demand_spike`.

    Returns:
        Confirmation JSON with the new state and a human-readable message.
    """
    if state not in VALID_STATES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid state '{state}'. Must be one of: {sorted(VALID_STATES)}",
        )

    simulator.set_demo_state(state)
    message = STATE_MESSAGES[state]
    logger.info("Demo state changed to '%s'", state)

    return {
        "status": "ok",
        "new_state": state,
        "message": message,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /state
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/state", summary="Get current demo state")
async def get_demo_state() -> dict:
    """
    Return the currently active simulation scenario state.

    Useful for the frontend to display a status badge without polling
    the telemetry endpoint.
    """
    current = simulator.get_current_state()
    state = current["demo_state"]
    return {
        "demo_state": state,
        "message": STATE_MESSAGES.get(state, "Unknown state"),
    }
