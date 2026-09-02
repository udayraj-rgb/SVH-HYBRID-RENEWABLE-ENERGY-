# ==============================================================================
# TEJAS GRID — 1-Click Multi-Tier Startup Script (with WhatsApp Gateway)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "        ⚡ STARTING TEJAS GRID VIRTUAL POWER PLANT ⚡        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 0. Check & Ensure Docker Engine is Running
Write-Host "`n[1/5] Checking Docker Engine..." -ForegroundColor Cyan
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Starting Docker Engine in background..." -ForegroundColor Yellow
        Start-Process "C:\Users\UDAYRAJ\AppData\Local\Programs\DockerDesktop\resources\com.docker.backend.exe" -ArgumentList "-v" -WindowStyle Hidden
        Start-Sleep -Seconds 12
    }
} catch {
    Write-Host "Attempting Docker background start..." -ForegroundColor Yellow
    Start-Process "C:\Users\UDAYRAJ\AppData\Local\Programs\DockerDesktop\resources\com.docker.backend.exe" -ArgumentList "-v" -WindowStyle Hidden
    Start-Sleep -Seconds 12
}

# 1. Start Docker Databases (PostgreSQL 15 & InfluxDB 2.7)
Write-Host "Starting PostgreSQL and InfluxDB containers..." -ForegroundColor Green
Set-Location "D:\tejas-grid\tejas-telemetry-service"
docker compose up -d

# 2. Launch FastAPI Telemetry & ML Service (Port 8000)
Write-Host "`n[2/5] Launching FastAPI Telemetry & ML Engine (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd 'D:\tejas-grid\tejas-telemetry-service'; Write-Host '=== TEJAS GRID TELEMETRY & PREDICTIVE AI (Port 8000) ===' -ForegroundColor Green; & 'D:\tejas-grid\tejas-telemetry-service\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 3. Launch Spring Boot Core Orchestrator (Port 8080)
Write-Host "`n[3/5] Launching Spring Boot Core Orchestrator (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd 'D:\tejas-grid\tejas-core-orchestrator'; Write-Host '=== TEJAS GRID CORE ORCHESTRATOR (Port 8080) ===' -ForegroundColor Yellow; java -jar target\tejas-core-orchestrator-1.0.0.jar"

# 4. Launch WhatsApp Broadcaster Gateway (Port 5001)
Write-Host "`n[4/5] Launching WhatsApp Campus Gateway (Port 5001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd 'D:\tejas-grid\whatsapp-gateway'; Write-Host '=== TEJAS WHATSAPP DIRECT BROADCASTER (Port 5001) ===' -ForegroundColor Cyan; node server.js"

# 5. Launch React SCADA Mission Control Dashboard (Port 3000)
Write-Host "`n[5/5] Launching React SCADA Dashboard (Port 3000)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "cd 'D:\tejas-grid\frontend\tejas-ui'; Write-Host '=== TEJAS SCADA MISSION CONTROL (Port 3000) ===' -ForegroundColor Magenta; npm run dev"

Set-Location "D:\tejas-grid"
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " ✅ All 5 Services Have Been Launched!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " • SCADA Dashboard:     http://localhost:3000" -ForegroundColor White
Write-Host " • WhatsApp QR Portal:  http://localhost:5001" -ForegroundColor White
Write-Host " • Spring Boot Status:  http://localhost:8080/api/v1/orchestrator/status" -ForegroundColor White
Write-Host " • FastAPI Swagger:     http://localhost:8000/docs" -ForegroundColor White
Write-Host " • InfluxDB Console:    http://localhost:8086" -ForegroundColor White
Write-Host "==========================================================`n" -ForegroundColor Cyan
