@echo off
REM YouTube Copier - Start Only Backend

echo.
echo =========================================
echo   YouTube Copier - Backend Only
echo =========================================
echo.
echo Starting Backend only...
echo Backend will run on: http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo.

cd backend
python main.py

pause
