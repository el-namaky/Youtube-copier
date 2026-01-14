@echo off
REM Quick Terminal Fix Verification Script for Windows
REM This script checks if all necessary components are properly configured

cls
echo.
echo === YouTube Copier - Terminal Fix Verification ===
echo.

REM Check 1: Terminal.tsx exists and has isOpen prop
echo [1] Checking Terminal.tsx...
findstr /M "isOpen" "src\components\Terminal.tsx" >nul
if %errorlevel% equ 0 (
    echo    OK - Terminal.tsx has isOpen prop
) else (
    echo    ERROR - Terminal.tsx missing isOpen prop
)

REM Check 2: BackendControl.tsx has onRunClick prop
echo [2] Checking BackendControl.tsx...
findstr /M "onRunClick" "src\components\BackendControl.tsx" >nul
if %errorlevel% equ 0 (
    echo    OK - BackendControl.tsx has onRunClick prop
) else (
    echo    ERROR - BackendControl.tsx missing onRunClick prop
)

REM Check 3: App.tsx has Terminal at root level
echo [3] Checking App.tsx...
findstr /M "terminalOpen" "src\App.tsx" >nul
if %errorlevel% equ 0 (
    echo    OK - App.tsx has terminalOpen state
) else (
    echo    ERROR - App.tsx missing terminalOpen state
)

REM Check 4: Sidebar.tsx has onOpenTerminal prop
echo [4] Checking Sidebar.tsx...
findstr /M "onOpenTerminal" "src\components\layout\Sidebar.tsx" >nul
if %errorlevel% equ 0 (
    echo    OK - Sidebar.tsx has onOpenTerminal prop
) else (
    echo    ERROR - Sidebar.tsx missing onOpenTerminal prop
)

REM Check 5: Backend main.py has endpoints
echo [5] Checking backend/main.py...
findstr /M "/backend/start" "backend\main.py" >nul
if %errorlevel% equ 0 (
    echo    OK - Backend has /backend/start endpoint
) else (
    echo    ERROR - Backend missing /backend/start endpoint
)

findstr /M "/ws/logs" "backend\main.py" >nul
if %errorlevel% equ 0 (
    echo    OK - Backend has /ws/logs WebSocket endpoint
) else (
    echo    ERROR - Backend missing /ws/logs WebSocket endpoint
)

echo.
echo === Verification Complete ===
echo.
echo Next Steps:
echo 1. Run: npm start
echo 2. Click the [تشغيل] Run button in the sidebar
echo 3. Terminal window should appear at the bottom of the screen
echo 4. You should see backend logs in real-time
echo.
pause
