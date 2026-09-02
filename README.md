# ⚡ TEJAS GRID — Campus Virtual Power Plant (VPP)

> **Autonomous Renewable Energy Orchestration, Predictive AI Yield Forecasting, Real-Time WhatsApp Deficit Broadcasting & Behavioral Demand Response for Smart Campuses.**  
> *Developed for the SMART VIT HACKATHON (SVH) — Hybrid Renewable Energy Track.*

---

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Companion_Gateway-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![InfluxDB](https://img.shields.io/badge/InfluxDB-2.7-22ADF6?style=for-the-badge&logo=influxdb&logoColor=white)](https://www.influxdata.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

---

## 📌 Executive Summary

**TEJAS GRID** is an enterprise-grade Virtual Power Plant (VPP) designed to transition university campuses from passive energy consumers into active, dispatchable energy prosumers. 

By unifying **1,200 kW Rooftop Solar PV**, **Wind Micro-Turbines**, **Battery Energy Storage Systems (BESS)**, and **Hostel Demand Response**, TEJAS GRID maintains grid stability during sudden weather anomalies while gamifying energy conservation for student residents via **automated direct WhatsApp alerts**.

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
       |        FastAPI + Python 3.11       |◄───────────────┤     Java 17 + Spring Boot 3.3.3    |
       |             Port :8000             |  HTTP Polling  |             Port :8080             |
       +-----------------+------------------+                +-----------------+------------------+
                         |                                                     |
         +---------------+---------------+                     +---------------+---------------+
         |                               |                     |                               |
         v                               v                     v                               v
+------------------+           +------------------+   +------------------+           +------------------+
|  InfluxDB 2.7    |           |  Predictive AI   |   |  PostgreSQL 15   |           | WhatsApp Gateway |
|  TSDB Bucket:    |           |  Scikit-Learn    |   |  Relational DB:  |           | Baileys Socket   |
|  campus_telemetry|           |  RandomForest 24h|   |  tejas_grid_db   |           | Port :5001       |
|  Port :8086      |           |  PV Yield Model  |   |  Port :5432      |           | Direct Alerts    |
+------------------+           +------------------+   +------------------+           +--------+---------+
                                                                                              |
                                                                       Direct Push Dispatch   v
                                                                             📱 [ Student Phones ]
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

### 4. 📲 Real-Time WhatsApp Companion Gateway (Zero-Cost, Direct Delivery)
- Includes an autonomous **WhatsApp Companion Gateway (`/whatsapp-gateway`, Port 5001)** built on Node.js and `@whiskeysockets/baileys`.
- **Zero Paid Subscriptions / Zero Template Restrictions:** Direct automated delivery to student WhatsApp inboxes without paid Twilio or Meta business account limitations.
- **Easy Pairing:** Pairs in seconds via **8-digit pairing code** or real-time auto-refreshing QR code at `http://localhost:5001`.
- **Automated Deficit Broadcast:** When a cloud cover drop or demand spike occurs, the orchestrator pulls all registered students from PostgreSQL and fires personalized Green Hour reduction alerts directly to their phones.

### 5. 🏆 Gamification, Hostel Leaderboard & Student Portal
- Students earn **+50 Karma points** for participating in Green Hour load shifts.
- Hostels (*Block A - Aryabhata*, *Block B - Bhaskara*, *Block C - Charaka*) ranked live by cumulative kWh energy savings and aggregated karma.
- Student portal includes voucher redemptions, live opt-in toggles, and real-time student directory integration.

---

## 📁 Repository Structure

```text
SVH-HYBRID-RENEWABLE-ENERGY/
├── tejas-core-orchestrator/           # Spring Boot 3.3 Core Orchestration Service (:8080)
│   ├── pom.xml                        # Dependencies: Web, JPA, PostgreSQL, Twilio, Validation
│   ├── mvnw / mvnw.cmd                # Maven Wrapper
│   └── src/main/
│       ├── java/com/tejas/orchestrator/
│       │   ├── TejasOrchestratorApplication.java
│       │   ├── config/                # CorsConfig, DataInitializer, RestTemplateConfig
│       │   ├── entity/                # HostelBlock, Student, DispatchEvent
│       │   ├── repository/            # Spring Data JPA Repositories
│       │   ├── dto/                   # TelemetryDto, OrchestratorStatusResponse, LeaderboardResponse
│       │   ├── service/               # OrchestrationService (Safety Engine), TwilioAlertService
│       │   └── controller/            # OrchestratorController, GamificationController, StudentController
│       └── resources/
│           └── application.properties # PostgreSQL, FastAPI & Gateway configuration
│
├── tejas-telemetry-service/           # FastAPI Telemetry & Predictive AI Microservice (:8000)
│   ├── docker-compose.yml             # PostgreSQL 15 & InfluxDB 2.7 Multi-Container Setup
│   ├── requirements.txt               # FastAPI, Uvicorn, InfluxDB-Client, Scikit-Learn
│   └── app/
│       ├── database.py                # InfluxDB client connection & health checks
│       ├── telemetry_generator.py     # 5s asynchronous ingestion loop & anomaly simulator
│       ├── ml_engine.py               # Scikit-Learn 24h Predictive Yield & Weather Predictor
│       └── main.py                    # REST API routes & CORS configuration
│
├── whatsapp-gateway/                  # Autonomous WhatsApp Companion Dispatcher (:5001)
│   ├── package.json                   # @whiskeysockets/baileys, express, qrcode
│   └── server.js                      # 8-digit pairing portal, QR engine, and broadcast API
│
├── frontend/tejas-ui/                 # React 18 SCADA Mission Control Dashboard (:3000)
│   ├── src/                           # Recharts Area Charts, LiveAlertBanner, StudentPortal
│   └── package.json
│
├── run_tejas.bat                      # ⚡ 1-Click Complete System Windows Launcher
├── stop_tejas.bat                     # 🛑 1-Click Clean Shutdown Script
├── start_all.ps1                      # Multi-Tier PowerShell Startup Orchestrator
└── README.md                          # Master Project Documentation
```

---

## ⚡ 1-Click Launch (Recommended)

To start the entire Virtual Power Plant (Databases, AI Engine, Orchestrator, WhatsApp Gateway, and SCADA UI) simultaneously:

Double-click or run from terminal:
```cmd
run_tejas.bat
```

To stop all services cleanly:
```cmd
stop_tejas.bat
```

---

## 🛠️ Manual Step-by-Step Setup

### Prerequisites
- **Java 17+** (JDK on PATH)
- **Python 3.10+** (with virtual environment)
- **Docker Desktop** (running)
- **Node.js 18+**

---

### Step 1: Start Databases (Docker)

```powershell
cd tejas-telemetry-service
docker compose up -d
```
- **PostgreSQL 15**: Port `5432` (`tejas_grid_db`, user: `tejas_admin`, password: `tejas_secure_pass`)
- **InfluxDB 2.7**: Port `8086` (`campus_telemetry` bucket, org: `tejas_grid_org`)

---

### Step 2: Start FastAPI Telemetry & AI Engine (Port 8000)

```powershell
cd tejas-telemetry-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Step 3: Start WhatsApp Gateway (Port 5001)

```powershell
cd whatsapp-gateway
npm install
node server.js
```
- **Pairing Portal**: [http://localhost:5001](http://localhost:5001)  
  *(Enter your phone number to get an 8-digit WhatsApp pairing code or scan the QR code to link your campus sender).*

---

### Step 4: Start Spring Boot Core Orchestrator (Port 8080)

```powershell
cd tejas-core-orchestrator
mvnw.cmd package -DskipTests
java -jar target\tejas-core-orchestrator-1.0.0.jar
```
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **Grid Health API**: [http://localhost:8080/api/v1/orchestrator/status](http://localhost:8080/api/v1/orchestrator/status)

---

### Step 5: Start React SCADA Dashboard (Port 3000)

```powershell
cd frontend\tejas-ui
npm install
npm run dev
```
- **SCADA Mission Control**: [http://localhost:3000](http://localhost:3000)

---

## 📡 Key API Endpoints

### Core Orchestrator (`:8080`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health, DB connectivity & AI bridge status |
| `GET` | `/api/v1/orchestrator/status` | Live grid balance, deficit kW & active dispatch recommendations |
| `GET` | `/api/v1/orchestrator/status?simulatedSoc=28.0` | Tests deterministic 30% battery safety reserve lock |
| `POST` | `/api/v1/orchestrator/execute-dispatch` | Confirms dispatch recommendation, distributes +50 Karma |
| `GET` | `/api/v1/students` | Returns complete student directory with registration & phone |
| `POST` | `/api/v1/students/send-deficit-alert` | Triggers direct WhatsApp deficit alert to a specific student |
| `GET` | `/api/v1/gamification/leaderboard` | Live hostel rankings by kWh savings and Karma points |

### WhatsApp Gateway (`:5001`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Connection status, linked sender number, pairing state |
| `POST` | `/api/pair` | Generates 8-digit WhatsApp pairing code for any mobile number |
| `POST` | `/api/send` | Dispatches direct message to a single student |
| `POST` | `/api/broadcast` | Batch dispatches alerts to multiple student numbers |

### Telemetry & AI Microservice (`:8000`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health, InfluxDB readiness & ML engine status |
| `GET` | `/api/telemetry/live` | Real-time campus telemetry point from InfluxDB |
| `POST` | `/api/telemetry/simulate-cloud-cover` | Anomaly trigger: simulates instant 65% solar drop |
| `POST` | `/api/telemetry/reset` | Resets simulation back to nominal balanced conditions |
| `GET` | `/api/ml/forecast/24h` | 24-hour hourly AI yield forecast (solar, wind, load, net balance) |

---

## 🧪 Interactive Demo Scenarios

Use the bottom **Demo Toolbar** on `http://localhost:3000` to simulate real-world grid conditions:

1. **Nominal Balanced Grid**: Baseline midday solar generation meets campus demand.
2. **Cloud Cover Drop**: Solar generation drops by 65%. The system detects a deficit and **automatically fires WhatsApp alerts directly into student inboxes**.
3. **Demand Spike**: Campus load increases beyond renewable capacity, initiating demand response.
4. **30% Safety Lock**: Simulates battery State of Charge falling below 30%, triggering the critical lab reserve lock to protect research servers.

---

## ☁️ Deploying on Render (1-Click Blueprint)

You can deploy the complete TEJAS GRID multi-tier architecture to **[Render.com](https://render.com)** for free using the included `render.yaml` blueprint:

1. **Push your code to GitHub**: Ensure all latest code is in your GitHub repository.
2. **Log into Render**: Go to [dashboard.render.com](https://dashboard.render.com).
3. **Deploy Blueprint**:
   - Click **New +** $\rightarrow$ **Blueprint**.
   - Connect your GitHub repository: `udayraj-rgb/SVH-HYBRID-RENEWABLE-ENERGY-`.
   - Render will automatically detect `render.yaml` and provision:
     - **PostgreSQL 15 Database** (`tejas_grid_db`)
     - **FastAPI Telemetry & AI Web Service** (`tejas-telemetry`)
     - **Spring Boot Core Orchestrator** (`tejas-orchestrator`)
     - **WhatsApp Companion Gateway** (`tejas-whatsapp-gateway`)
     - **React SCADA Mission Control** (`tejas-scada-ui`)
4. Click **Apply** — Render builds and connects everything with zero manual wiring!

---

## 📄 License

Distributed under the **MIT License**.

> *Built for a smarter, sustainable, and self-sufficient campus grid.*
