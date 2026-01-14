export interface Project {
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    speed?: string;
    created_at: number;
    log: string[];
    output_video?: string;
}

export interface Stats {
    active_projects: number;
    completed_projects: number;
    processing_projects: number;
    total_projects: number;
}

const API_BASE_URL = 'http://localhost:8000';

export const api = {
    async getProjects(status?: string): Promise<Project[]> {
        const query = status ? `?status=${status}` : '';
        const response = await fetch(`${API_BASE_URL}/projects${query}`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
    },

    async getStats(): Promise<Stats> {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    async runWorkflow(data: { video_url: string; steps: any[]; config: any; project_id: string }) {
        let response;
        try {
            response = await fetch(`${API_BASE_URL}/workflow/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (err) {
            throw new Error(`Network Error: Cannot connect to ${API_BASE_URL}. Is backend running?`);
        }

        if (!response.ok) {
            let errorMsg = 'Failed to start workflow';
            try {
                const errorData = await response.json();
                errorMsg = JSON.stringify(errorData) || response.statusText;
            } catch (e) {
                errorMsg = await response.text();
            }
            throw new Error(`Server Error (${response.status}): ${errorMsg}`);
        }
        return response.json();
    },

    async selectFolder(): Promise<string | null> {
        try {
            console.log("Requesting folder selection via API...");
            const response = await fetch(`${API_BASE_URL}/system/select-folder`);
            console.log("Folder selection response status:", response.status);

            if (!response.ok) throw new Error('Failed to open dialog');
            const data = await response.json();
            console.log("Folder selection data:", data);

            if (data.status === 'success') return data.path;
            return null;
        } catch (e) {
            console.error("Folder selection failed", e);
            return null;
        }
    },

    async deleteProject(projectId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete project');
        }
    },

    async fetchVideos(url: string, type: 'shorts' | 'long' = 'shorts'): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/youtube/fetch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, type })
        });
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        return data.videos || [];
    },

    async scanFolder(path: string): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/system/scan-folder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
        if (!response.ok) throw new Error('Failed to scan folder');
        const data = await response.json();
        return data.videos || [];
    }
};
