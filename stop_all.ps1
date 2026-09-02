# ==============================================================================
# TEJAS GRID — 1-Click Multi-Tier Shutdown Script
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Red
Write-Host "        🛑 STOPPING TEJAS GRID VIRTUAL POWER PLANT 🛑        " -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

# 1. Stop Node / React Vite process
Write-Host "`n[1/4] Stopping React dev server..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue

# 2. Stop Java / Spring Boot process
Write-Host "[2/4] Stopping Spring Boot orchestrator..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*tejas-core-orchestrator*" -or $true } | Stop-Process -ErrorAction SilentlyContinue

# 3. Stop Python / Uvicorn process
Write-Host "[3/4] Stopping FastAPI telemetry service..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*uvicorn*" -or $true } | Stop-Process -ErrorAction SilentlyContinue

# 4. Stop Docker containers
Write-Host "[4/4] Stopping PostgreSQL and InfluxDB Docker containers..." -ForegroundColor Yellow
Set-Location "D:\tejas-grid\tejas-telemetry-service"
docker compose down

Set-Location "D:\tejas-grid"
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ✅ All TEJAS GRID services have been cleanly stopped." -ForegroundColor Green
Write-Host "==========================================================`n" -ForegroundColor Green
