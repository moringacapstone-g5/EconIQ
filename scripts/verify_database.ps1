$ErrorActionPreference = "Stop"

$Container = "econiq-postgres"
$Database = "econiq"
$User = "econiq"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " EconIQ Database Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

docker exec $Container psql -U $User -d $Database -c @"
SELECT
    (SELECT COUNT(*) FROM countries) AS countries,
    (SELECT COUNT(*) FROM data_sources) AS data_sources,
    (SELECT COUNT(*) FROM economic_indicators) AS indicators,
    (SELECT COUNT(*) FROM indicator_observations) AS observations,
    (SELECT COUNT(*) FROM source_documents) AS documents,
    (SELECT COUNT(*) FROM document_chunks) AS chunks;
"@

Write-Host ""
Write-Host "Observations by source:" -ForegroundColor Green

docker exec $Container psql -U $User -d $Database -c @"
SELECT
    ds.name AS source,
    COUNT(*) AS observations
FROM indicator_observations io
JOIN data_sources ds ON io.source_id = ds.id
GROUP BY ds.name
ORDER BY ds.name;
"@

Write-Host ""
Write-Host "Database verification complete." -ForegroundColor Green
