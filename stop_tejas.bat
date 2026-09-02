@echo off
title TEJAS GRID - Stop All Services
color 0c

echo ==========================================================
echo        STOPPING TEJAS GRID VIRTUAL POWER PLANT
echo ==========================================================

echo.
echo [1/4] Stopping React / WhatsApp Node servers...
taskkill /F /IM node.exe 2>nul

echo [2/4] Stopping Spring Boot / Java orchestrator...
taskkill /F /IM java.exe 2>nul

echo [3/4] Stopping FastAPI / Python service...
taskkill /F /IM python.exe 2>nul

echo [4/4] Stopping Docker containers...
cd /d D:\tejas-grid\tejas-telemetry-service
docker compose down

echo.
echo ==========================================================
echo  All TEJAS GRID services have been cleanly stopped.
echo ==========================================================
echo.
pause
