$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$DumpFile = Join-Path $ProjectRoot "backups\econiq_database.dump"
$Container = "econiq-postgres"
$Database = "econiq"
$User = "econiq"
$ContainerDump = "/tmp/econiq_database.dump"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " EconIQ Database Restore" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $DumpFile)) {
    Write-Host "ERROR: Database dump not found:" -ForegroundColor Red
    Write-Host $DumpFile
    exit 1
}

Write-Host "[1/5] Checking PostgreSQL container..." -ForegroundColor Yellow

$containerStatus = docker inspect -f "{{.State.Running}}" $Container 2>$null

if ($containerStatus -ne "true") {
    Write-Host "PostgreSQL container is not running." -ForegroundColor Yellow
    Write-Host "Starting Docker Compose..." -ForegroundColor Yellow

    Push-Location $ProjectRoot
    docker compose up -d
    Pop-Location

    Start-Sleep -Seconds 5
}

Write-Host "[2/5] Verifying PostgreSQL..." -ForegroundColor Yellow

docker exec $Container pg_isready -U $User -d $Database

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PostgreSQL is not ready." -ForegroundColor Red
    exit 1
}

Write-Host "[3/5] Copying database dump into PostgreSQL container..." -ForegroundColor Yellow

docker cp $DumpFile "${Container}:${ContainerDump}"

Write-Host "[4/5] Restoring database..." -ForegroundColor Yellow

docker exec $Container pg_restore `
    -U $User `
    -d $Database `
    --clean `
    --if-exists `
    --no-owner `
    $ContainerDump

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "WARNING: pg_restore returned errors." -ForegroundColor Yellow
    Write-Host "Some errors can occur when objects already exist." -ForegroundColor Yellow
}

Write-Host "[5/5] Verifying restored database..." -ForegroundColor Yellow

Write-Host ""
Write-Host "Countries:" -ForegroundColor Green
docker exec $Container psql -U $User -d $Database -c "SELECT COUNT(*) AS countries FROM countries;"

Write-Host "Indicators:" -ForegroundColor Green
docker exec $Container psql -U $User -d $Database -c "SELECT COUNT(*) AS indicators FROM economic_indicators;"

Write-Host "Observations:" -ForegroundColor Green
docker exec $Container psql -U $User -d $Database -c "SELECT COUNT(*) AS observations FROM indicator_observations;"

Write-Host "Documents:" -ForegroundColor Green
docker exec $Container psql -U $User -d $Database -c "SELECT COUNT(*) AS documents FROM source_documents;"

Write-Host "Chunks:" -ForegroundColor Green
docker exec $Container psql -U $User -d $Database -c "SELECT COUNT(*) AS chunks FROM document_chunks;"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " EconIQ database restore complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
