# Locobuy Quick Start Script
# Run this from the project root: .\QUICKSTART.ps1

Write-Host "🚀 Locobuy Quick Start" -ForegroundColor Cyan
Write-Host "=====================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ PostgreSQL and Redis started`n" -ForegroundColor Green

# Backend setup
Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (!(Test-Path "node_modules")) {
    Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
    npm install
}

if (!(Test-Path ".env")) {
    Write-Host "  Creating .env file..." -ForegroundColor Gray
    Copy-Item .env.example .env
}

Write-Host "✅ Backend ready`n" -ForegroundColor Green
Set-Location ..

# Frontend setup
Write-Host "Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

if (!(Test-Path "node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    npm install
}

if (!(Test-Path ".env.local")) {
    Write-Host "  Creating .env.local file..." -ForegroundColor Gray
    Copy-Item .env.local.example .env.local
}

Write-Host "✅ Frontend ready`n" -ForegroundColor Green
Set-Location ..

# Instructions
Write-Host "`n" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "`nNow run these commands in separate terminals:`n" -ForegroundColor Yellow

Write-Host "Terminal 1 (Backend):" -ForegroundColor Magenta
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host "  → Running on http://localhost:3001`n" -ForegroundColor Gray

Write-Host "Terminal 2 (Frontend):" -ForegroundColor Magenta
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  → Running on http://localhost:3000`n" -ForegroundColor Gray

Write-Host "Then visit: http://localhost:3000`n" -ForegroundColor Cyan
Write-Host "Happy coding! 🚀" -ForegroundColor Green
