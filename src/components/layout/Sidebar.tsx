import { LayoutDashboard, FolderPlus, Send, Code, Settings, PlusCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import BackendControl from '../BackendControl'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface SidebarProps {
    onOpenTerminal: () => void;
}

const Sidebar = ({ onOpenTerminal }: SidebarProps) => {
    const location = useLocation()

    const menuItems = [
        { icon: LayoutDashboard, label: 'الرئيسية (مشاريعي)', path: '/' },
        { icon: PlusCircle, label: 'مشروع جديد', path: '/new-project' },
        { icon: Send, label: 'النشر', path: '/publish' },
        { icon: Code, label: 'المطور', path: '/developer' },
        { icon: Settings, label: 'الإعدادات', path: '/settings' },
    ]

    return (
        <aside className="w-64 h-screen glass border-l border-border flex flex-col p-4 sticky top-0">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Code className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">YouTube Copier</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-muted-foreground hover:text-foreground hover:bg-white/5",
                            location.pathname === item.path && "bg-primary/10 text-primary border border-primary/20"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5 transition-colors", location.pathname === item.path && "text-primary")} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto space-y-4">
                <BackendControl onRunClick={onOpenTerminal} />

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-sm font-medium text-primary mb-1">الوضع التجريبي</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">أنت تستخدم النسخة الأولية من البرنامج.</p>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
