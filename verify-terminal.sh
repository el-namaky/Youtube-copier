#!/bin/bash

# Quick Terminal Fix Verification Script
# This script checks if all necessary components are properly configured

echo "=== YouTube Copier - Terminal Fix Verification ==="
echo ""

# Check 1: Terminal.tsx exists and has isOpen prop
echo "✓ Checking Terminal.tsx..."
if grep -q "isOpen" "src/components/Terminal.tsx"; then
    echo "  ✓ Terminal.tsx has isOpen prop"
else
    echo "  ✗ Terminal.tsx missing isOpen prop"
fi

# Check 2: BackendControl.tsx has onRunClick prop
echo "✓ Checking BackendControl.tsx..."
if grep -q "onRunClick" "src/components/BackendControl.tsx"; then
    echo "  ✓ BackendControl.tsx has onRunClick prop"
else
    echo "  ✗ BackendControl.tsx missing onRunClick prop"
fi

# Check 3: App.tsx has Terminal at root level
echo "✓ Checking App.tsx..."
if grep -q "terminalOpen" "src/App.tsx"; then
    echo "  ✓ App.tsx has terminalOpen state"
else
    echo "  ✗ App.tsx missing terminalOpen state"
fi

# Check 4: Sidebar.tsx has onOpenTerminal prop
echo "✓ Checking Sidebar.tsx..."
if grep -q "onOpenTerminal" "src/components/layout/Sidebar.tsx"; then
    echo "  ✓ Sidebar.tsx has onOpenTerminal prop"
else
    echo "  ✗ Sidebar.tsx missing onOpenTerminal prop"
fi

# Check 5: Backend main.py has endpoints
echo "✓ Checking backend/main.py..."
if grep -q "/backend/start" "backend/main.py"; then
    echo "  ✓ Backend has /backend/start endpoint"
else
    echo "  ✗ Backend missing /backend/start endpoint"
fi

if grep -q "/ws/logs" "backend/main.py"; then
    echo "  ✓ Backend has /ws/logs WebSocket endpoint"
else
    echo "  ✗ Backend missing /ws/logs WebSocket endpoint"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "Next Steps:"
echo "1. Run: npm start"
echo "2. Click the تشغيل (Run) button"
echo "3. Terminal window should appear at the bottom of the screen"
echo "4. You should see backend logs in real-time"
echo ""
