import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Play, CheckCircle2, Clock, Settings, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Terminal from '../components/Terminal'

const Dashboard = () => {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({
        active_projects: 0,
        completed_projects: 0,
        processing_projects: 0,
        total_projects: 0
    });
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch from API
                const [s, p] = await Promise.all([
                    api.getStats(),
                    api.getProjects() // Get all projects
                ]);

                // Fetch from LocalStorage (Mock for new projects)
                const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');

                setStatsData(s);

                // Merge Logic: Prioritize API, but avoid duplicates based on ID
                // Note: project.id in JS is often number or string. Ensure comparison is safe.
                const apiIds = new Set(p.map((x: any) => String(x.id)));
                const uniqueLocal = localProjects.filter((x: any) => !apiIds.has(String(x.id)));

                setProjects([...uniqueLocal, ...p]);
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
                // Fallback to local only if API fails
                const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
                setProjects(localProjects);
            }
        };
        fetchData();
        // Poll every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation(); // Prevent triggering card click if any
        if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
            try {
                // Call backend API
                await api.deleteProject(projectId);

                // Remove from state immediately for UI responsiveness
                const updatedProjects = projects.filter(p => String(p.id) !== projectId);
                setProjects(updatedProjects);

                // Also clean up local storage just in case there are vestiges
                const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
                const updatedLocal = localProjects.filter((p: any) => String(p.id) !== projectId);
                localStorage.setItem('projects', JSON.stringify(updatedLocal));

            } catch (err) {
                alert('فشل في حذف المشروع من الخادم');
                console.error(err);
            }
        }
    };

    const stats = [
        { label: 'المشاريع النشطة', value: statsData.active_projects.toString(), icon: Play, color: 'text-blue-400' },
        { label: 'تم معالجتها', value: statsData.completed_projects.toString(), icon: CheckCircle2, color: 'text-green-400' },
        { label: 'قيد الانتظار', value: statsData.processing_projects.toString(), icon: Clock, color: 'text-yellow-400' },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Terminal Widget */}
            <Terminal />

            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">مرحباً بك مجدداً</h1>
                    <p className="text-muted-foreground">إليك نظرة سريعة على أداء مشاريعك اليوم.</p>
                </div>
                <a href="/new" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    مشروع جديد
                </a>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 rounded-3xl"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold">{stat.value}</h3>
                            </div>
                            <div className={cn("p-3 rounded-2xl bg-white/5", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Projects Section */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold">المشاريع الحالية</h2>

                {projects.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p>لا توجد مشاريع حالياً. ابدأ مشروع جديد!</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {projects.map((project) => (
                        <motion.div
                            key={String(project.id)} // Ensure strict string key
                            whileHover={{ scale: 1.005 }}
                            className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {(project.id.toString()).slice(-4)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{project.name}</h4>
                                    <p className="text-sm text-muted-foreground uppercase">{project.status}</p>
                                </div>
                            </div>

                            <div className="flex-1 max-w-xs mx-10">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-muted-foreground">التقدم</span>
                                    <span className="font-medium">{project.progress || 0}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000"
                                        style={{ width: `${project.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-left hidden md:block">
                                    <p className="text-xs text-muted-foreground">آخر نشاط</p>
                                    <p className="font-medium text-xs text-muted-foreground max-w-[150px] truncate">
                                        {project.log && project.log.length > 0 ? project.log[project.log.length - 1].split('-')[1]?.trim() : 'انتظار...'}
                                    </p>
                                </div>

                                {/* Project Controls */}
                                <div className="flex items-center gap-1">
                                    {project.status === 'processing' ? (
                                        <button
                                            onClick={() => alert(`Stopping project ${project.id}... (Not fully implemented on backend)`)}
                                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                            title="إيقاف مؤقت"
                                        >
                                            <div className="w-4 h-4 rounded-sm bg-current" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => alert(`Resuming project ${project.id}...`)}
                                            className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                                            title="تشغيل"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/project/${project.id}`)}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                        title="الإعدادات"
                                    >
                                        <Settings className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteProject(e, String(project.id))}
                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                                        title="حذف المشروع"
                                    >
                                        <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}

export default Dashboard

