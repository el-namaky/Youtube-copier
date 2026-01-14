import { useState, useEffect } from 'react'
import { Play, Square, AlertCircle } from 'lucide-react'
import { backendService } from '../services/backend'

interface BackendControlProps {
    onRunClick: () => void;
}

const BackendControl = ({ onRunClick }: BackendControlProps) => {
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasShownTerminal, setHasShownTerminal] = useState(false);

    useEffect(() => {
        const unsubscribe = backendService.subscribe((msg) => {
            if (msg.type === 'success' && msg.message.includes('started')) {
                setIsRunning(true);
                setError(null);
                // Auto-open terminal when backend starts
                if (!hasShownTerminal) {
                    onRunClick();
                    setHasShownTerminal(true);
                }
            }
            if (msg.type === 'info' && msg.message.includes('stopped')) {
                setIsRunning(false);
                setHasShownTerminal(false);
            }
            if (msg.type === 'error') {
                setError(msg.message);
            }
        });

        setIsRunning(backendService.getStatus());
        return unsubscribe;
    }, [onRunClick, hasShownTerminal]);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            if (isRunning) {
                await backendService.stopBackend();
            } else {
                await backendService.startBackend();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 px-2">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg ${
                    isRunning
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                        : 'bg-primary hover:bg-primary/90 text-white border border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isRunning ? 'Stop Backend' : 'Start Backend'}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isRunning ? (
                    <>
                        <Square className="w-4 h-4 fill-current" />
                        <span className="text-sm">إيقاف</span>
                    </>
                ) : (
                    <>
                        <Play className="w-4 h-4 fill-current" />
                        <span className="text-sm">تشغيل</span>
                    </>
                )}
            </button>

            {error && (
                <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {isRunning && (
                <div className="flex items-center gap-2 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Backend running</span>
                </div>
            )}
        </div>
    );
};

export default BackendControl;
