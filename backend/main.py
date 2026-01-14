import os
import json
import sys
import io
import threading
from contextlib import redirect_stdout, redirect_stderr
from datetime import datetime
# Fix for protobuf compatibility on newer Python versions
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"

from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Set
from services.engine import process_video

app = FastAPI(title="YouTube Copier API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Backend state management
class BackendState:
    def __init__(self):
        self.is_running = False
        self.logs: List[Dict] = []
        self.websocket_connections: Set[WebSocket] = set()
        self.log_lock = threading.Lock()
    
    def add_log(self, message: str, log_type: str = "output"):
        with self.log_lock:
            log_entry = {
                "type": log_type,
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
            self.logs.append(log_entry)
            # Keep only last 1000 logs
            if len(self.logs) > 1000:
                self.logs = self.logs[-1000:]
        
        # Broadcast to all connected websockets
        self._broadcast_log(log_entry)
    
    def _broadcast_log(self, log_entry: Dict):
        import asyncio
        for ws in list(self.websocket_connections):
            try:
                asyncio.create_task(ws.send_json(log_entry))
            except:
                self.websocket_connections.discard(ws)
    
    async def add_websocket(self, ws: WebSocket):
        self.websocket_connections.add(ws)
        # Send all previous logs to the newly connected client
        for log in self.logs:
            try:
                await ws.send_json(log)
            except:
                pass
    
    def remove_websocket(self, ws: WebSocket):
        self.websocket_connections.discard(ws)

backend_state = BackendState()

class WorkflowRequest(BaseModel):
    video_url: str
    steps: List[Dict]
    config: Dict
    project_id: str

@app.get("/")
async def root():
    return {"message": "YouTube Copier Backend is Running"}

@app.post("/backend/start")
async def start_backend():
    """Start the backend and log its activities"""
    if backend_state.is_running:
        backend_state.add_log("Backend is already running", "info")
        return {"status": "already_running", "message": "Backend is already running"}
    
    backend_state.is_running = True
    backend_state.add_log("Backend starting...", "info")
    backend_state.add_log(f"Python version: {sys.version}", "output")
    backend_state.add_log(f"Current directory: {os.getcwd()}", "output")
    backend_state.add_log("All services initialized successfully", "success")
    
    return {"status": "started", "message": "Backend started successfully"}

@app.post("/backend/stop")
async def stop_backend():
    """Stop the backend"""
    if not backend_state.is_running:
        backend_state.add_log("Backend is not running", "info")
        return {"status": "not_running", "message": "Backend is not running"}
    
    backend_state.is_running = False
    backend_state.add_log("Backend stopping...", "info")
    backend_state.add_log("Backend stopped successfully", "success")
    
    return {"status": "stopped", "message": "Backend stopped successfully"}

@app.websocket("/ws/logs")
async def websocket_logs_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time logs"""
    await websocket.accept()
    await backend_state.add_websocket(websocket)
    
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except Exception as e:
        backend_state.add_log(f"WebSocket error: {str(e)}", "error")
    finally:
        backend_state.remove_websocket(websocket)

@app.post("/workflow/run")
async def run_workflow(request: WorkflowRequest, background_tasks: BackgroundTasks):
    from services.engine import update_project_status
    # Log workflow start
    backend_state.add_log(f"Starting workflow for project: {request.project_id}", "info")
    backend_state.add_log(f"Video URL: {request.video_url}", "output")
    
    # Initialize project status immediately
    update_project_status(request.project_id, "pending", 0, "Initializing workflow")
    
    # Run in background to avoid blocking API
    background_tasks.add_task(process_video, request.video_url, request.steps, request.config, request.project_id)
    
    backend_state.add_log(f"Workflow queued for project: {request.project_id}", "success")
    return {"status": "started", "message": "Workflow started in background", "project_id": request.project_id}

@app.get("/projects")
async def get_projects(status: Optional[str] = None):
    projects_db = "storage/projects.json"
    if not os.path.exists(projects_db):
        return []
    
    try:
        with open(projects_db, 'r', encoding='utf-8') as f:
            data = json.load(f)
            projects_list = list(data.values())
            
            # Sort by creation time desc
            projects_list.sort(key=lambda x: x.get('created_at', 0), reverse=True)
            
            if status:
                return [p for p in projects_list if p.get('status') == status]
            return projects_list
    except Exception as e:
        return []

@app.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    projects_db = "storage/projects.json"
    if not os.path.exists(projects_db):
        return {"status": "error", "message": "Database not found"}
    
    try:
        data = {}
        with open(projects_db, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if project_id in data:
            del data[project_id]
            
            with open(projects_db, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
                
            return {"status": "success", "message": "Project deleted"}
        else:
            return {"status": "error", "message": "Project not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/stats")
async def get_stats():
    projects_db = "storage/projects.json"
    stats = {
        "active_projects": 0,
        "completed_projects": 0,
        "processing_projects": 0,
        "total_projects": 0
    }
    
    if not os.path.exists(projects_db):
        return stats
        
    try:
        with open(projects_db, 'r', encoding='utf-8') as f:
            data = json.load(f)
            projects =  list(data.values())
            
            stats["total_projects"] = len(projects)
            stats["active_projects"] = len([p for p in projects if p.get('status') in ['pending', 'processing']])
            stats["completed_projects"] = len([p for p in projects if p.get('status') == 'completed'])
            stats["processing_projects"] = len([p for p in projects if p.get('status') == 'processing'])
            
            return stats
    except:
        return stats

@app.get("/system/select-folder")
async def select_folder():
    """Opens a native folder dialog on the server side and returns the selected path"""
    import subprocess
    
    # PowerShell command to open FolderBrowserDialog
    ps_script = """
    Add-Type -AssemblyName System.Windows.Forms
    $f = New-Object System.Windows.Forms.FolderBrowserDialog
    $f.ShowNewFolderButton = $true
    if ($f.ShowDialog() -eq 'OK') {
        Write-Host $f.SelectedPath
    } else {
        Write-Host "CANCELLED"
    }
    """
    
    try:
        # Run PowerShell command
        result = subprocess.run(["powershell", "-Command", ps_script], capture_output=True, text=True)
        output = result.stdout.strip()
        
        if output == "CANCELLED" or not output:
            return {"status": "cancelled", "path": None}
            
        return {"status": "success", "path": output}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/youtube/fetch")
async def fetch_youtube_videos(request: Dict[str, str]):
    from services.youtube import fetch_videos
    url = request.get("url")
    video_type = request.get("type", "shorts")
    
    if not url:
        return {"status": "error", "message": "URL is required"}
        
    videos = fetch_videos(url, video_type)
    return {"status": "success", "videos": videos}

@app.post("/system/scan-folder")
async def scan_local_folder(request: Dict[str, str]):
    from services.youtube import process_local_folder
    path = request.get("path")
    
    if not path:
        return {"status": "error", "message": "Path is required"}
        
    videos = process_local_folder(path)
    return {"status": "success", "videos": videos}

if __name__ == "__main__":
    import uvicorn
    # Log startup
    print("Backend starting on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
