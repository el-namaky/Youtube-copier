import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Youtube, Instagram, Share2, ExternalLink, Filter } from 'lucide-react'
import { api } from '../services/api'

const PublishPage = () => {
    const [videos, setVideos] = useState<any[]>([]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const completed = await api.getProjects('completed');
                setVideos(completed.map(p => ({
                    id: p.id,
                    title: p.name || 'Untitled Video',
                    timestamp: new Date(p.created_at * 1000).toLocaleString('ar-EG'),
                    thumbnail: '🎬',
                    status: 'جاهز للنشر'
                })));
            } catch (e) {
                console.error(e);
            }
        };
        fetchVideos();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">مكتبة الفيديوهات الجاهزة</h1>
                    <p className="text-muted-foreground">هنا ستجد جميع الفيديوهات التي تمت معالجتها وجاهزيتها للنشر.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/5">
                        <Filter className="w-4 h-4" />
                        تصفية
                    </button>
                    <button className="flex items-center gap-2 bg-primary px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/20">
                        أتمتة النشر
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, i) => (
                    <motion.div
                        key={video.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card group rounded-3xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all"
                    >
                        <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                            {video.thumbnail}
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md",
                                        video.status === 'تم النشر' ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                                    )}>
                                        {video.status}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{video.timestamp}</span>
                                </div>
                                <h3 className="font-bold text-lg leading-snug">{video.title}</h3>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                                    <Youtube className="w-4 h-4" />
                                    YouTube
                                </button>
                                <button className="flex-1 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                                    <Instagram className="w-4 h-4" />
                                    Reels
                                </button>
                                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}

export default PublishPage
