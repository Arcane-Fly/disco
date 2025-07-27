import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';

export interface Container {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error';
    createdAt: string;
    url?: string;
}

export interface FileItem {
    name: string;
    type: 'file' | 'directory';
    path: string;
    size?: number;
    lastModified?: string;
    content?: string;
}

export interface TerminalSession {
    sessionId: string;
    workingDirectory: string;
    isActive: boolean;
}

export class DiscoMCPClient {
    private apiClient: AxiosInstance | null = null;
    private websocket: WebSocket | null = null;
    private serverUrl: string = '';
    private apiKey: string = '';
    private connected: boolean = false;

    async connect(serverUrl: string, apiKey: string): Promise<void> {
        this.serverUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        this.apiKey = apiKey;

        // Initialize HTTP client
        this.apiClient = axios.create({
            baseURL: `${this.serverUrl}/api/v1`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        // Test connection
        try {
            const response = await this.apiClient.get('/auth/validate');
            if (response.status === 200) {
                this.connected = true;
                await this.initializeWebSocket();
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            throw new Error(`Failed to connect to server: ${error}`);
        }
    }

    async disconnect(): Promise<void> {
        this.connected = false;
        
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        
        this.apiClient = null;
    }

    isConnected(): boolean {
        return this.connected;
    }

    private async initializeWebSocket(): Promise<void> {
        try {
            const wsUrl = this.serverUrl.replace('http', 'ws') + '/socket.io';
            this.websocket = new WebSocket(wsUrl, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (this.websocket) {
                this.websocket.on('open', () => {
                    console.log('WebSocket connected to Disco MCP Server');
                });

                this.websocket.on('error', (error) => {
                    console.error('WebSocket error:', error);
                });

                this.websocket.on('close', () => {
                    console.log('WebSocket disconnected from Disco MCP Server');
                });
            }

        } catch (error) {
            console.warn('WebSocket connection failed, continuing with HTTP only:', error);
        }
    }

    // Container Management
    async listContainers(): Promise<Container[]> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.get('/containers');
            return response.data.containers || [];
        } catch (error) {
            throw new Error(`Failed to list containers: ${error}`);
        }
    }

    async createContainer(name: string): Promise<Container> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.post('/containers', { name });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create container: ${error}`);
        }
    }

    async deleteContainer(containerId: string): Promise<void> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            await this.apiClient.delete(`/containers/${containerId}`);
        } catch (error) {
            throw new Error(`Failed to delete container: ${error}`);
        }
    }

    async getContainer(containerId: string): Promise<Container> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.get(`/containers/${containerId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get container: ${error}`);
        }
    }

    // File Operations
    async listFiles(containerId: string, path: string = '/'): Promise<FileItem[]> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.get(`/files/${containerId}`, {
                params: { path }
            });
            return response.data.files || [];
        } catch (error) {
            throw new Error(`Failed to list files: ${error}`);
        }
    }

    async readFile(containerId: string, path: string): Promise<string> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.get(`/files/${containerId}/content`, {
                params: { path }
            });
            return response.data.content || '';
        } catch (error) {
            throw new Error(`Failed to read file: ${error}`);
        }
    }

    async writeFile(containerId: string, path: string, content: string): Promise<void> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            await this.apiClient.post(`/files/${containerId}`, {
                path,
                content
            });
        } catch (error) {
            throw new Error(`Failed to write file: ${error}`);
        }
    }

    async deleteFile(containerId: string, path: string): Promise<void> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            await this.apiClient.delete(`/files/${containerId}`, {
                params: { path }
            });
        } catch (error) {
            throw new Error(`Failed to delete file: ${error}`);
        }
    }

    // Terminal Operations
    async executeCommand(containerId: string, command: string, workingDirectory?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.post(`/terminal/${containerId}/execute`, {
                command,
                workingDirectory
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to execute command: ${error}`);
        }
    }

    async listTerminalSessions(containerId: string): Promise<TerminalSession[]> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.get(`/terminal/${containerId}/sessions`);
            return response.data.sessions || [];
        } catch (error) {
            throw new Error(`Failed to list terminal sessions: ${error}`);
        }
    }

    async createTerminalSession(containerId: string): Promise<TerminalSession> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.post(`/terminal/${containerId}/session`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create terminal session: ${error}`);
        }
    }

    // Git Operations
    async gitClone(containerId: string, repoUrl: string, directory?: string): Promise<void> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            await this.apiClient.post(`/git/${containerId}/clone`, {
                url: repoUrl,
                directory
            });
        } catch (error) {
            throw new Error(`Failed to clone repository: ${error}`);
        }
    }

    async gitStatus(containerId: string): Promise<any> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            const response = await this.apiClient.get(`/git/${containerId}/status`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get git status: ${error}`);
        }
    }

    async gitCommit(containerId: string, message: string): Promise<void> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            await this.apiClient.post(`/git/${containerId}/commit`, {
                message
            });
        } catch (error) {
            throw new Error(`Failed to commit changes: ${error}`);
        }
    }

    async gitPush(containerId: string): Promise<void> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            await this.apiClient.post(`/git/${containerId}/push`);
        } catch (error) {
            throw new Error(`Failed to push changes: ${error}`);
        }
    }

    async gitPull(containerId: string): Promise<void> {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }

        try {
            await this.apiClient.post(`/git/${containerId}/pull`);
        } catch (error) {
            throw new Error(`Failed to pull changes: ${error}`);
        }
    }
}