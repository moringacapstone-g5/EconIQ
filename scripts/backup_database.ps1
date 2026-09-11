$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       EconIQ Database Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

New-Item -ItemType Directory -Force backups | Out-Null

Write-Host "Creating PostgreSQL custom-format backup..." -ForegroundColor Yellow

docker exec econiq-postgres pg_dump `
    -U econiq `
    -d econiq `
    -Fc `
    > backups/econiq_database.dump

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Custom database backup failed." -ForegroundColor Red
    exit 1
}

Write-Host "Creating SQL backup..." -ForegroundColor Yellow

docker exec econiq-postgres pg_dump `
    -U econiq `
    -d econiq `
    > backups/econiq_database.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SQL database backup failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Backup completed successfully." -ForegroundColor Green
Write-Host ""

Get-ChildItem backups |
    Select-Object Name, Length
