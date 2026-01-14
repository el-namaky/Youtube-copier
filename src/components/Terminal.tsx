import React, { useEffect, useState, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Terminal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket
        const connect = () => {
            const socket = new WebSocket('ws://localhost:8000/ws/logs');

            socket.onopen = () => {
                setLogs(prev => [...prev, { type: 'system', message: 'Connected to Backend Terminal', timestamp: new Date().toISOString() }]);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setLogs(prev => [...prev, data]);
            };

            socket.onclose = () => {
                setLogs(prev => [...prev, { type: 'error', message: 'Connection lost. Reconnecting...', timestamp: new Date().toISOString() }]);
                setTimeout(connect, 3000);
            };

            ws.current = socket;
        };

        connect();

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isOpen]);

    // Color coding for logs
    const getLogColor = (type: string) => {
        switch (type) {
            case 'error': return 'text-red-400';
            case 'success': return 'text-green-400';
            case 'warning': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            case 'system': return 'text-purple-400';
            default: return 'text-zinc-300';
        }
    };

    return (
        <>
            {/* Toggle Button (Floating) */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-xl transition-colors ${isOpen ? 'bg-zinc-800 text-white' : 'bg-black text-white hover:bg-zinc-900'}`}
            >
                <TerminalIcon size={20} />
            </motion.button>

            {/* Terminal Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className={`fixed z-40 bg-black/95 border border-zinc-800 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col font-mono text-sm
                            ${isMaximized ? 'inset-4 rounded-xl' : 'bottom-16 left-4 w-[500px] h-[300px] rounded-lg'}
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
                            <div className="flex items-center gap-2">
                                <TerminalIcon size={14} className="text-muted-foreground" />
                                <span className="text-zinc-400 text-xs">Backend Log Stream</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setLogs([])} className="text-xs text-muted-foreground hover:text-white px-2">Clear</button>
                                <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-zinc-800 rounded text-muted-foreground">
                                    {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-800 rounded text-muted-foreground">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Logs Content */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-zinc-600 text-[10px] min-w-[60px] select-none">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className={`${getLogColor(log.type)} break-all`}>
                                        {typeof log.message === 'object' ? JSON.stringify(log.message) : log.message}
                                    </span>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Terminal;
