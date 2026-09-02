# TEJAS GRID — Campus Virtual Power Plant (VPP) Platform

Unified repository for **Phase 1 (Telemetry Ingestion & Database Infrastructure)** and **Phase 2 (Predictive Yield AI Engine)**.

---

## Architecture & Technology Stack

- **Relational Store**: PostgreSQL 15 (`tejas-postgres` on port `5432`)
- **Time-Series Store**: InfluxDB 2.7 (`tejas-influxdb` on port `8086`)
  - Organization: `tejas_grid_org`
  - Bucket: `campus_telemetry`
  - Auth Token: `tejas_super_secret_influx_token_2026`
- **Telemetry Microservice**: FastAPI & Uvicorn (port `8000`)
- **AI/ML Engine**: Scikit-Learn (`RandomForestRegressor`) trained on photovoltaic irradiance conversion curves.
- **Weather Integration**: OpenWeather 5-day / 3-hour forecast API with high-fidelity 24-hour diurnal synthetic fallbacks.

---

## Directory Structure

```text
D:\tejas-grid\tejas-telemetry-service\
├── docker-compose.yml           # PostgreSQL 15 & InfluxDB 2.7 services
├── requirements.txt             # FastAPI, Uvicorn, Scikit-Learn, InfluxDB-client, NumPy
├── .env.example                 # Config template with database & API keys
├── .gitignore                   # Ignore rules for venv, cache, logs
├── README.md                    # Project documentation
└── app\
    ├── __init__.py
    ├── database.py              # InfluxDB client connection & Flux query singletons
    ├── telemetry_generator.py   # 5-second live telemetry ingestion stream with anomaly trigger
    ├── ml_engine.py             # WeatherPredictor & YieldForecastModel (Scikit-Learn)
    └── main.py                  # REST API endpoints, CORS middleware & Lifespan management
```

---

## Quick Start

### 1. Provision Databases
```bash
cd D:\tejas-grid\tejas-telemetry-service
docker compose up -d
docker ps
```

### 2. Activate Virtual Environment & Install Dependencies
```bash
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run FastAPI Telemetry & Predictive AI Service
```bash
uvicorn app.main:app --port 8000 --reload
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service metadata & available endpoints |
| `GET` | `/health` | Health status of InfluxDB, telemetry loop, and ML engine |
| `GET` | `/api/telemetry/live` | Queries InfluxDB Flux for latest single campus telemetry record |
| `POST` | `/api/telemetry/simulate-cloud-cover` | Activates cloud cover anomaly (drops solar by 65%) |
| `POST` | `/api/telemetry/reset` | Resets anomaly to nominal conditions |
| `GET` | `/api/ml/forecast/24h` | **[Phase 2]** 24-hour ML predictive yield forecast and deficit analysis |

---

## Verification Commands

```bash
# 1. Fetch 24-Hour ML Predictive Forecast (24 items, night solar == 0.0)
curl http://localhost:8000/api/ml/forecast/24h

# 2. Fetch Live Telemetry from InfluxDB
curl http://localhost:8000/api/telemetry/live

# 3. Trigger 65% Solar Drop Anomaly
curl -X POST http://localhost:8000/api/telemetry/simulate-cloud-cover

# 4. Check Telemetry After Drop
curl http://localhost:8000/api/telemetry/live

# 5. Reset Anomaly Back to Nominal
curl -X POST http://localhost:8000/api/telemetry/reset
```
