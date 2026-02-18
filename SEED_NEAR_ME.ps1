# Locobuy Seeding Helper
# Usage: .\SEED_NEAR_ME.ps1

Write-Host "🌍 Locobuy Location Seeder" -ForegroundColor Cyan
Write-Host "------------------------"

$lat = Read-Host "Enter your latitude (e.g. 40.7128)"
$lng = Read-Host "Enter your longitude (e.g. -74.0060)"

if (-not $lat -or -not $lng) {
    Write-Host "❌ Please provide both coordinates." -ForegroundColor Red
    exit
}

$body = @{
    latitude  = $lat
    longitude = $lng
} | ConvertTo-Json

try {
    Write-Host "🚀 Sending request to backend..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/seed" -Method Post -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Success! Database updated." -ForegroundColor Green
        Write-Host "   Center: " -NoNewline
        Write-Host "$lat, $lng" -ForegroundColor Cyan
        Write-Host "   Created 3 pickup locations within 500m of you."
        Write-Host "   👉 Go to http://localhost:3000/search to see them!" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Failed: " -NoNewline -ForegroundColor Red
        Write-Host $response.message
    }
}
catch {
    Write-Host "❌ Error: " -NoNewline -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host "Make sure the backend is running on http://localhost:3001" -ForegroundColor Gray
}

Write-Host ""
Read-Host "Press Enter to exit..."
