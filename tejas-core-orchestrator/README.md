# TEJAS GRID — Core Orchestrator & Deterministic Safety Engine

Enterprise orchestration microservice built with **Java 17**, **Spring Boot 3.3.3**, **Spring Data JPA**, and **PostgreSQL**.

---

## Architecture & Features

- **Server Port**: `8080`
- **Relational Store**: PostgreSQL 15 (`tejas_grid_db` on port `5432`)
- **FastAPI Telemetry Integration**: Queries `http://localhost:8000/api/telemetry/live` to monitor grid stability, solar generation, wind power, and battery SoC.
- **Deterministic 30% Safety Rule**: Locks battery discharge to `0.0 kW` and sets `criticalReserveLocked = true` whenever battery state of charge is $\le 30.0\%$ to safeguard campus research servers and critical lab equipment.
- **Gamification & Demand Response**: Distributes Karma points to students and updates hostel energy savings when dispatch recommendations are confirmed.

---

## Directory Structure

```text
D:\tejas-grid\tejas-core-orchestrator\
├── pom.xml
├── mvnw / mvnw.cmd / .mvn/
├── README.md
└── src\main\
    ├── java\com\tejas\orchestrator\
    │   ├── TejasOrchestratorApplication.java
    │   ├── config\
    │   │   ├── RestTemplateConfig.java
    │   │   └── DataInitializer.java
    │   ├── entity\
    │   │   ├── HostelBlock.java
    │   │   ├── Student.java
    │   │   └── DispatchEvent.java
    │   ├── repository\
    │   │   ├── HostelBlockRepository.java
    │   │   ├── StudentRepository.java
    │   │   └── DispatchEventRepository.java
    │   ├── dto\
    │   │   ├── TelemetryDto.java
    │   │   ├── OrchestratorStatusResponse.java
    │   │   └── LeaderboardResponse.java
    │   ├── service\
    │   │   └── OrchestrationService.java
    │   └── controller\
    │       ├── OrchestratorController.java
    │       └── GamificationController.java
    └── resources\
        └── application.properties
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/orchestrator/status` | Real-time grid health evaluation, recommendation & 30% safety reserve state |
| `POST` | `/api/v1/orchestrator/execute-dispatch` | Executes pending recommendation & credits Karma points |
| `GET` | `/api/v1/gamification/leaderboard` | Returns ranked hostels and student top contributors |

---

## Quick Verification Commands

```bash
# 1. Check current orchestrator status
curl http://localhost:8080/api/v1/orchestrator/status

# 2. Test the 30% safety reserve constraint (simulated battery SoC <= 30.0%)
curl "http://localhost:8080/api/v1/orchestrator/status?simulatedSoc=28.0"

# 3. Confirm active dispatch & award Karma points
curl -X POST http://localhost:8080/api/v1/orchestrator/execute-dispatch

# 4. View gamification leaderboard
curl http://localhost:8080/api/v1/gamification/leaderboard
```
