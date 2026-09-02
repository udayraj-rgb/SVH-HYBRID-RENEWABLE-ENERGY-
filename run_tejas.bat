@echo off
title TEJAS GRID - Multi-Tier Launcher
color 0b

echo ==========================================================
echo        TEJAS GRID VIRTUAL POWER PLANT LAUNCHER
echo ==========================================================

:: 1. Start Docker Databases
echo.
echo [1/5] Starting PostgreSQL 15 and InfluxDB 2.7 containers...
cd /d D:\tejas-grid\tejas-telemetry-service
docker compose up -d

:: 2. Start FastAPI Service
echo.
echo [2/5] Starting FastAPI Telemetry ^& AI Engine (Port 8000)...
start "TEJAS - FastAPI (Port 8000)" cmd /k "cd /d D:\tejas-grid\tejas-telemetry-service && D:\tejas-grid\tejas-telemetry-service\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: 3. Start Spring Boot Service
echo.
echo [3/5] Starting Spring Boot Core Orchestrator (Port 8080)...
start "TEJAS - Spring Boot (Port 8080)" cmd /k "cd /d D:\tejas-grid\tejas-core-orchestrator && java -jar target\tejas-core-orchestrator-1.0.0.jar"

:: 4. Start WhatsApp Broadcaster Gateway
echo.
echo [4/5] Starting WhatsApp Direct Broadcaster (Port 5001)...
start "TEJAS - WhatsApp Gateway (Port 5001)" cmd /k "cd /d D:\tejas-grid\whatsapp-gateway && node server.js"

:: 5. Start React UI
echo.
echo [5/5] Starting React SCADA Dashboard (Port 3000)...
start "TEJAS - SCADA Dashboard (Port 3000)" cmd /k "cd /d D:\tejas-grid\frontend\tejas-ui && npm run dev"

echo.
echo ==========================================================
echo  All 5 TEJAS GRID services have been launched!
echo ==========================================================
echo  SCADA Dashboard:    http://localhost:3000
echo  WhatsApp QR Portal: http://localhost:5001
echo  Spring Boot Status: http://localhost:8080/api/v1/orchestrator/status
echo  FastAPI Docs:       http://localhost:8000/docs
echo  InfluxDB Console:   http://localhost:8086
echo ==========================================================
echo.
pause
