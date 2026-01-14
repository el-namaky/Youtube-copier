/**
 * Backend Service - Manages backend process control and communication
 */

export interface BackendMessage {
    type: 'output' | 'error' | 'success' | 'info';
    message: string;
    timestamp: number;
}

class BackendService {
    private isRunning = false;
    private listeners: ((msg: BackendMessage) => void)[] = [];
    private eventSource: EventSource | null = null;
    private websocket: WebSocket | null = null;

    subscribe(callback: (msg: BackendMessage) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private broadcastMessage(msg: BackendMessage) {
        this.listeners.forEach(listener => listener(msg));
    }

    async startBackend(): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:8000/backend/start', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to start backend');
            }

            this.isRunning = true;
            this.broadcastMessage({
                type: 'success',
                message: 'Backend started successfully',
                timestamp: Date.now(),
            });

            // Try to connect to WebSocket for real-time logs
            this.connectWebSocket();

            return true;
        } catch (error) {
            this.broadcastMessage({
                type: 'error',
                message: `Failed to start backend: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now(),
            });
            return false;
        }
    }

    async stopBackend(): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:8000/backend/stop', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to stop backend');
            }

            this.isRunning = false;
            this.disconnectWebSocket();

            this.broadcastMessage({
                type: 'info',
                message: 'Backend stopped',
                timestamp: Date.now(),
            });

            return true;
        } catch (error) {
            this.broadcastMessage({
                type: 'error',
                message: `Failed to stop backend: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now(),
            });
            return false;
        }
    }

    private connectWebSocket() {
        if (this.websocket) {
            return; // Already connected
        }

        try {
            this.websocket = new WebSocket('ws://localhost:8000/ws/logs');

            this.websocket.onopen = () => {
                this.reconnectAttempts = 0;
                this.broadcastMessage({
                    type: 'info',
                    message: 'Connected to backend logs',
                    timestamp: Date.now(),
                });
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.broadcastMessage({
                        type: data.type || 'output',
                        message: data.message || event.data,
                        timestamp: data.timestamp || Date.now(),
                    });
                } catch {
                    this.broadcastMessage({
                        type: 'output',
                        message: event.data,
                        timestamp: Date.now(),
                    });
                }
            };

            this.websocket.onerror = (event) => {
                console.error('WebSocket error:', event);
                this.broadcastMessage({
                    type: 'error',
                    message: 'Backend connection error - trying to reconnect...',
                    timestamp: Date.now(),
                });
            };

            this.websocket.onclose = () => {
                this.websocket = null;
                this.broadcastMessage({
                    type: 'info',
                    message: 'Disconnected from backend',
                    timestamp: Date.now(),
                });

                // Try to reconnect
                if (this.isRunning && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connectWebSocket(), 2000);
                }
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            this.broadcastMessage({
                type: 'error',
                message: `WebSocket connection failed: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: Date.now(),
            });
        }
    }

    private disconnectWebSocket() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    getStatus() {
        return this.isRunning;
    }
}

export const backendService = new BackendService();
