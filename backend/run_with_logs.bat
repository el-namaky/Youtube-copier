@echo off
REM YouTube Copier Backend Runner with Logging

setlocal enabledelayedexpansion

REM Set Python environment variable
set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Create logs directory if it doesn't exist
if not exist "%SCRIPT_DIR%logs" mkdir "%SCRIPT_DIR%logs"

REM Generate log file with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set LOG_FILE=%SCRIPT_DIR%logs\backend_%mydate%_%mytime%.log

REM Start backend with logging
echo [%date% %time%] Starting YouTube Copier Backend >> "%LOG_FILE%"
echo Python: %PYTHON% >> "%LOG_FILE%"
echo Directory: %SCRIPT_DIR% >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Run the backend
cd /d "%SCRIPT_DIR%"
python main.py >> "%LOG_FILE%" 2>&1

REM Handle exit
if errorlevel 1 (
    echo [%date% %time%] Backend stopped with error code !errorlevel! >> "%LOG_FILE%"
) else (
    echo [%date% %time%] Backend stopped successfully >> "%LOG_FILE%"
)

echo.
echo Log file saved to: %LOG_FILE%
pause
