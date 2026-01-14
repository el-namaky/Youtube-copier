#!/usr/bin/env pwsh
# YouTube Copier - Startup Script

Write-Host "`n" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  YouTube Copier Startup Menu" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "`n"

Write-Host "Select an option:" -ForegroundColor Yellow
Write-Host "1. Run Frontend + Backend (Full Stack)" -ForegroundColor Green
Write-Host "2. Run Frontend Only" -ForegroundColor Blue
Write-Host "3. Run Backend Only" -ForegroundColor Magenta
Write-Host "4. Exit" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting Frontend + Backend..." -ForegroundColor Green
        Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
        Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop both`n" -ForegroundColor Yellow
        npm run dev:full
    }
    "2" {
        Write-Host "`nStarting Frontend only..." -ForegroundColor Blue
        Write-Host "Frontend: http://localhost:5173" -ForegroundColor Blue
        Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow
        npm run dev
    }
    "3" {
        Write-Host "`nStarting Backend only..." -ForegroundColor Magenta
        Write-Host "Backend: http://localhost:8000" -ForegroundColor Magenta
        Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow
        npm run backend
    }
    "4" {
        Write-Host "Goodbye!" -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "Invalid choice. Please select 1-4." -ForegroundColor Red
        exit
    }
}
