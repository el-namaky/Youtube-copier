import React, { useEffect, useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { X, Save, Trash2, Clock, Settings2, FileJson, Scissors, Plus, FolderOpen, Film } from 'lucide-react';
import LayerEditor from './LayerEditor';
import { api } from '../../../services/api';

interface PropertyInspectorProps {
    selectedNode: Node | null;
    onClose: () => void;
}

const PropertyInspector: React.FC<PropertyInspectorProps> = ({ selectedNode, onClose }) => {
    const { setNodes } = useReactFlow();

    const [formData, setFormData] = useState<any>(selectedNode?.data || {});

    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode.data || {});
        }
    }, [selectedNode]);

    const handleChange = (key: string, value: any) => {
        const newData = { ...formData, [key]: value };
        setFormData(newData);
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return { ...node, data: newData };
                }
                return node;
            })
        );
    };

    const handleAddInsert = () => {
        const newInserts = [...(formData.inserts || []), { time: 0, file: '' }];
        handleChange('inserts', newInserts);
    };

    const handleRemoveInsert = (index: number) => {
        const newInserts = [...(formData.inserts || [])];
        newInserts.splice(index, 1);
        handleChange('inserts', newInserts);
    };
    // Helper for API Keys
    const ApiKeySelector = ({ provider, label }: { provider: string, label: string }) => {
        const config = JSON.parse(localStorage.getItem('app_config') || '{}');
        const keys = (config.apiKeys || []).filter((k: any) =>
            // Filter by provider, but allow 'elevenlabs' for TTS if provider is tts specific
            provider === 'any' ? true : k.provider === provider
        );

        return (
            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <div className="flex gap-2">
                    <select
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none"
                        value={formData.apiKeyId || ''}
                        onChange={(e) => {
                            handleChange('apiKeyId', e.target.value);
                            // Also save provider info if needed, or lookup at runtime
                            const k = keys.find((key: any) => key.id === e.target.value);
                            if (k) handleChange('selectedProvider', k.provider);
                        }}
                    >
                        <option value="">-- اختر مفتاح --</option>
                        {keys.map((k: any) => (
                            <option key={k.id} value={k.id}>{k.name} ({k.provider})</option>
                        ))}
                    </select>
                    {keys.length === 0 && (
                        <a href="/developer" className="p-2 bg-muted rounded-lg text-xs flex items-center justify-center text-primary" title="إدارة المفاتيح">
                            <Settings2 size={14} />
                        </a>
                    )}
                </div>
            </div>
        );
    };

    if (!selectedNode) return null;

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-card border-l border-border shadow-xl z-20 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-bold text-foreground flex flex-col">
                    <span>إعدادات العقدة</span>
                    <span className="text-xs text-muted-foreground font-normal">{selectedNode.type} | {selectedNode.id}</span>
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Common: Label */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">اسم العملية</label>
                    <input
                        type="text"
                        value={formData.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>

                {/* --- Download Node (Formerly Source) --- */}
                {selectedNode.type === 'download' && (
                    <div className="space-y-4 border-t border-border pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">نوع المصدر (Source Type)</label>
                            <select
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none"
                                value={formData.sourceType || 'shorts_channel'}
                                onChange={(e) => handleChange('sourceType', e.target.value)}
                            >
                                <option value="shorts_channel">قناة شورتس (Shorts Channel)</option>
                                <option value="single_video">فيديو واحد (Single Video)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                                {formData.sourceType === 'shorts_channel' ? 'رابط القناة/القائمة' : 'رابط الفيديو / مسار المجلد'}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.url || ''}
                                    onChange={(e) => handleChange('url', e.target.value)}
                                    placeholder="https://youtube.com/..."
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none dir-ltr"
                                />
                                <button
                                    onClick={async () => {
                                        const path = await api.selectFolder();
                                        if (path) handleChange('url', path);
                                    }}
                                    className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                    title="اختيار مجلد محلي"
                                >
                                    <FolderOpen size={16} />
                                </button>
                            </div>
                        </div>

                        {formData.sourceType === 'shorts_channel' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">ترتيب التحميل</label>
                                    <select
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none"
                                        value={formData.sortOrder || 'newest'}
                                        onChange={(e) => handleChange('sortOrder', e.target.value)}
                                    >
                                        <option value="newest">الأحدث (Newest)</option>
                                        <option value="oldest">الأقدم (Oldest)</option>
                                        <option value="popular">الأكثر شعبية</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.downloadNewest || false}
                                        onChange={(e) => handleChange('downloadNewest', e.target.checked)}
                                        className="rounded border-border bg-background"
                                    />
                                    <span className="text-sm">تحميل الجديد فقط (Incremental)</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- Edit Node --- */}
                {selectedNode.type === 'edit' && (
                    <div className="space-y-4 border-t border-border pt-4">
                        {/* Trim Controls */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground">قص من البداية (ث)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.trimStart || 0}
                                    onChange={(e) => handleChange('trimStart', Math.max(0, Number(e.target.value)))}
                                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground">قص من النهاية (ث)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.trimEnd || 0}
                                    onChange={(e) => handleChange('trimEnd', Math.max(0, Number(e.target.value)))}
                                    className="w-full bg-background border border-border rounded px-2 py-1 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Mute/Volume */}
                        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border">
                            <span className="text-sm">كتم الصوت الأصلي (Mute)</span>
                            <input
                                type="checkbox"
                                checked={formData.mute || false}
                                onChange={(e) => handleChange('mute', e.target.checked)}
                                className="w-5 h-5 accent-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">مستوى الصوت (%)</label>
                            <input
                                type="range"
                                min="0" max="200"
                                value={formData.volume || 100}
                                onChange={(e) => handleChange('volume', Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* Insertions (Advanced Cut) */}
                        <div className="space-y-2 pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-muted-foreground">فواصل إعلانية / إدراج (Inserts)</label>
                                <button
                                    onClick={handleAddInsert}
                                    className="text-primary hover:bg-primary/10 p-1 rounded"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {(formData.inserts || []).map((insert: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs bg-muted p-2 rounded border border-border dashed group">
                                        <Clock size={12} />
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-10 bg-transparent outline-none border-b border-transparent focus:border-primary text-center"
                                            value={insert.time}
                                            onChange={(e) => {
                                                const newInserts = [...(formData.inserts || [])];
                                                newInserts[idx].time = Math.max(0, Number(e.target.value));
                                                handleChange('inserts', newInserts);
                                            }}
                                        />
                                        <span className="text-muted-foreground">&rarr;</span>
                                        <Film size={12} />

                                        {/* File Chooser for Insert */}
                                        <label className="cursor-pointer truncate max-w-[80px] hover:text-primary">
                                            {insert.file ? insert.file.split(/[\\/]/).pop() : "اختر ملف"}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="video/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const newInserts = [...(formData.inserts || [])];
                                                        // Note: In browser environment we only get name, but implementation plan says we need path. 
                                                        // For real local app we need a way to get path or use selectFolder-like trick.
                                                        // For now we use name as placeholder or assume user types path if it's backend heavy.
                                                        // Let's allow text edit too.
                                                        newInserts[idx].file = file.name;
                                                        handleChange('inserts', newInserts);
                                                    }
                                                }}
                                            />
                                        </label>

                                        <button
                                            onClick={() => handleRemoveInsert(idx)}
                                            className="mr-auto opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Translate Node --- */}
                {selectedNode.type === 'translate' && (
                    <div className="space-y-4 border-t border-border pt-4">
                        <ApiKeySelector provider="any" label="نموذج الترجمة (AI Model)" />

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">اللغة المستهدفة</label>
                            <select
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none"
                                value={formData.targetLang || 'ar'}
                                onChange={(e) => handleChange('targetLang', e.target.value)}
                            >
                                <option value="ar">العربية (Arabic)</option>
                                <option value="en">English</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <span className="text-sm font-bold text-primary">تشكيل الحروف العربية</span>
                            <input
                                type="checkbox"
                                checked={formData.tashkeel || false}
                                onChange={(e) => handleChange('tashkeel', e.target.checked)}
                                className="w-5 h-5 accent-primary"
                            />
                        </div>
                    </div>
                )}

                {/* --- TTS Node --- */}
                {selectedNode.type === 'tts' && (
                    <div className="space-y-4 border-t border-border pt-4">
                        <ApiKeySelector provider="any" label="مزود الصوت (Provider)" />

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">الصوت (Voice)</label>
                            {formData.selectedProvider === 'elevenlabs' ? (
                                // ElevenLabs Voices
                                <select
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none"
                                    value={formData.voice || 'rachel'}
                                    onChange={(e) => handleChange('voice', e.target.value)}
                                >
                                    <option value="21m00Tcm4TlvDq8ikWAM">Rachel</option>
                                    <option value="AZnzlk1XvdvUeBnXmlld">Domi</option>
                                    <option value="EXAVITQu4vr4xnSDxMaL">Bella</option>
                                    <option value="ErXwobaYiN019PkySvjV">Antoni</option>
                                </select>
                            ) : (
                                // OpenAI Voices
                                <select
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none"
                                    value={formData.voice || 'alloy'}
                                    onChange={(e) => handleChange('voice', e.target.value)}
                                >
                                    <option value="alloy">Alloy (OpenAI)</option>
                                    <option value="echo">Echo (OpenAI)</option>
                                    <option value="fable">Fable (OpenAI)</option>
                                    <option value="onyx">Onyx (OpenAI)</option>
                                    <option value="nova">Nova (OpenAI)</option>
                                    <option value="shimmer">Shimmer (OpenAI)</option>
                                </select>
                            )}
                        </div>
                    </div>
                )}

                {/* --- Transcribe Node --- */}
                {selectedNode.type === 'transcribe' && (
                    <div className="space-y-4 border-t border-border pt-4">
                        <ApiKeySelector provider="any" label="نموذج الاستخراج (AI Model)" />
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">التوقيت</label>
                            <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="exact">دقيق جداً (Word level)</option>
                                <option value="segment">جمل (Sentences)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* --- Layer / Composer Node --- */}
                {(selectedNode.type === 'composer' || selectedNode.type === 'merge') && (
                    <div className="space-y-4 border-t border-border pt-4">

                        {/* If this is the Merge Node or explicit merge inputs */}
                        {(selectedNode.type === 'merge' || selectedNode.data.inputs) ? (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                                    <Clock size={12} />
                                    توقيت الدمج (Start Times)
                                </h4>
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-20">فيديو:</span>
                                        <input type="number" className="w-full bg-background border border-border rounded px-2 py-1 text-xs" placeholder="0s" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-20">عربي:</span>
                                        <input type="number" className="w-full bg-background border border-border rounded px-2 py-1 text-xs" placeholder="0.5s" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs w-20">أصلي:</span>
                                        <input type="number" className="w-full bg-background border border-border rounded px-2 py-1 text-xs" placeholder="0s" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Normal Composer (Layers)
                            <div className="space-y-2">
                                <LayerEditor
                                    layers={formData.layers || []}
                                    onChange={(layers) => handleChange('layers', layers)}
                                />
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border mt-auto flex gap-2">
                <button
                    onClick={() => {
                        setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                        onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <Trash2 size={16} />
                    <span>حذف</span>
                </button>
            </div>
        </div>
    );
};

export default PropertyInspector;
