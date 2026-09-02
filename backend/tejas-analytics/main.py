"""
main.py — TEJAS GRID Analytics Microservice entrypoint.

Start with:
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload

Environment variables (or .env file):
    INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET
    SIMULATION_INTERVAL_SECONDS (default 5)
"""

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers.demo import router as demo_router
from routers.forecast import router as forecast_router
from routers.telemetry import router as telemetry_router
from telemetry_simulator import simulator

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger("tejas-analytics")

# ─────────────────────────────────────────────────────────────────────────────
# APScheduler — async scheduler for the background telemetry tick
# ─────────────────────────────────────────────────────────────────────────────
scheduler = AsyncIOScheduler()


def _run_simulator_tick() -> None:
    """
    Synchronous wrapper around simulator.write_tick() called by the scheduler.
    Errors are caught and logged rather than crashing the scheduler job.
    """
    try:
        result = simulator.write_tick()
        logger.debug(
            "Tick written — solar=%.1f kW  load=%.1f kW  SoC=%.1f %%",
            result["solar_generation_kw"],
            result["campus_load_kw"],
            result["battery_soc_percent"],
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("Simulator tick failed: %s", exc)


# ─────────────────────────────────────────────────────────────────────────────
# Application lifespan (startup / shutdown)
# ─────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup:
      1. Seed 24 h of historical data so dashboards have something to display.
      2. Start the APScheduler job that writes a live tick every N seconds.

    Shutdown:
      - Gracefully stop the scheduler.
    """
    logger.info("=== TEJAS GRID Analytics — startup ===")

    # Seed historical data (runs synchronously at startup; ~1 s)
    logger.info("Seeding 24 h historical data into InfluxDB …")
    try:
        result = simulator.simulate_24h_history()
        logger.info("History seed complete: %s", result)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "History seed failed (InfluxDB not ready?): %s — continuing anyway", exc
        )

    # Start background tick scheduler
    scheduler.add_job(
        _run_simulator_tick,
        trigger="interval",
        seconds=settings.simulation_interval_seconds,
        id="telemetry_tick",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.start()
    logger.info(
        "Scheduler started — tick every %d seconds.", settings.simulation_interval_seconds
    )

    yield  # Application is running

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("Shutting down scheduler …")
    scheduler.shutdown(wait=False)
    logger.info("=== TEJAS GRID Analytics — shutdown complete ===")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI application
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Tejas Grid Analytics",
    version="1.0.0",
    description=(
        "AI-driven Virtual Power Plant analytics microservice for academic campuses. "
        "Provides real-time telemetry ingestion, 24 h energy forecasting, "
        "battery & grid KPIs, and scenario simulation for the TEJAS GRID platform."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS (permissive for development; restrict origins in production) ──────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Tighten this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(telemetry_router, prefix="/api/telemetry", tags=["Telemetry"])
app.include_router(forecast_router,  prefix="/api/forecast",  tags=["Forecast"])
app.include_router(demo_router,      prefix="/api/demo",      tags=["Demo Control"])


# ─────────────────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """
    Lightweight liveness probe.  Returns 200 OK as long as the process is
    running — no external dependency checks intentionally (use readiness probes
    for that in Kubernetes).
    """
    return {"status": "ok", "service": "tejas-analytics"}
