# TEJAS GRID

> **AI-Driven Virtual Power Plant for Academic Campuses** -- turning student behaviour into dispatchable demand-response assets.

![Docker](https://img.shields.io/badge/Docker-Compose_v3.8-2496ED?logo=docker&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![InfluxDB](https://img.shields.io/badge/InfluxDB-2.7-22ADF6?logo=influxdb&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)

---

## Architecture

\                     +--------------------+
                     |     tejas-ui       |  :3000
                     |  React + Nginx SPA |
                     +--------+-----------+
                              | /api/*  (reverse-proxy)
                     +--------v-----------+
                     |    tejas-core      |  :8080
                     |  Spring Boot REST  |
                     +----+----------+----+
                          |          |
           +--------------+          +--------------+
           |                                        |
+----------v----------+              +--------------v-------+
|      postgres        |             |       influxdb        |
|  PostgreSQL 15 (DDL) |  :5432      |  InfluxDB 2.7 TSDB   |  :8086
|  tejasdb schema      |             |  campus-telemetry     |
+---------------------+              +----------+-----------+
                                                |
                                    +-----------v-----------+
                                    |   tejas-analytics     |  :8000
                                    |  FastAPI + ML Engine  |
                                    +-----------------------+

External:  Twilio WhatsApp API  |  OpenWeatherMap API
\
---

## Quick Start

### Prerequisites
- Docker Desktop >= 24.x
- Docker Compose >= 2.x

### 1. Clone the repository
\\ash
git clone https://github.com/your-org/tejas-grid.git
cd tejas-grid
\
### 2. Configure secrets (optional for local dev)
All environment variables have safe stub defaults. For real deployments copy \.env.example\ to \.env\ and fill in real values.

### 3. Launch the full stack
\\ash
docker-compose up --build -d
\
### 4. Verify services

| Service          | URL                           | Notes                    |
|------------------|-------------------------------|--------------------------|
| tejas-ui         | http://localhost:3000         | React dashboard          |
| tejas-core       | http://localhost:8080/actuator| Spring Boot health check |
| tejas-analytics  | http://localhost:8000/docs    | FastAPI Swagger UI       |
| InfluxDB Console | http://localhost:8086         | Login: tejas-admin       |
| PostgreSQL       | localhost:5432                | DB: tejasdb user: tejas  |

### 5. Tear down
\\ash
docker-compose down -v   # -v also removes named volumes
\
---

## Environment Variables Reference

### tejas-core (Spring Boot)

| Variable | Default / Stub | Description |
|---|---|---|
| SPRING_DATASOURCE_URL | jdbc:postgresql://postgres:5432/tejasdb | PostgreSQL JDBC URL |
| SPRING_DATASOURCE_USERNAME | tejas | DB username |
| SPRING_DATASOURCE_PASSWORD | tejas123 | DB password |
| SPRING_JPA_HIBERNATE_DDL_AUTO | validate | Hibernate DDL strategy |
| INFLUXDB_URL | http://influxdb:8086 | InfluxDB v2 endpoint |
| INFLUXDB_TOKEN | tejas-influx-token-super-secret | InfluxDB admin token |
| INFLUXDB_ORG | tejas-org | InfluxDB organisation |
| INFLUXDB_BUCKET | campus-telemetry | InfluxDB telemetry bucket |
| TWILIO_ACCOUNT_SID | ACxxx... | Twilio account SID (stub) |
| TWILIO_AUTH_TOKEN | your_twilio_auth_token_here | Twilio auth token (stub) |
| TWILIO_FROM_NUMBER | +15005550006 | WhatsApp sender (Twilio sandbox) |
| SPRING_PROFILES_ACTIVE | docker | Active Spring profile |

### tejas-analytics (FastAPI)

| Variable | Default / Stub | Description |
|---|---|---|
| INFLUXDB_URL | http://influxdb:8086 | InfluxDB v2 endpoint |
| INFLUXDB_TOKEN | tejas-influx-token-super-secret | InfluxDB admin token |
| INFLUXDB_ORG | tejas-org | InfluxDB organisation |
| INFLUXDB_BUCKET | campus-telemetry | InfluxDB bucket |
| OPENWEATHER_API_KEY | your_openweather_api_key_here | OpenWeatherMap API key |
| CAMPUS_LATITUDE | 19.0760 | Campus latitude (Mumbai) |
| CAMPUS_LONGITUDE | 72.8777 | Campus longitude (Mumbai) |

---

## API Endpoints Overview

### tejas-core REST API (:8080)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/assets | List all campus energy assets |
| GET | /api/assets/{id} | Get a single asset by UUID |
| GET | /api/hostels | List hostel blocks with leaderboard data |
| GET | /api/hostels/{id}/leaderboard | Points leaderboard for a hostel |
| GET | /api/students | List all registered students |
| POST | /api/students | Register a new student |
| GET | /api/students/{id} | Get student profile + karma |
| POST | /api/dispatch | Trigger a demand-response dispatch event |
| GET | /api/dispatch | List dispatch history |
| GET | /api/rewards | List available rewards |
| POST | /api/rewards/redeem | Redeem a reward (deducts karma points) |
| GET | /actuator/health | Spring Boot health endpoint |

### tejas-analytics ML API (:8000)

| Method | Path | Description |
|--------|------|-------------|
| GET | /docs | Swagger UI (auto-generated) |
| GET | /health | Service health check |
| GET | /forecast/solar | Solar irradiance forecast (next 24h) |
| GET | /forecast/load | Campus load demand forecast |
| GET | /telemetry/summary | Real-time telemetry from InfluxDB |
| POST | /dispatch/recommend | AI recommendation for next dispatch window |
| GET | /gamification/scores | Aggregated scores by hostel |

---

## Demo Scenarios

### Scenario 1 -- Peak-Demand Dispatch
1. Analytics engine detects campus load approaching 400 kW between 18:00-20:00.
2. A DISPATCH event is created via POST /api/dispatch with event_type=PEAK_SHAVING.
3. tejas-core sends WhatsApp push notifications to opted-in students via Twilio.
4. Students reduce non-essential loads (AC, EV charging).
5. Each participating hostel earns karma points; leaderboard updates in real time.

### Scenario 2 -- Solar Surplus BESS Charge
1. Morning solar generation exceeds campus load by 120 kW.
2. Analytics forecasts continued surplus; recommends BESS charge.
3. A BESS_CHARGE event is dispatched automatically.
4. Students see a Green Surplus badge on the dashboard.

### Scenario 3 -- Gamification Reward Redemption
1. Student accumulates 500 karma points by reducing hostel consumption.
2. Student redeems Movie Night Pass via POST /api/rewards/redeem.
3. Points are deducted; redemption is logged in redemption_log.
4. Student receives WhatsApp confirmation.

---

## Database Schema

\campus_asset    -- Physical generation/storage assets (Solar, Wind, BESS)
hostel_block    -- Residential blocks with aggregate points and savings
student_profile -- Individual student + karma + opt-in status
dispatch_event  -- VPP demand-response dispatch history
reward          -- Reward catalogue (Wi-Fi tokens, vouchers, etc.)
redemption_log  -- Point-spend audit trail per student
\
---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Nginx |
| API Gateway | Spring Boot 3 (Java 21), Spring Data JPA |
| Analytics Engine | FastAPI 0.111 (Python 3.11), uvicorn |
| Relational DB | PostgreSQL 15 (uuid-ossp, TimestampTZ) |
| Time-Series DB | InfluxDB 2.7 (Flux query language) |
| Messaging | Twilio WhatsApp Business API |
| Weather Data | OpenWeatherMap One Call API 3.0 |
| Containerisation | Docker Compose 3.8, multi-stage builds |

---

## Project Structure

\tejas-grid/
+-- docker-compose.yml         # Full-stack orchestration
+-- README.md
+-- infra/
|   +-- init.sql               # PostgreSQL DDL + seed data
+-- backend/
|   +-- tejas-core/            # Spring Boot service
|   |   +-- Dockerfile
|   |   +-- pom.xml
|   |   +-- src/
|   +-- tejas-analytics/       # FastAPI ML engine
|       +-- Dockerfile
|       +-- requirements.txt
|       +-- main.py
+-- frontend/
    +-- tejas-ui/              # React + Vite SPA
        +-- Dockerfile
        +-- nginx.conf
        +-- package.json
        +-- src/
\
---

## Contributing

1. Create a feature branch: git checkout -b feat/your-feature
2. Follow conventional commits: feat:, fix:, docs:, chore:
3. Open a pull request -- CI will run lint and tests automatically.

---

## License

MIT License -- see LICENSE for details.

> Built with love for a greener campus.
