import React from 'react';
import {
    Download,
    Languages,
    Mic,
    Scissors,
    Layers,
    MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const nodeTypes = [
    { type: 'download', label: 'تحميل الفيديو', icon: <Download size={18} />, color: 'bg-blue-500' },
    { type: 'transcribe', label: 'استخراج النص', icon: <Languages size={18} />, color: 'bg-emerald-500' },
    { type: 'translate', label: 'ترجمة AI', icon: <Languages size={18} />, color: 'bg-purple-500' },
    { type: 'tts', label: 'توليد صوت', icon: <Mic size={18} />, color: 'bg-orange-500' },
    { type: 'edit', label: 'تعديل / قص', icon: <Scissors size={18} />, color: 'bg-red-500' },
    { type: 'composer', label: 'تركيب طبقات', icon: <Layers size={18} />, color: 'bg-pink-500' },
    { type: 'merge', label: 'دمج (Merge)', icon: <Layers size={18} />, color: 'bg-indigo-500' }, // Visual distinction
    { type: 'render', label: 'تصدير نهائي', icon: <MonitorPlay size={18} />, color: 'bg-slate-500' },
];

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 250, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="h-full border-l border-border bg-card flex flex-col z-10 overflow-hidden"
                >
                    <div className="p-4 border-b border-border">
                        <h3 className="font-bold text-sm text-foreground">العمليات المتاحة</h3>
                        <p className="text-xs text-muted-foreground">اسحب العناصر إلى مساحة العمل</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {nodeTypes.map((node) => (
                            <div
                                key={node.type}
                                onDragStart={(event) => onDragStart(event, node.type)}
                                draggable
                                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/50 cursor-grab active:cursor-grabbing transition-all hover:shadow-md group"
                            >
                                <div className={`p-2 rounded-md text-white ${node.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                    {node.icon}
                                </div>
                                <span className="text-sm font-medium">{node.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
