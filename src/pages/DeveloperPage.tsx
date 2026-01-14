import { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Bug, Cpu, ShieldCheck, Zap, ToggleRight, Key, Save } from 'lucide-react'

const DeveloperPage = () => {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('app_config')
        return saved ? JSON.parse(saved) : {
            translationProvider: 'openai',
            ttsProvider: 'google',
            visionProvider: 'gemini',
            keys: {
                openai: '',
                gemini: '',
                google: ''
            }
        }
    })

    const saveConfig = () => {
        localStorage.setItem('app_config', JSON.stringify(config))
        alert('تم حفظ الإعدادات بنجاح!')
    }

    const handleKeyChange = (provider: string, value: string) => {
        setConfig((prev: any) => ({
            ...prev,
            keys: { ...prev.keys, [provider]: value }
        }))
    }

    const logs = [
        { type: 'info', time: '12:04:22', msg: 'System initialized successfully' },
        { type: 'success', time: '12:04:23', msg: 'Connected to Gemini API v1.5' },
        { type: 'error', time: '12:05:01', msg: 'Failed to fetch video stream from URL: invalid proxy' },
        { type: 'info', time: '12:05:10', msg: 'Retrying connection via proxy cluster B' },
        { type: 'success', time: '12:05:14', msg: 'Download started: VID_99212.mp4' },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-10" dir="rtl">
            <header>
                <h1 className="text-3xl font-bold mb-2">أدوات المطور & الإعدادات</h1>
                <p className="text-muted-foreground">تحكم في الميزات التقنية، إعدادات الـ API، وسجلات النظام.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Logs Monitor */}
                <div className="lg:col-span-7 glass-card rounded-3xl overflow-hidden border border-white/5 bg-black/40 h-fit">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2 font-mono text-sm">
                            <Terminal className="w-4 h-4 text-primary" />
                            <span>نظام السجلات (Live Logs)</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500/50" />
                            <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <span className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                    </div>
                    <div className="p-6 font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-4 group">
                                <span className="text-muted-foreground opacity-50 shrink-0">{log.time}</span>
                                <span className={cn(
                                    "font-bold uppercase w-16 shrink-0",
                                    log.type === 'error' ? "text-red-400" :
                                        log.type === 'success' ? "text-green-400" :
                                            log.type === 'warning' ? "text-yellow-400" : "text-blue-400"
                                )}>
                                    [{log.type}]
                                </span>
                                <span className="text-foreground group-hover:text-primary transition-colors">{log.msg}</span>
                            </div>
                        ))}
                        <div className="animate-pulse text-primary pt-2">_</div>
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="lg:col-span-5 space-y-6">

                    {/* API Configuration */}
                    <section className="glass-card p-6 rounded-3xl border border-white/5 bg-primary/5">
                        <div className="flex items-center gap-2 mb-6 text-primary">
                            <Key className="w-5 h-5" />
                            <h3 className="font-bold">إدارة مفاتيح API</h3>
                        </div>

                        <div className="space-y-6">
                            {/* New Key Form */}
                            <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase">إضافة مفتاح جديد</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted-foreground">اسم المفتاح (Label)</label>
                                        <input
                                            type="text"
                                            id="keyName"
                                            placeholder="My Gemini Key"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-muted-foreground">المزود (Provider)</label>
                                        <select id="keyProvider" className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary appearance-none">
                                            <option value="gemini">Google Gemini</option>
                                            <option value="openai">OpenAI (GPT-4)</option>
                                            <option value="elevenlabs">ElevenLabs (TTS)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-muted-foreground">المفتاح السري (Secret Key)</label>
                                    <input
                                        type="password"
                                        id="keySecret"
                                        placeholder="sk-..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-primary"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const nameEl = document.getElementById('keyName') as HTMLInputElement;
                                        const providerEl = document.getElementById('keyProvider') as HTMLSelectElement;
                                        const secretEl = document.getElementById('keySecret') as HTMLInputElement;

                                        if (!nameEl.value || !secretEl.value) return alert('يرجى ملء جميع الحقول');

                                        const newKey = {
                                            id: Date.now().toString(),
                                            name: nameEl.value,
                                            provider: providerEl.value,
                                            key: secretEl.value,
                                            created_at: new Date().toISOString()
                                        };

                                        // Update state (assuming 'config.apiKeys' exists or we add it)
                                        const currentKeys = config.apiKeys || [];
                                        setConfig({ ...config, apiKeys: [...currentKeys, newKey] });

                                        // Reset inputs
                                        nameEl.value = '';
                                        secretEl.value = '';
                                    }}
                                    className="w-full py-2 bg-primary/20 hover:bg-primary hover:text-white text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
                                >
                                    + إضافة المفتاح
                                </button>
                            </div>

                            {/* Keys List */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                                    <span>المفاتيح المحفوظة</span>
                                    <span>{config.apiKeys?.length || 0}</span>
                                </h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                                    {config.apiKeys && config.apiKeys.length > 0 ? (
                                        config.apiKeys.map((k: any) => (
                                            <div key={k.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${k.provider === 'openai' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground">{k.name}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{k.provider}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            const newKeys = config.apiKeys.filter((x: any) => x.id !== k.id);
                                                            setConfig({ ...config, apiKeys: newKeys });
                                                        }}
                                                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"
                                                    >
                                                        <span className="text-xs">حذف</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                            لا توجد مفاتيح محفوظة
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={saveConfig} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                <Save className="w-4 h-4" />
                                حفظ الإعدادات
                            </button>
                        </div>
                    </section>

                    {/* Feature Toggles */}
                    <section className="glass-card p-6 rounded-3xl border border-white/5">
                        <h3 className="font-bold flex items-center gap-2 mb-4 text-sm">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            مفاتيح النظام
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'تشغيل الوضع السريع', icon: Zap, active: true },
                                { label: 'تحليل المشاعر (AI)', icon: Cpu, active: true },
                                { label: 'جدار حماية النشر', icon: ShieldCheck, active: false },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </div>
                                    <ToggleRight className={cn("w-5 h-5", item.active ? "text-primary" : "text-muted-foreground opacity-30")} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}

export default DeveloperPage
