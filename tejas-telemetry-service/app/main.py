import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.database import (
    get_query_api,
    check_influx_health,
    close_influx_client,
    INFLUXDB_BUCKET,
    INFLUXDB_ORG,
)
from app.telemetry_generator import (
    run_telemetry_loop,
    set_cloud_cover_drop,
    get_cloud_cover_drop,
    generate_telemetry_sample,
)
from app.ml_engine import YieldForecastModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("tejas.api")

# Reference to background telemetry task & ML engine singleton
_telemetry_task: Optional[asyncio.Task] = None
_yield_model: Optional[YieldForecastModel] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown events."""
    global _telemetry_task, _yield_model
    logger.info("Starting TEJAS GRID Telemetry & ML Service...")
    
    # Initialize ML yield forecast model
    _yield_model = YieldForecastModel()

    # Start background telemetry generator loop
    _telemetry_task = asyncio.create_task(run_telemetry_loop())
    
    yield
    
    # Graceful shutdown
    logger.info("Shutting down TEJAS GRID Telemetry & ML Service...")
    if _telemetry_task:
        _telemetry_task.cancel()
        try:
            await _telemetry_task
        except asyncio.CancelledError:
            pass
    close_influx_client()


app = FastAPI(
    title="TEJAS GRID - Telemetry & Predictive AI Service",
    description="Campus Virtual Power Plant (VPP) Telemetry Stream and Scikit-Learn Predictive Yield Engine",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class AnomalyResponse(BaseModel):
    status: str
    cloud_cover_drop: bool
    message: str


class TelemetryDataPoint(BaseModel):
    timestamp: str
    solar_generation_kw: float
    wind_generation_kw: float
    total_generation_kw: float
    campus_load_kw: float
    net_power_kw: float
    battery_soc_percent: float
    cloud_cover_drop: bool
    data_source: str


class HourlyForecastItem(BaseModel):
    timestamp: str
    hour: int
    predicted_solar_kw: float
    predicted_wind_kw: float
    total_generation_kw: float
    predicted_campus_load_kw: float
    net_balance_kw: float
    deficit_risk: bool
    temperature_c: float
    cloud_cover_percent: float
    solar_irradiance_index: float


class ForecastSummary(BaseModel):
    peak_deficit_hour: str
    total_projected_solar_kwh: float
    max_deficit_kw: float
    total_projected_wind_kwh: Optional[float] = None
    total_projected_load_kwh: Optional[float] = None
    hours_at_deficit_risk: Optional[int] = None
    weather_source: Optional[str] = None


class Forecast24hResponse(BaseModel):
    hourly_forecast: List[HourlyForecastItem]
    summary: ForecastSummary


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "tejas-telemetry",
        "status": "online",
        "version": "2.0.0",
        "endpoints": {
            "health": "/health",
            "live_telemetry": "/api/telemetry/live",
            "simulate_cloud_cover": "/api/telemetry/simulate-cloud-cover",
            "reset_anomaly": "/api/telemetry/reset",
            "ml_forecast_24h": "/api/ml/forecast/24h",
        },
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Unified health check endpoint returning {"status": "UP", "service": "tejas-telemetry"}
    """
    influx_ok = check_influx_health()
    task_running = _telemetry_task is not None and not _telemetry_task.done()
    ml_ready = _yield_model is not None
    is_healthy = influx_ok and task_running and ml_ready

    return {
        "status": "UP" if is_healthy else "DOWN",
        "service": "tejas-telemetry",
        "influxdb": "CONNECTED" if influx_ok else "DISCONNECTED",
        "telemetry_stream": "ACTIVE" if task_running else "INACTIVE",
        "ml_engine": "READY" if ml_ready else "INITIALIZING",
        "cloud_cover_drop": get_cloud_cover_drop(),
    }


@app.get("/api/telemetry/live", response_model=TelemetryDataPoint, tags=["Telemetry"])
async def get_live_telemetry():
    """
    Fetch the latest single telemetry data point from InfluxDB using Flux.
    Falls back to current sample if InfluxDB is initializing.
    """
    query_api = get_query_api()
    flux_query = f'''
        from(bucket: "{INFLUXDB_BUCKET}")
            |> range(start: -15m)
            |> filter(fn: (r) => r["_measurement"] == "campus_telemetry")
            |> last()
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    '''

    try:
        tables = query_api.query(flux_query, org=INFLUXDB_ORG)
        latest_record = None
        for table in tables:
            for record in table.records:
                latest_record = record.values
                break

        if latest_record:
            time_val = latest_record.get("_time")
            ts_str = time_val.isoformat() if time_val else ""
            solar = float(latest_record.get("solar_generation_kw", 0.0))
            wind = float(latest_record.get("wind_generation_kw", 0.0))
            load = float(latest_record.get("campus_load_kw", 0.0))
            total_gen = float(latest_record.get("total_generation_kw", solar + wind))
            net_power = float(latest_record.get("net_power_kw", total_gen - load))
            soc = float(latest_record.get("battery_soc_percent", 50.0))
            drop = bool(latest_record.get("cloud_cover_drop", False))

            return TelemetryDataPoint(
                timestamp=ts_str,
                solar_generation_kw=round(solar, 2),
                wind_generation_kw=round(wind, 2),
                total_generation_kw=round(total_gen, 2),
                campus_load_kw=round(load, 2),
                net_power_kw=round(net_power, 2),
                battery_soc_percent=round(soc, 2),
                cloud_cover_drop=drop,
                data_source="influxdb",
            )
    except Exception as exc:
        logger.warning("Failed querying InfluxDB, checking fallback: %s", exc)

    # Fallback if InfluxDB has not collected first point yet or query failed
    sample = generate_telemetry_sample()
    return TelemetryDataPoint(
        timestamp=sample["timestamp"],
        solar_generation_kw=sample["solar_generation_kw"],
        wind_generation_kw=sample["wind_generation_kw"],
        total_generation_kw=sample["total_generation_kw"],
        campus_load_kw=sample["campus_load_kw"],
        net_power_kw=sample["net_power_kw"],
        battery_soc_percent=sample["battery_soc_percent"],
        cloud_cover_drop=sample["cloud_cover_drop"],
        data_source="live_generator_fallback",
    )


@app.post("/api/telemetry/simulate-cloud-cover", response_model=AnomalyResponse, tags=["Anomaly Simulation"])
async def simulate_cloud_cover():
    """
    Trigger cloud cover anomaly: instantly drops solar_generation_kw by 65%.
    """
    set_cloud_cover_drop(True)
    return AnomalyResponse(
        status="success",
        cloud_cover_drop=True,
        message="Cloud cover anomaly activated. Solar generation dropped by 65%.",
    )


@app.post("/api/telemetry/reset", response_model=AnomalyResponse, tags=["Anomaly Simulation"])
async def reset_anomaly():
    """
    Reset simulation to nominal operating conditions (cloud_cover_drop = False).
    """
    set_cloud_cover_drop(False)
    return AnomalyResponse(
        status="success",
        cloud_cover_drop=False,
        message="Simulation reset to nominal conditions. Solar generation restored.",
    )


@app.get("/api/ml/forecast/24h", response_model=Forecast24hResponse, tags=["Predictive AI"])
async def get_24h_yield_forecast():
    """
    Returns 24-hour predictive yield forecast based on OpenWeather API inputs
    (or synthetic diurnal fallbacks) and Scikit-Learn conversion models.
    """
    global _yield_model
    if _yield_model is None:
        _yield_model = YieldForecastModel()

    forecast_data = _yield_model.predict_24h_forecast()
    return forecast_data
