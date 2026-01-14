#!/usr/bin/env node

/**
 * Terminal Display Fix - Quick Verification Script
 * Run this script to verify all components are properly configured
 * 
 * Usage:
 * - Node.js: node verify-terminal.js
 * - npm: npm run verify
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, patterns) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const checks = patterns.map(pattern => {
            const regex = new RegExp(pattern, 'i');
            return {
                pattern,
                found: regex.test(content),
            };
        });
        return checks;
    } catch (error) {
        return null;
    }
}

console.clear();
log('╔════════════════════════════════════════════════════════════╗', 'cyan');
log('║    YouTube Copier - Terminal Fix Verification Script      ║', 'cyan');
log('╚════════════════════════════════════════════════════════════╝', 'cyan');
log('');

let passCount = 0;
let failCount = 0;

// Check 1: App.tsx
log('📋 Checking src/App.tsx...', 'blue');
let checks = checkFile('src/App.tsx', [
    'terminalOpen',
    'setTerminalOpen',
    'onOpenTerminal',
]);

if (checks === null) {
    log('   ❌ File not found', 'red');
    failCount++;
} else {
    checks.forEach(check => {
        if (check.found) {
            log(`   ✅ Found: ${check.pattern}`, 'green');
            passCount++;
        } else {
            log(`   ❌ Missing: ${check.pattern}`, 'red');
            failCount++;
        }
    });
}
log('');

// Check 2: Sidebar.tsx
log('📋 Checking src/components/layout/Sidebar.tsx...', 'blue');
checks = checkFile('src/components/layout/Sidebar.tsx', [
    'onOpenTerminal',
    'SidebarProps',
]);

if (checks === null) {
    log('   ❌ File not found', 'red');
    failCount++;
} else {
    checks.forEach(check => {
        if (check.found) {
            log(`   ✅ Found: ${check.pattern}`, 'green');
            passCount++;
        } else {
            log(`   ❌ Missing: ${check.pattern}`, 'red');
            failCount++;
        }
    });
}
log('');

// Check 3: Terminal.tsx
log('📋 Checking src/components/Terminal.tsx...', 'blue');
checks = checkFile('src/components/Terminal.tsx', [
    'isOpen',
    'BackendMessage',
    'backendService',
]);

if (checks === null) {
    log('   ❌ File not found', 'red');
    failCount++;
} else {
    checks.forEach(check => {
        if (check.found) {
            log(`   ✅ Found: ${check.pattern}`, 'green');
            passCount++;
        } else {
            log(`   ❌ Missing: ${check.pattern}`, 'red');
            failCount++;
        }
    });
}
log('');

// Check 4: BackendControl.tsx
log('📋 Checking src/components/BackendControl.tsx...', 'blue');
checks = checkFile('src/components/BackendControl.tsx', [
    'onRunClick',
    'backendService',
]);

if (checks === null) {
    log('   ❌ File not found', 'red');
    failCount++;
} else {
    checks.forEach(check => {
        if (check.found) {
            log(`   ✅ Found: ${check.pattern}`, 'green');
            passCount++;
        } else {
            log(`   ❌ Missing: ${check.pattern}`, 'red');
            failCount++;
        }
    });
}
log('');

// Check 5: Backend main.py
log('📋 Checking backend/main.py...', 'blue');
checks = checkFile('backend/main.py', [
    '/backend/start',
    '/backend/stop',
    '/ws/logs',
    'BackendState',
]);

if (checks === null) {
    log('   ❌ File not found', 'red');
    failCount++;
} else {
    checks.forEach(check => {
        if (check.found) {
            log(`   ✅ Found: ${check.pattern}`, 'green');
            passCount++;
        } else {
            log(`   ❌ Missing: ${check.pattern}`, 'red');
            failCount++;
        }
    });
}
log('');

// Check 6: backend.ts
log('📋 Checking src/services/backend.ts...', 'blue');
checks = checkFile('src/services/backend.ts', [
    'BackendMessage',
    'connectWebSocket',
    'backendService',
]);

if (checks === null) {
    log('   ❌ File not found', 'red');
    failCount++;
} else {
    checks.forEach(check => {
        if (check.found) {
            log(`   ✅ Found: ${check.pattern}`, 'green');
            passCount++;
        } else {
            log(`   ❌ Missing: ${check.pattern}`, 'red');
            failCount++;
        }
    });
}
log('');

// Summary
log('╔════════════════════════════════════════════════════════════╗', 'cyan');
log(`║                      SUMMARY                               ║`, 'cyan');
log('╠════════════════════════════════════════════════════════════╣', 'cyan');
log(`║ ✅ Passed: ${passCount}                                            ║`, passCount > 0 ? 'green' : 'red');
log(`║ ❌ Failed: ${failCount}                                            ║`, failCount === 0 ? 'green' : 'red');
log('╠════════════════════════════════════════════════════════════╣', 'cyan');

if (failCount === 0) {
    log('║  All checks passed! Ready to use.                          ║', 'green');
    log('║                                                            ║', 'cyan');
    log('║  Next steps:                                               ║', 'cyan');
    log('║  1. Run: npm start                                         ║', 'cyan');
    log('║  2. Click the تشغيل (Run) button                            ║', 'cyan');
    log('║  3. Terminal should appear at the bottom                   ║', 'cyan');
} else {
    log('║  Some checks failed. Review the errors above.              ║', 'red');
}

log('╚════════════════════════════════════════════════════════════╝', 'cyan');
log('');

process.exit(failCount > 0 ? 1 : 0);
