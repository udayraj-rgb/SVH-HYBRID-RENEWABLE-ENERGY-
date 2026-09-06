# ⚡ TEJAS GRID VPP 2.0 — Rajasthan Campus Virtual Power Plant

> **Statewide Autonomous Renewable Microgrid Orchestration, High-Resolution Open-Meteo Solar Irradiance Forecasting, Multi-Tenant RBAC & Automated WhatsApp Demand Response across 20 Anchor Technical Institutions.**  
> *Developed for the Directorate of Technical Education (DTE), Government of Rajasthan & SMART VIT HACKATHON (SVH).*

---

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Solar_Radiation_API-FF6B6B?style=for-the-badge&logo=openmeteo&logoColor=white)](https://open-meteo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Companion_Gateway-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![InfluxDB](https://img.shields.io/badge/InfluxDB-2.7-22ADF6?style=for-the-badge&logo=influxdb&logoColor=white)](https://www.influxdata.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

---

## 📌 Executive Summary

**TEJAS GRID VPP 2.0** is an enterprise-grade Virtual Power Plant (VPP) designed under the **Directorate of Technical Education (DTE), Government of Rajasthan** to transform higher educational engineering campuses from passive grid consumers into synchronized, dispatchable energy prosumers.

By aggregating **4,935 kW of Solar PV arrays and Wind Micro-Turbines**, **Battery Energy Storage Systems (BESS)**, and **Hostel Demand Response** across **20 anchor government engineering institutions in 20 Rajasthan districts**, TEJAS GRID optimizes state grid stability during sudden deficit events, automates Time-of-Day (ToD) tariff arbitrage, and gamifies energy conservation for student residents via **automated direct WhatsApp alerts**.

---

## 🏛️ System Architecture

```text
                               +-------------------------------------------------------------+
                               |              TEJAS MISSION CONTROL UI (React 18)             |
                               |               Vite + Tailwind CSS (Port :3000)              |
                               |  [ DTE State Admin ]  |  [ Campus Operator ]  |  [ Student ] |
                               +-----------------------------+-------------------------------+
                                                             |
                                  REST APIs & STOMP WebSocket| (JWT Bearer Auth)
                                                             v
                               +-------------------------------------------------------------+
                               |             tejas-core-orchestrator (Spring Boot 3.3.3)     |
                               |                     Java 17 (Port :8080)                    |
                               |   - Multi-Tenant RBAC Security Filter                       |
                               |   - 20-Campus Microgrid Dispatch Optimizer                 |
                               |   - Time-of-Day (ToD) Peak Tariff Arbitrage                 |
                               |   - Deterministic 30% Critical Lab Reserve Lock             |
                               +--------------+-------------------+--------------------------+
                                              |                   |
                        Live Meteorological   |                   | Relational Persistence
                        Irradiance Polling    |                   | (Users, Campuses, Advisories)
                                              v                   v
                        +----------------------------+   +----------------------------+
                        |   OPEN-METEO SOLAR API     |   |       PostgreSQL 15        |
                        |   - Global Horizontal (GHI)|   |       Port :5432           |
                        |   - Direct Normal (DNI)    |   | - 20 Anchor Campuses       |
                        |   - 2m Ambient Temperature |   | - Multi-Tenant Users (JWT) |
                        |   - 10m Wind Velocity      |   | - Hostel Blocks & Karma    |
                        |   (20 Rajasthan Districts) |   | - Bilingual Advisories     |
                        +----------------------------+   +-------------+--------------+
                                                                       |
                                                Green Hour Broadcast   | Alert Trigger
                                                                       v
                                                         +----------------------------+
                                                         |  WhatsApp Companion Gateway|
                                                         |   Node.js / Baileys :5001  |
                                                         |   (Zero-Cost Student Push) |
                                                         +-------------+--------------+
                                                                       |
                                                                       v
                                                             📱 [ Student Devices ]
```

---

## 🚀 Key Features

### 1. ☀️ Open-Meteo High-Resolution Solar & Weather Engine (`WeatherForecastService.java`)
- **Real-Time Meteorological Ingestion**: Core orchestrator connects to **Open-Meteo High-Resolution Radiation API** (`https://api.open-meteo.com/v1/forecast`) dynamically using the exact geospatial coordinates $(\text{lat}, \text{lon})$ of all **20 anchor campuses** across 20 Rajasthan districts.
- **Physics-Informed Solar Yield Modeling**:
  $$P_{\text{solar}} = C_{\text{kW}} \times \left(\frac{\text{GHI}}{1000}\right) \times \left[1 - \gamma \cdot (T_{\text{cell}} - 25^\circ\text{C})\right] \times \eta_{\text{inverter}}$$
  where:
  - $\text{GHI}$ = Shortwave Solar Radiation ($\text{W/m}^2$)
  - $\text{DNI}$ = Direct Normal Irradiance ($\text{W/m}^2$)
  - $T_{\text{ambient}}$ = 2-meter air temperature ($^\circ\text{C}$)
  - Cell temperature $T_{\text{cell}} = T_{\text{ambient}} + \left(\frac{\text{NOCT} - 20}{800}\right) \times \text{GHI}$
- **Nighttime Solar Cutoff**: Strictly enforces physical astronomical solar boundaries ($0.0\text{ kW}$ generation between 20:00 and 05:00).
- **1-Hour In-Memory Cache**: Built-in concurrent caching to reduce latency and protect external rate limits, backed by astronomical diurnal solar curve fallbacks.

### 2. 🏛️ Statewide Multi-Tenant RBAC & DTE Command Center
- **DTE State Admin (`ROLE_GOVT`)**:
  - Directorate-level oversight across all 20 anchor technical campuses.
  - Statewide MW load-shaving metrics, district comparative efficiency rankings, and NAAC Criterion 7.1.2 audit compliance.
- **Campus Facility Operator (`ROLE_OPERATOR`)**:
  - SCADA microgrid station control scoped to assigned institution (e.g., Engineering College Bikaner, MBM Jodhpur, etc.).
  - Campus-isolated Student Directory with registration management and direct Karma rewards.
- **Student Resident (`ROLE_STUDENT`)**:
  - Hostel room energy consumption monitoring, Green Hour load-shift participation, and Karma point redemptions.
  - Dedicated **Public Kiosk Mode** displaying live campus renewables, BESS state, and student energy leaderboards.

### 3. 📢 Active Bilingual Operational Advisories (Hindi & English)
- Autonomous generation and broadcast of bilingual situational advisories for operators and administrators:
  - `CRITICAL_WARNING`: High grid deficit and battery reserve warnings.
  - `RECOMMENDED_ACTION`: Peak-shaving battery discharge or water pump load-shifting during high solar windows.
  - `INFO`: Normal ToD tariff transition notifications.
- Complete bilingual title and recommendation payloads (`titleEn`, `titleHi`, `messageEn`, `messageHi`).

### 4. 🛡️ Deterministic 30% Critical Lab Reserve Lock
- During campus deficit spikes ($> 150\text{ kW}$) or cloud cover drops, the microgrid optimizer calculates optimal battery discharge ($\min(\text{deficit}, 250\text{ kW})$).
- **Core Safety Rule**: If battery State of Charge $\text{SoC} \le 30.0\%$, discharge is immediately and deterministically locked to **$0.0\text{ kW}$** (`criticalReserveLocked = true`) to safeguard mission-critical research servers and laboratories from total outage.

### 5. 📲 Real-Time WhatsApp Companion Gateway (Zero-Cost Direct Delivery)
- Autonomous Node.js companion dispatcher (`/whatsapp-gateway`, Port 5001) built on `@whiskeysockets/baileys`.
- **Zero Paid Subscriptions / Zero API Fees**: Direct delivery to student WhatsApp numbers without Twilio or Meta business account limitations.
- **Pairing Options**: Pairs in seconds via **8-digit pairing code** or real-time QR code at `http://localhost:5001`.
- **Automated Deficit Broadcast**: When a cloud cover drop or demand spike occurs, the orchestrator triggers direct Green Hour reduction alerts with 1-click WhatsApp chat links.

### 6. 🎨 Split-Hero Login Portal & Rajasthan Heritage Visuals
- High-resolution Rajasthan clean energy artwork featuring the Ashoka Stambh Lion Capital, Government of Rajasthan insignia, solar fields, wind turbines, desert dunes, and forts.
- Responsive split-hero interface with live grid metric counters (20 Campuses, 5,338 t $\text{CO}_2$ Displaced, A++ Tier NAAC 7.1.2).

---

## 🔬 Note on Solar Engine Architecture & Python / Scikit-Learn

> **Why are Scikit-Learn and Python present in the repository?**
>
> - **Initial Hackathon Prototype (`tejas-telemetry-service/`)**:  
>   During Phase 1/Phase 2 of the initial SVH prototype, a Python microservice was developed with **Scikit-Learn (`RandomForestRegressor`)** to demonstrate historical baseline curve fitting and InfluxDB time-series streaming.
>
> - **Live Production Engine (TEJAS GRID VPP 2.0)**:  
>   For the enterprise deployment across all **20 anchor technical campuses of Rajasthan**, the system was upgraded to directly utilize the **Open-Meteo High-Resolution Solar Radiation API** within the Spring Boot Core Orchestrator (`WeatherForecastService.java`). This provides real-time, empirical Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI) without requiring third-party API keys or localized model re-training.
>
> Both modules are preserved in the repository: the Spring Boot + Open-Meteo service acts as the live production brain, while the Python FastAPI module is available for standalone IoT telemetry benchmarking and ML experimentation.

---

## 📁 Repository Structure

```text
svh/
├── tejas-core-orchestrator/           # Spring Boot 3.3.3 Core Orchestration Service (:8080)
│   ├── pom.xml                        # Dependencies: Web, Security (JWT), JPA, PostgreSQL, WebSocket
│   ├── mvnw / mvnw.cmd                # Maven Wrapper
│   └── src/main/java/com/tejas/orchestrator/
│       ├── config/                    # SecurityConfig, CorsConfig, WebSocketConfig, DataInitializer
│       ├── controller/                # AuthController, GovtAdminController, OperatorController, StudentController
│       ├── dto/                       # WeatherForecastDTO, AuthRequest, TelemetryIngestDTO
│       ├── entity/                    # Campus, District, User, Role, Student, HostelBlock, Advisory
│       ├── repository/                # CampusRepository, DistrictRepository, UserRepository, StudentRepository
│       ├── security/                  # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
│       └── service/                   # WeatherForecastService (Open-Meteo), MicrogridDispatchOptimizerService,
│                                      # OperationalAdvisoryService, StudentKioskService
│
├── frontend/tejas-ui/                 # React 18 SCADA Mission Control Dashboard (:3000)
│   ├── src/
│   │   ├── api/                       # Axios client & STOMP WebSocket connection
│   │   ├── components/                # MicrogridFormulaModal, LiveAlertBanner, DemoToolbar
│   │   ├── data/                      # 20 Rajasthan Anchor Campuses metadata & coordinates
│   │   ├── pages/                     # LoginPage (Split-Hero), ExecutiveDashboard (DTE Admin),
│   │   │                              # FacilityHub (Operator SCADA), StudentDirectory, PublicKiosk
│   │   └── App.jsx
│   ├── public/                        # Official Rajasthan clean energy artwork assets
│   └── package.json
│
├── whatsapp-gateway/                  # Autonomous WhatsApp Companion Dispatcher (:5001)
│   ├── package.json                   # @whiskeysockets/baileys, express, qrcode
│   └── server.js                      # 8-digit pairing portal, QR engine, and broadcast API
│
├── tejas-telemetry-service/           # FastAPI Telemetry & ML Prototype (:8000)
│   ├── docker-compose.yml             # PostgreSQL 15 & InfluxDB 2.7 services
│   ├── requirements.txt               # FastAPI, Uvicorn, Scikit-Learn, InfluxDB-client
│   └── app/                           # InfluxDB telemetry generator & Scikit-Learn RandomForest prototype
│
├── infra/migrations/                  # SQL Seeds: Multi-Tenant RBAC, 20 Districts, 20 Campuses, Hostels
├── run_tejas.bat                      # ⚡ 1-Click Complete System Windows Launcher
├── stop_tejas.bat                     # 🛑 1-Click Clean Shutdown Script
├── start_all.ps1                      # Multi-Tier PowerShell Startup Orchestrator
└── README.md                          # Master Project Documentation
```

---

## ⚡ 1-Click Launch (Recommended)

To start the entire Virtual Power Plant (PostgreSQL, Orchestrator, WhatsApp Gateway, and SCADA UI) simultaneously:

Double-click or run from terminal:
```cmd
run_tejas.bat
```

To stop all services cleanly:
```cmd
stop_tejas.bat
```

---

## 🛠️ Step-by-Step Manual Setup

### 1. Start PostgreSQL Database
```powershell
# Ensure PostgreSQL 15 is running on port 5432
# Default DB: tejas_grid_db, User: tejas_admin, Password: tejas_secure_pass
```

### 2. Start Spring Boot Core Orchestrator (Port 8080)
```powershell
cd tejas-core-orchestrator
.\mvnw.cmd package -DskipTests
java -jar target\tejas-core-orchestrator-1.0.0.jar
```
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **Open-Meteo Solar Forecast API**: `http://localhost:8080/api/v1/operator/weather-forecast?campusId=1`

### 3. Start WhatsApp Gateway (Port 5001)
```powershell
cd whatsapp-gateway
npm install
node server.js
```
- **Pairing Portal**: [http://localhost:5001](http://localhost:5001)

### 4. Start React SCADA Dashboard (Port 3000)
```powershell
cd frontend\tejas-ui
npm install
npm run dev
```
- **Portal URL**: [http://localhost:3000](http://localhost:3000)

---

## 📡 Key API Endpoints

### Core Orchestrator (`:8080`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Multi-tenant JWT authentication (DTE Admin, Operator, Student) |
| `GET` | `/api/v1/operator/weather-forecast?campusId={id}` | **Live Open-Meteo 48h Solar Radiation & Weather Forecast** |
| `GET` | `/api/v1/operator/dispatch-schedule?campusId={id}` | 24-hour ToD tariff-optimized BESS and generation dispatch |
| `GET` | `/api/v1/admin/govt/advisories/active` | Statewide Active Bilingual Operational Advisories |
| `POST` | `/api/v1/admin/govt/advisories/{id}/acknowledge` | DTE Directorate acknowledgment of operational advisory |
| `GET` | `/api/v1/operator/students` | Campus-scoped student directory for assigned college |
| `GET` | `/api/v1/kiosk/summary?campusId={id}` | Public Kiosk live metrics & leaderboard |

### WhatsApp Gateway (`:5001`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Connection status, linked sender number, pairing state |
| `POST` | `/api/pair` | Generates 8-digit WhatsApp pairing code for any mobile number |
| `POST` | `/api/broadcast` | Batch dispatches alerts to multiple student numbers |

---

## 📄 License

Distributed under the **MIT License**.

> *Built for a smarter, sustainable, and self-sufficient technical education campus grid.*

