# Full local stack: Postgres (Docker) → ERP API → Vite client
# Run from repo root:  powershell -ExecutionPolicy Bypass -File .\scripts\dev-local.ps1

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$compose = Join-Path $root "ERP-api\docker-compose.yml"

Write-Host "== Nordshark ERP local dev ==" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker not found. Start Postgres yourself on localhost:5433 with user/db from docker-compose, then run:" -ForegroundColor Yellow
    Write-Host "  Terminal 1: cd ERP-api; dotnet run" -ForegroundColor Gray
    Write-Host "  Terminal 2: cd ERP-client; npm run dev" -ForegroundColor Gray
    exit 1
}

Write-Host "Starting PostgreSQL (docker compose: db service)..." -ForegroundColor Green
docker compose -f $compose up -d db
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker failed (is Docker Desktop running?). Start Postgres on localhost:5433 with credentials from ERP-api/docker-compose.yml, then in two terminals run 'dotnet run' in ERP-api and 'npm run dev' in ERP-client." -ForegroundColor Yellow
    exit $LASTEXITCODE
}

Write-Host "Waiting for Postgres (port 5433)..." -ForegroundColor Green
$ok = $false
for ($i = 0; $i -lt 45; $i++) {
    try {
        $c = Get-NetTCPConnection -LocalPort 5433 -State Listen -ErrorAction SilentlyContinue
        if ($c) { $ok = $true; break }
    } catch {}
    Start-Sleep -Seconds 1
}
if (-not $ok) {
    Write-Host "Port 5433 not listening yet. Check: docker compose -f $compose ps" -ForegroundColor Yellow
}

$env:ASPNETCORE_ENVIRONMENT = "Development"
$apiDir = Join-Path $root "ERP-api"
$clientDir = Join-Path $root "ERP-client"

Write-Host "Starting API at http://localhost:8080 (new window)..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$apiDir'; `$env:ASPNETCORE_ENVIRONMENT='Development'; dotnet run"
)

Start-Sleep -Seconds 6

Write-Host "Starting Vite client (this window) — open http://localhost:5173 (or the URL Vite prints)" -ForegroundColor Green
Set-Location $clientDir
npm run dev
