import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Wand2, Play, Save, Settings2 } from 'lucide-react';
import { useReactFlow, ReactFlowProvider } from '@xyflow/react';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import { api } from '../services/api';

const NewProjectContent = () => {
    const [projectUrl, setProjectUrl] = useState('');
    const [projectName, setProjectName] = useState('مشروع جديد');

    // API Configuration State
    const [apiKey, setApiKey] = useState('');
    const [provider, setProvider] = useState('gemini'); // gemini or openai

    const { getNodes } = useReactFlow();

    const handleStartProcessing = async () => {
        const nodes = getNodes();

        // Find Download Node
        const downloadNode = nodes.find(n => n.type === 'download');
        if (!downloadNode || !downloadNode.data?.url) {
            alert('يرجى إضافة عقدة "تحميل" وتحديد رابط المصدر أو المجلد.');
            return;
        }

        const projectId = Date.now().toString();

        // Helper to find API key value by ID
        const getKeyValue = (keyId: string) => {
            const config = JSON.parse(localStorage.getItem('app_config') || '{}');
            const keys = config.apiKeys || [];
            const found = keys.find((k: any) => k.id === keyId);
            return found ? found.key : null;
        };

        // Construct workflow payload with key resolution
        const payload = {
            project_id: projectId,
            video_url: downloadNode.data.url,
            steps: nodes.map(n => {
                // If node has apiKeyId, resolve it to actual key
                const config = { ...n.data };
                if (config.apiKeyId) {
                    config.resolvedKey = getKeyValue(config.apiKeyId);
                }
                return {
                    id: n.type,
                    type: n.type,
                    config: config
                };
            }),
            config: {
                // Global config if any left
            }
        };

        try {
            await api.runWorkflow(payload);
            // Redirect to Dashboard
            window.location.href = '/';
        } catch (error: any) {
            console.error(error);
            alert(`خطأ: ${error.message}`);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-4">
            {/* Header / Top Bar */}
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Video size={24} />
                    </div>
                    <div className="flex flex-col gap-1 w-full max-w-lg">
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="bg-transparent text-lg font-bold outline-none placeholder:text-muted-foreground/50"
                            placeholder="اسم المشروع"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <Save size={18} />
                        <span>حفظ كمسودة</span>
                    </button>
                    <button
                        onClick={handleStartProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-all text-sm font-bold"
                    >
                        <Play size={18} />
                        <span>بدء المعالجة</span>
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden relative">
                <WorkflowBuilder />
            </div>
        </div>
    );
};

const NewProject = () => (
    <ReactFlowProvider>
        <NewProjectContent />
    </ReactFlowProvider>
);

export default NewProject;
