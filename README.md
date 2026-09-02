# ⚡ TEJAS GRID — Campus Virtual Power Plant (VPP)

> **Autonomous Renewable Energy Orchestration, Predictive AI Yield Forecasting & Behavioral Demand Response for Smart Campuses.**  
> *Developed for the SMART VIT HACKATHON (SVH) — Hybrid Renewable Energy Track.*

---

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![InfluxDB](https://img.shields.io/badge/InfluxDB-2.7-22ADF6?style=for-the-badge&logo=influxdb&logoColor=white)](https://www.influxdata.com)
[![Twilio](https://img.shields.io/badge/Twilio-WhatsApp_API-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://www.twilio.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

---

## 📌 Executive Summary

**TEJAS GRID** is an enterprise-grade Virtual Power Plant (VPP) designed to transition university campuses from passive energy consumers into active, dispatchable energy prosumers. 

By unifying **1,200 kW Rooftop Solar PV**, **Wind Micro-Turbines**, **Battery Energy Storage Systems (BESS)**, and **Hostel Demand Response**, TEJAS GRID maintains grid stability during sudden weather anomalies while gamifying energy conservation for thousands of student residents.

---

## 🏛️ System Architecture

```text
                               +------------------------------------------+
                               |     TEJAS SCADA MISSION CONTROL UI       |
                               |          React 18 + Vite + Tailwind      |
                               |                 Port :3000               |
                               +--------------------+---------------------+
                                                    |
                         +--------------------------+--------------------------+
                         | CORS Enabled                                        | CORS Enabled
                         v                                                     v
       +------------------------------------+                +------------------------------------+
       |      tejas-telemetry-service       |                |      tejas-core-orchestrator       |
       |        FastAPI + Python 3.11       |                |     Java 17 + Spring Boot 3.3.3    |
       |             Port :8000             |                |             Port :8080             |
       +-----------------+------------------+                +-----------------+------------------+
                         |                                                     |
         +---------------+---------------+                     +---------------+---------------+
         |                               |                     |                               |
         v                               v                     v                               v
+------------------+           +------------------+   +------------------+           +------------------+
|  InfluxDB 2.7    |           |  Predictive AI   |   |  PostgreSQL 15   |           |  Twilio WhatsApp |
|  TSDB Bucket:    |           |  Scikit-Learn    |   |  Relational DB:  |           |  Automated       |
|  campus_telemetry|           |  RandomForest 24h|   |  tejas_grid_db   |           |  Green Hour      |
|  Port :8086      |           |  PV Yield Model  |   |  Port :5432      |           |  Nudges          |
+------------------+           +------------------+   +------------------+           +------------------+
```

---

## 🚀 Key Features

### 1. ⚡ Real-Time Campus Telemetry Stream
- Generates 5-second asynchronous telemetry samples modeling solar irradiance, wind gusts, academic load curves, and Battery State of Charge (SoC).
- High-throughput ingestion into **InfluxDB 2.7** with sub-second Flux query retrieval.
- Interactive anomaly simulation: simulates instant 65% solar drop caused by rapid cloud cover events.

### 2. 🤖 24-Hour Predictive AI Yield Engine
- Machine learning model powered by **Scikit-Learn (`RandomForestRegressor`)** trained on photovoltaic conversion physics, diurnal solar curves, and temperature derating.
- Integrates with **OpenWeatherMap 5-Day/3-Hour Forecast API** with autonomous diurnal synthetic fallbacks.
- Strictly enforces physical nighttime cutoff ($0.0\text{ kW}$ between 20:00 and 05:00) and calculates peak deficit hours, max deficit kW, and deficit risk flags.

### 3. 🛡️ Deterministic 30% Critical Lab Reserve Lock
- When campus deficit spikes $> 150\text{ kW}$ or solar generation drops $> 40\%$, the orchestrator calculates optimal battery discharge ($\min(\text{deficit}, 250\text{ kW})$).
- **Core Safety Rule**: If battery $\text{SoC} \le 30.0\%$, battery discharge is strictly locked to **$0.0\text{ kW}$** (`criticalReserveLocked = true`) to safeguard mission-critical research servers and lab equipment from power failure.
- Automatically generates demand-side water pumping shift recommendations ($-60\text{ kW}$) and calculates peak tariff cost avoidance ($₹12.50/\text{kWh}$).

### 4. 📲 Behavioral Demand-Response (Twilio WhatsApp Pipeline)
- Automatic broadcast of **"Green Hour"** nudges to opted-in student residents during active grid deficits.
- Features resilient mock fallback: safely logs dispatches without breaking transactions if API credentials are unconfigured.
- Dynamic student opt-in toggle endpoint to manage notification preferences.

### 5. 🏆 Gamification & Hostel Leaderboard
- Students earn **+50 Karma points** for participating in Green Hour load shifts.
- Hostels (*Block A - Aryabhata*, *Block B - Bhaskara*, *Block C - Charaka*) ranked live by cumulative kWh energy savings and aggregated karma.

---

## 📁 Repository Structure

```text
D:\tejas-grid\
├── tejas-core-orchestrator/           # Phase 3, 4 & 5: Spring Boot 3 Core Service (:8080)
│   ├── pom.xml                        # Dependencies: Web, JPA, PostgreSQL, Twilio, Validation
│   ├── mvnw / mvnw.cmd                # Maven Wrapper (Java 17+)
│   └── src/main/
│       ├── java/com/tejas/orchestrator/
│       │   ├── TejasOrchestratorApplication.java
│       │   ├── config/                # CorsConfig, DataInitializer, RestTemplateConfig
│       │   ├── entity/                # HostelBlock, Student, DispatchEvent
│       │   ├── repository/            # Spring Data JPA Repositories
│       │   ├── dto/                   # TelemetryDto, OrchestratorStatusResponse, LeaderboardResponse
│       │   ├── service/               # OrchestrationService (Safety Engine), TwilioAlertService
│       │   └── controller/            # OrchestratorController, GamificationController, StudentController, HealthController
│       └── resources/
│           └── application.properties # PostgreSQL, FastAPI URL, Twilio Credentials
│
├── tejas-telemetry-service/           # Phase 1 & 2: FastAPI Telemetry & AI Microservice (:8000)
│   ├── docker-compose.yml             # PostgreSQL 15 & InfluxDB 2.7 Multi-Container Setup
│   ├── requirements.txt               # FastAPI, Uvicorn, InfluxDB-Client, Scikit-Learn, Requests
│   └── app/
│       ├── database.py                # InfluxDB client connection & health check
│       ├── telemetry_generator.py     # 5s asynchronous ingestion loop & anomaly simulation
│       ├── ml_engine.py               # Scikit-Learn 24h Predictive Yield & OpenWeather Predictor
│       └── main.py                    # REST API routes, CORS & Lifespan handlers
│
├── frontend/                          # SCADA Mission Control Dashboard (:3000)
│   └── tejas-ui/                      # React 18 + Vite + Tailwind CSS SPA
│       ├── src/                       # KpiCards, Mission Control Charts, Leaderboards, Dispatch Alerts
│       └── package.json
│
├── infra/                             # Database initialization scripts
│   └── init.sql                       # PostgreSQL schema definitions & seeds
├── docker-compose.yml                 # Root multi-tier container orchestration
├── .gitignore                         # Configured for Java/Maven, Python/Venv, and Node
└── README.md                          # Project Documentation
```

---

## 🛠️ Getting Started

### Prerequisites
- **Java 17+** (JDK installed and configured on PATH)
- **Python 3.10+** (with `pip` and virtual environment support)
- **Docker Desktop** (running Linux containers)
- **Node.js 18+** (for frontend development)

---

### 1. Start Database Infrastructure (Docker)

```powershell
cd D:\tejas-grid\tejas-telemetry-service
docker compose up -d
```

Verify containers are running:
```powershell
docker ps
```
- **PostgreSQL 15**: Port `5432` (`tejas_grid_db`, user: `tejas_admin`, password: `tejas_secure_pass`)
- **InfluxDB 2.7**: Port `8086` (`campus_telemetry` bucket, org: `tejas_grid_org`)

---

### 2. Start FastAPI Telemetry & Predictive AI Service (Port 8000)

```powershell
cd D:\tejas-grid\tejas-telemetry-service

# Activate Python Virtual Environment
.\.venv\Scripts\activate

# Launch Service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 3. Start Spring Boot Core Orchestrator (Port 8080)

```powershell
cd D:\tejas-grid\tejas-core-orchestrator

# Run via Maven Wrapper
.\mvnw.cmd spring-boot:run

# OR run the pre-built JAR:
java -jar target\tejas-core-orchestrator-1.0.0.jar
```
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **Orchestrator Live Status**: [http://localhost:8080/api/v1/orchestrator/status](http://localhost:8080/api/v1/orchestrator/status)

---

### 4. Start Frontend SCADA UI (Port 3000)

```powershell
cd D:\tejas-grid\frontend\tejas-ui
npm install
npm run dev
```
- **Web App**: [http://localhost:3000](http://localhost:3000)

---

## 📡 Complete API Reference

### Core Orchestrator API (`http://localhost:8080`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health, DB connection & FastAPI bridge status |
| `GET` | `/api/v1/orchestrator/status` | Real-time grid health, deficit calculation & active recommendation |
| `GET` | `/api/v1/orchestrator/status?simulatedSoc=28.0` | Test deterministic 30% battery safety reserve lock |
| `POST` | `/api/v1/orchestrator/execute-dispatch` | Confirms dispatch recommendation, credits +50 Karma to students |
| `GET` | `/api/v1/gamification/leaderboard` | Ranked hostel savings (kWh) and top student contributors |
| `POST` | `/api/v1/students/{id}/toggle-whatsapp` | Toggles student WhatsApp notification opt-in status |

### Telemetry & AI Microservice API (`http://localhost:8000`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health, InfluxDB status & ML model readiness |
| `GET` | `/api/telemetry/live` | Latest real-time campus telemetry data point from InfluxDB |
| `POST` | `/api/telemetry/simulate-cloud-cover` | Anomaly trigger: drops solar generation instantly by 65% |
| `POST` | `/api/telemetry/reset` | Resets anomaly simulation back to nominal conditions |
| `GET` | `/api/ml/forecast/24h` | 24-hour hourly AI yield forecast (solar, wind, load, net balance) |

---

## 🧪 End-to-End Verification Runbook

Run these commands in PowerShell to test the full lifecycle:

```powershell
# 1. Verify Both Service Health Checks
curl http://localhost:8000/health
# Output: {"status":"UP","service":"tejas-telemetry","influxdb":"CONNECTED","ml_engine":"READY"}

curl http://localhost:8080/health
# Output: {"status":"UP","service":"tejas-orchestrator","database":"CONNECTED","fastapi_bridge":"ACTIVE"}

# 2. Query 24-Hour ML Predictive Yield Forecast
curl http://localhost:8000/api/ml/forecast/24h

# 3. Simulate Sudden Cloud Cover Anomaly (65% Solar Drop)
curl -X POST http://localhost:8000/api/telemetry/simulate-cloud-cover

# 4. Observe Orchestrator Detect Deficit & Dispatch Green Hour Alerts
curl http://localhost:8080/api/v1/orchestrator/status

# 5. Verify 30% Battery Safety Reserve Lock (Simulated SoC <= 30%)
curl "http://localhost:8080/api/v1/orchestrator/status?simulatedSoc=24.5"
# Response guarantees: "batteryDischargeKw": 0.0, "criticalReserveLocked": true

# 6. Execute Dispatch & Award Student Karma Points
curl -X POST http://localhost:8080/api/v1/orchestrator/execute-dispatch

# 7. Check Gamification Leaderboard Updates
curl http://localhost:8080/api/v1/gamification/leaderboard

# 8. Reset Telemetry Simulation to Nominal
curl -X POST http://localhost:8000/api/telemetry/reset
```

---

## ⚙️ Configuration & Environment Variables

| Variable | Service | Default / Fallback | Description |
|---|---|---|---|
| `POSTGRES_DB` | Docker / Spring | `tejas_grid_db` | PostgreSQL Database Name |
| `POSTGRES_USER` | Docker / Spring | `tejas_admin` | Database Superuser |
| `POSTGRES_PASSWORD` | Docker / Spring | `tejas_secure_pass` | Database Password |
| `INFLUXDB_TOKEN` | Docker / FastAPI | `tejas_super_secret_influx_token_2026` | InfluxDB API Admin Token |
| `INFLUXDB_BUCKET` | Docker / FastAPI | `campus_telemetry` | Time-Series Telemetry Bucket |
| `FASTAPI_SERVICE_URL`| Spring Boot | `http://localhost:8000` | Bridge URL to FastAPI ML Service |
| `TWILIO_ACCOUNT_SID` | Spring Boot | `AC_MOCK_SID` | Twilio Account SID (auto-mock fallback) |
| `TWILIO_AUTH_TOKEN`  | Spring Boot | `mock_token` | Twilio Auth Token (auto-mock fallback) |
| `TWILIO_WHATSAPP_FROM` | Spring Boot | `whatsapp:+14155238886` | Twilio WhatsApp Sandbox Sender |
| `OPENWEATHER_API_KEY`| FastAPI | `""` | OpenWeatherMap Key (synthetic fallback) |

---

## 🏆 Presentation & Pitch Deck

- Project documentation and hackathon pitch slides are preserved in [`svh.pptx - Google Slides.pdf.png`](./svh.pptx%20-%20Google%20Slides.pdf.png).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

> *Built with pride for a smarter, sustainable, and self-sufficient campus grid.*
