import React, { useCallback, useState, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Panel,
    ReactFlowProvider,
    useReactFlow,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LayoutTemplate } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './Sidebar';
import PropertyInspector from './inspector/PropertyInspector';


// Professional Default Template
const initialNodes: Node[] = [
    // 1. Download (Video Entry Point)
    {
        id: 'download-1',
        type: 'download',
        data: {
            label: 'تحميل الفيديو (Download)',
            sourceType: 'shorts_channel',
            sortOrder: 'newest'
        },
        position: { x: 50, y: 50 },
        className: 'bg-card border-2 border-blue-500/50 shadow-lg rounded-xl p-4 min-w-[200px] text-center font-bold'
    },

    // --- Branch 1: Video Processing ---
    // 2. Video Edit (Mute/Volume)
    {
        id: 'edit-video-1',
        type: 'edit',
        data: { label: 'تعديل الفيديو (Video Edit)', volume: 0, mute: true },
        position: { x: -200, y: 250 },
        className: 'bg-card border border-red-400 shadow-md rounded-xl p-3 min-w-[180px] text-center'
    },
    // 3. Layer (Overlay)
    {
        id: 'layer-1',
        type: 'composer',
        data: { label: 'إضافة طبقة (Overlay)', layers: [] },
        position: { x: -200, y: 400 },
        className: 'bg-card border border-pink-400 shadow-md rounded-xl p-3 min-w-[180px] text-center'
    },

    // --- Branch 2: Subtitle Processing ---
    // 4. Sub Extract
    {
        id: 'sub-extract-1',
        type: 'transcribe',
        data: { label: 'استخراج السب تايتل (Extract Subs)', timing: 'exact' },
        position: { x: 300, y: 250 },
        className: 'bg-card border border-emerald-400 shadow-md rounded-xl p-3 min-w-[180px] text-center'
    },
    // 5. Translate
    {
        id: 'translate-1',
        type: 'translate',
        data: { label: 'ترجمة النص (Translate)', targetLang: 'ar', tashkeel: true },
        position: { x: 500, y: 400 },
        className: 'bg-card border border-purple-400 shadow-md rounded-xl p-3 min-w-[180px] text-center'
    },
    // New: AI Voice
    {
        id: 'tts-1',
        type: 'tts',
        data: { label: 'تعليق صوتي (AI Voice)', voice: 'onyx' },
        position: { x: 300, y: 550 },
        className: 'bg-card border border-orange-400 shadow-md rounded-xl p-3 min-w-[180px] text-center'
    },

    // 6. Merge
    {
        id: 'merge-1',
        type: 'composer',
        data: { label: 'دمج نهائي (Merge)', inputs: ['video', 'subs_original', 'subs_translated', 'audio_tts'] },
        position: { x: 50, y: 700 },
        className: 'bg-card border-2 border-indigo-500 shadow-xl rounded-xl p-4 min-w-[220px] text-center font-bold text-lg'
    },

    // 7. Render
    {
        id: 'render-1',
        type: 'render',
        data: { label: 'تصدير (Render)' },
        position: { x: 50, y: 900 },
        className: 'bg-card border border-slate-500 shadow-md rounded-xl p-3 min-w-[180px] text-center'
    },
];

const initialEdges: Edge[] = [
    // Video Branch
    { id: 'e2-3', source: 'download-1', target: 'edit-video-1', label: 'Video Stream' },
    { id: 'e3-4', source: 'edit-video-1', target: 'layer-1' },
    { id: 'e4-7', source: 'layer-1', target: 'merge-1' },

    // Subtitle Branch
    { id: 'e2-5', source: 'download-1', target: 'sub-extract-1', label: 'Subtitle Stream' },
    { id: 'e5-7', source: 'sub-extract-1', target: 'merge-1', label: 'Original' }, // Direct to merge
    { id: 'e5-6', source: 'sub-extract-1', target: 'translate-1' },
    // Rewrite: Translate -> TTS -> Merge
    { id: 'e6-tts', source: 'translate-1', target: 'tts-1', label: 'Text' },
    { id: 'tts-7', source: 'tts-1', target: 'merge-1', label: 'Audio' },

    // Final
    { id: 'e7-8', source: 'merge-1', target: 'render-1', animated: true, style: { strokeWidth: 2 } },
];

const WorkflowBuilderContent = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const { screenToFlowPosition } = useReactFlow();

    // Reset selection when clicking on pane
    const onPaneClick = useCallback(() => setSelectedNode(null), []);

    // Set selection when clicking a node
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: uuidv4(),
                type,
                position,
                data: { label: `${type} node` },
                className: 'bg-card border border-border shadow-md rounded-xl p-3 min-w-[150px] text-center'
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );

    return (
        <div className="flex h-full w-full overflow-hidden" ref={reactFlowWrapper}>
            {/* Tools Sidebar (Draggable Nodes) */}
            <Sidebar isOpen={sidebarOpen} />

            {/* The Graph Canvas */}
            <div className="flex-1 h-full relative bg-dot-pattern">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    fitView
                    dir="ltr"
                    className="bg-background/50"
                >
                    <Background color="#71717a" gap={20} size={1} />
                    <Controls className="bg-card border border-border fill-foreground text-foreground" />
                    <MiniMap className="bg-card border border-border" />

                    {/* Floating Toolbar inside Canvas */}
                    <Panel position="top-right" className="m-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="bg-card p-2 rounded-lg border border-border shadow-sm hover:bg-muted transition-colors"
                            >
                                <LayoutTemplate size={20} />
                            </button>
                        </div>
                    </Panel>
                </ReactFlow>

                {/* Property Inspector Overlay */}
                {selectedNode && (
                    <PropertyInspector
                        selectedNode={selectedNode}
                        onClose={() => setSelectedNode(null)}
                    />
                )}
            </div>
        </div>
    );
};

// Export Content directly (Parent provides the Provider)
export default WorkflowBuilderContent;
