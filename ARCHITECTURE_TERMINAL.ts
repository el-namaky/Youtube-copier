/**
 * ARCHITECTURE DIAGRAM - Terminal Display System
 * 
 * BEFORE (❌ Problem):
 * =====================
 * App.tsx
 * ├── Sidebar (w-64, position: relative)
 * │   ├── MenuItems
 * │   ├── BackendControl
 * │   │   ├── RunButton
 * │   │   └── StatusIndicator
 * │   └── ❌ Terminal Component (CONSTRAINED HERE!)
 * │       └── limited by Sidebar width and positioning
 * └── Main Content
 * 
 * Problem: Terminal is nested inside Sidebar, limited by:
 * - Width: 256px (w-64)
 * - Positioning context: relative (inherits from Sidebar)
 * - Can't use full-screen fixed positioning
 * 
 * =====================
 * AFTER (✅ Fixed):
 * =====================
 * App.tsx (Positioning Context)
 * ├── Sidebar (w-64)
 * │   ├── MenuItems
 * │   ├── BackendControl
 * │   │   ├── RunButton (onRunClick)
 * │   │   └── StatusIndicator
 * │   └── (Terminal removed from here)
 * │
 * ├── Main Content Area
 * │
 * └── ✅ Terminal Component (ROOT LEVEL!)
 *     └── Can use full viewport width with fixed positioning
 * 
 * Benefits:
 * - Full viewport width (100%)
 * - Fixed positioning works correctly
 * - Appears above all other content
 * - Can be styled independently
 */

/**
 * STATE FLOW DIAGRAM
 * 
 * 1. USER CLICKS RUN BUTTON
 *    │
 *    ├─ BackendControl.tsx
 *    │  └─ onClick: handleToggle()
 *    │
 *    ├─ Call onRunClick prop (from Sidebar)
 *    │  └─ onRunClick is BackendControl onRunClick prop
 *    │
 *    ├─ Call onOpenTerminal (from App.tsx)
 *    │  └─ Calls setTerminalOpen(true) in App.tsx
 *    │
 *    └─ BackendService.startBackend()
 *       ├─ HTTP POST to /backend/start
 *       ├─ Broadcast success message
 *       └─ Connect to WebSocket /ws/logs
 * 
 * 2. TERMINAL OPENS
 *    │
 *    ├─ App.tsx terminalOpen = true
 *    │  └─ Terminal component receives isOpen={true}
 *    │
 *    └─ Terminal renders with animation
 *       └─ Position: fixed bottom-0 left-0 right-0
 * 
 * 3. WEBSOCKET MESSAGES FLOW
 *    │
 *    ├─ Backend sends log messages
 *    │
 *    ├─ WebSocket /ws/logs receives them
 *    │
 *    ├─ BackendService.broadcastMessage() calls subscribers
 *    │
 *    ├─ Terminal.useEffect listener receives messages
 *    │
 *    └─ Terminal.setLogs() updates display
 */

/**
 * COMPONENT COMMUNICATION
 * 
 * App.tsx
 * ├─ State: terminalOpen (boolean)
 * │
 * ├─ Pass to Sidebar: 
 * │  └─ onOpenTerminal={() => setTerminalOpen(true)}
 * │
 * ├─ Pass to Terminal:
 * │  ├─ isOpen={terminalOpen}
 * │  └─ onClose={() => setTerminalOpen(false)}
 * │
 * Sidebar.tsx
 * ├─ Props: onOpenTerminal (function)
 * │
 * ├─ Pass to BackendControl:
 * │  └─ onRunClick={onOpenTerminal}
 * │
 * BackendControl.tsx
 * ├─ Props: onRunClick (function)
 * │
 * ├─ On backend start success:
 * │  └─ Call onRunClick()
 * │
 * BackendService.ts
 * ├─ startBackend()
 * │  ├─ POST /backend/start
 * │  ├─ Broadcast success message
 * │  └─ connectWebSocket()
 * │
 * ├─ connectWebSocket()
 * │  ├─ Open ws://localhost:8000/ws/logs
 * │  ├─ On message: broadcastMessage()
 * │  └─ On close: retry with backoff
 * │
 * Terminal.tsx
 * ├─ Props: isOpen, onClose
 * │
 * ├─ useEffect: subscribe to backendService
 * │  └─ Receive BackendMessage objects
 * │
 * └─ Display logs with timestamps and types
 */

/**
 * MESSAGE TYPES & COLORS
 * 
 * 'error'    → Red (#ef4444)     - Error messages
 * 'success'  → Green (#22c55e)   - Success messages
 * 'info'     → Blue (#3b82f6)    - Info messages
 * 'output'   → Gray (#d1d5db)    - Regular output
 * 
 * Message Format:
 * {
 *   type: 'success' | 'error' | 'info' | 'output',
 *   message: 'Log message text',
 *   timestamp: 1234567890000 (milliseconds)
 * }
 */

/**
 * STYLING & POSITIONING
 * 
 * Terminal Fixed Position:
 * ┌─────────────────────────────────────────┐
 * │  Sidebar        Main Content             │
 * │                                          │
 * │                                          │
 * │                                          │
 * ├──────────────────────────────────────────┤ ← bottom: 0, height: 288px
 * │ Terminal (fixed)                         │ ← left: 0, right: 0
 * │ ✓ Copy | ✓ Download | ✓ Clear | ✓ Close │
 * │ [logs display area with auto-scroll]    │
 * │ 1234 logs • Auto-scroll: On              │
 * └──────────────────────────────────────────┘
 * 
 * CSS Classes:
 * - fixed: position fixed relative to viewport
 * - bottom-0: bottom: 0 (stick to bottom)
 * - left-0: left: 0
 * - right-0: right: 0 (stretch full width)
 * - h-72: height: 18rem (288px)
 * - z-50: high z-index (above other content)
 * - bg-black/95: dark background with transparency
 */
