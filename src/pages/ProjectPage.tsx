import { motion } from 'framer-motion'
import { Link2, Sparkles, Scissors, Mic2, Download, ArrowRight, Play, Plus } from 'lucide-react'

const ProjectPage = () => {
    const steps = [
        { id: 'download', label: 'تحميل الفيديو', icon: Download, desc: 'تحميل الفيديو بأعلى جودة ممكنة' },
        { id: 'subtitle', label: 'استخراج الترجمة', icon: Sparkles, desc: 'استخدام نماذج الذكاء الاصطناعي لتحويل الصوت لنص' },
        { id: 'mute', label: 'كتم الصوت', icon: Scissors, desc: 'إزالة الصوت الأصلي من الفيديو' },
        { id: 'ai_voice', label: 'تعليق صوتي AI', icon: Mic2, desc: 'إنشاء تعليق صوتي جديد بناءً على الترجمة' },
    ]

    const handleRun = async () => {
        const urlInput = document.getElementById('urlInput') as HTMLInputElement
        const videoUrl = urlInput?.value

        if (!videoUrl) {
            alert('يرجى إدخال رابط الفيديو')
            return
        }

        const config = JSON.parse(localStorage.getItem('app_config') || '{}')

        try {
            const response = await fetch('http://localhost:8000/workflow/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_url: videoUrl,
                    steps: steps,
                    config: config,
                    project_id: `proj_${Date.now()}`
                })
            })

            const data = await response.json()
            if (data.status === 'started') {
                alert('تم بدء العملية في الخلفية! يمكنك متابعة السجلات في صفحة المطور.')
            } else {
                alert('حدث خطأ: ' + JSON.stringify(data))
            }
        } catch (e) {
            alert('فشل الاتصال بالخادم. تأكد من تشغيل الباك إند.')
            console.error(e)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <header>
                <h1 className="text-3xl font-bold mb-2">إعداد مشروع جديد</h1>
                <p className="text-muted-foreground">قم بوضع رابط القناة أو الفيديو وحدد تسلسل العمليات.</p>
            </header>

            {/* URL Input */}
            <div className="glass-card p-8 rounded-3xl border-primary/20 bg-primary/5">
                <label className="block text-lg font-medium mb-4">رابط اليوتيوب (قناة، شورتس، أو قائمة تشغيل)</label>
                <div className="relative group">
                    <input
                        id="urlInput"
                        type="text"
                        placeholder="https://youtube.com/..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 pr-14 text-lg outline-none focus:border-primary transition-all shadow-inner"
                    />
                    <Link2 className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Workflow Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">تسلسل العمليات (Workflow)</h2>
                        <button className="text-primary text-sm font-medium hover:underline">إعادة ضبط</button>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-4 rounded-2xl flex items-center gap-4 relative"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold">{step.label}</h4>
                                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                    <span className="text-xs font-medium text-yellow-500/80">قابل للتعديل</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button className="w-full py-4 rounded-2xl border-2 border-dashed border-white/5 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 group">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        إضافة خطوة جديدة
                    </button>
                </div>

                {/* Preview / Summary */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">ملخص الإجراءات</h2>
                    <div className="glass-card p-6 rounded-3xl sticky top-8">
                        <div className="aspect-video bg-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/5 mb-6">
                            <Play className="w-10 h-10 text-muted-foreground opacity-20" />
                            <p className="text-xs text-muted-foreground">معاينة الفيديو غير متاحة حالياً</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">إجمالي الخطوات</span>
                                <span className="font-bold">4 خطوات</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">الوقت المقدر (لكل فيديو)</span>
                                <span className="font-bold text-primary">~ 3 دقائق</span>
                            </div>
                        </div>

                        <button onClick={handleRun} className="w-full bg-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            بدء تنفيذ التشغيل
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectPage
