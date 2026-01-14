import React, { useState, useRef, useEffect } from 'react';
import { Type, Image as ImageIcon, Droplet, Monitor, Trash2 } from 'lucide-react';

interface Layer {
    id: string;
    type: 'text' | 'image' | 'blur';
    x: number;
    y: number;
    width: number;
    height: number;
    content?: string;
    opacity: number;
}

interface LayerEditorProps {
    layers: Layer[];
    onChange: (layers: Layer[]) => void;
}

const LayerEditor: React.FC<LayerEditorProps> = ({ layers = [], onChange }) => {
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');

    const addLayer = (type: Layer['type']) => {
        const newLayer: Layer = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: 10,
            y: 10,
            width: type === 'text' ? 100 : 80,
            height: type === 'text' ? 40 : 80,
            content: type === 'text' ? 'نص جديد' : '',
            opacity: 1,
        };
        onChange([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    const updateLayer = (id: string, updates: Partial<Layer>) => {
        onChange(layers.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    const removeLayer = (id: string) => {
        onChange(layers.filter(l => l.id !== id));
        if (selectedLayerId === id) setSelectedLayerId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">أبعاد الفيديو</label>
                <div className="flex bg-muted rounded-md p-1">
                    <button
                        onClick={() => setAspectRatio('16:9')}
                        className={`px-2 py-1 text-xs rounded-sm transition-colors ${aspectRatio === '16:9' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        16:9
                    </button>
                    <button
                        onClick={() => setAspectRatio('9:16')}
                        className={`px-2 py-1 text-xs rounded-sm transition-colors ${aspectRatio === '9:16' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        9:16
                    </button>
                </div>
            </div>

            {/* Visual Canvas */}
            <div className="flex justify-center bg-zinc-900 rounded-lg p-4 border border-zinc-800 checkerboard-bg">
                <div
                    ref={containerRef}
                    className="relative bg-black transition-all duration-300 overflow-hidden shadow-2xl"
                    style={{
                        width: aspectRatio === '16:9' ? '240px' : '135px',
                        height: '240px',
                    }}
                >
                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            style={{
                                position: 'absolute',
                                left: `${layer.x}%`,
                                top: `${layer.y}%`,
                                width: `${layer.width}px`,
                                height: `${layer.height}px`,
                                opacity: layer.opacity,
                            }}
                            className={`
                                cursor-move group select-none flex items-center justify-center text-xs
                                ${selectedLayerId === layer.id ? 'ring-2 ring-primary z-10' : 'hover:ring-1 hover:ring-white/50'}
                                ${layer.type === 'blur' ? 'backdrop-blur-sm bg-white/10' : ''}
                                ${layer.type === 'image' ? 'bg-zinc-800' : ''}
                            `}
                            onClick={() => setSelectedLayerId(layer.id)}
                        >
                            {layer.type === 'text' && (
                                <span className="text-white whitespace-nowrap px-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                    {layer.content}
                                </span>
                            )}
                            {layer.type === 'image' && <ImageIcon size={16} className="text-muted-foreground" />}
                            {layer.type === 'blur' && <Droplet size={16} className="text-white/50" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Layer Controls */}
            <div className="flex gap-2 justify-center">
                <button onClick={() => addLayer('text')} className="p-2 bg-muted hover:bg-muted/80 rounded-md text-xs flex flex-col items-center gap-1 min-w-[50px]">
                    <Type size={16} />
                    <span>نص</span>
                </button>
                <button onClick={() => addLayer('image')} className="p-2 bg-muted hover:bg-muted/80 rounded-md text-xs flex flex-col items-center gap-1 min-w-[50px]">
                    <ImageIcon size={16} />
                    <span>صورة</span>
                </button>
                <button onClick={() => addLayer('blur')} className="p-2 bg-muted hover:bg-muted/80 rounded-md text-xs flex flex-col items-center gap-1 min-w-[50px]">
                    <Droplet size={16} />
                    <span>ضبابية</span>
                </button>
            </div>

            {/* Selected Layer Properties */}
            {selectedLayerId && (
                <div className="bg-muted/30 rounded-lg p-3 space-y-3 border border-border">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">خصائص الطبقة</span>
                        <button onClick={() => removeLayer(selectedLayerId)} className="text-red-500 hover:bg-red-500/10 p-1 rounded">
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {layers.find(l => l.id === selectedLayerId)?.type === 'text' && (
                        <div>
                            <label className="text-[10px] text-muted-foreground">النص</label>
                            <input
                                type="text"
                                value={layers.find(l => l.id === selectedLayerId)?.content}
                                onChange={(e) => updateLayer(selectedLayerId, { content: e.target.value })}
                                className="w-full text-xs bg-background border border-border rounded px-2 py-1"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-muted-foreground">X: {Math.round(layers.find(l => l.id === selectedLayerId)?.x || 0)}%</label>
                            <input
                                type="range" min="0" max="100"
                                value={layers.find(l => l.id === selectedLayerId)?.x || 0}
                                onChange={(e) => updateLayer(selectedLayerId, { x: Number(e.target.value) })}
                                className="w-full h-1 bg-background rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground">Y: {Math.round(layers.find(l => l.id === selectedLayerId)?.y || 0)}%</label>
                            <input
                                type="range" min="0" max="100"
                                value={layers.find(l => l.id === selectedLayerId)?.y || 0}
                                onChange={(e) => updateLayer(selectedLayerId, { y: Number(e.target.value) })}
                                className="w-full h-1 bg-background rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-muted-foreground">الشفافية: {Math.round((layers.find(l => l.id === selectedLayerId)?.opacity || 1) * 100)}%</label>
                        <input
                            type="range" min="0" max="1" step="0.1"
                            value={layers.find(l => l.id === selectedLayerId)?.opacity || 1}
                            onChange={(e) => updateLayer(selectedLayerId, { opacity: Number(e.target.value) })}
                            className="w-full h-1 bg-background rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LayerEditor;
