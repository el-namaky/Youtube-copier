@echo off
REM YouTube Copier - Start Both Frontend and Backend
REM This script runs both the frontend and backend simultaneously

echo.
echo =========================================
echo   YouTube Copier - Full Stack Startup
echo =========================================
echo.
echo Starting Frontend and Backend...
echo.
echo Frontend will run on: http://localhost:5173
echo Backend will run on:  http://localhost:8000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Check if concurrently is installed
npm list concurrently >nul 2>&1
if errorlevel 1 (
    echo Installing concurrently...
    call npm install --save-dev concurrently
)

REM Run both servers
call npm run dev:full

pause
