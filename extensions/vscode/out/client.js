"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoMCPClient = void 0;
const axios_1 = __importDefault(require("axios"));
const ws_1 = __importDefault(require("ws"));
class DiscoMCPClient {
    constructor() {
        this.apiClient = null;
        this.websocket = null;
        this.serverUrl = '';
        this.apiKey = '';
        this.connected = false;
    }
    async connect(serverUrl, apiKey) {
        this.serverUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        this.apiKey = apiKey;
        // Initialize HTTP client
        this.apiClient = axios_1.default.create({
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
            }
            else {
                throw new Error('Authentication failed');
            }
        }
        catch (error) {
            throw new Error(`Failed to connect to server: ${error}`);
        }
    }
    async disconnect() {
        this.connected = false;
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.apiClient = null;
    }
    isConnected() {
        return this.connected;
    }
    async initializeWebSocket() {
        try {
            const wsUrl = this.serverUrl.replace('http', 'ws') + '/socket.io';
            this.websocket = new ws_1.default(wsUrl, {
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
        }
        catch (error) {
            console.warn('WebSocket connection failed, continuing with HTTP only:', error);
        }
    }
    // Container Management
    async listContainers() {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.get('/containers');
            return response.data.containers || [];
        }
        catch (error) {
            throw new Error(`Failed to list containers: ${error}`);
        }
    }
    async createContainer(name) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.post('/containers', { name });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to create container: ${error}`);
        }
    }
    async deleteContainer(containerId) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            await this.apiClient.delete(`/containers/${containerId}`);
        }
        catch (error) {
            throw new Error(`Failed to delete container: ${error}`);
        }
    }
    async getContainer(containerId) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.get(`/containers/${containerId}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get container: ${error}`);
        }
    }
    // File Operations
    async listFiles(containerId, path = '/') {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.get(`/files/${containerId}`, {
                params: { path }
            });
            return response.data.files || [];
        }
        catch (error) {
            throw new Error(`Failed to list files: ${error}`);
        }
    }
    async readFile(containerId, path) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.get(`/files/${containerId}/content`, {
                params: { path }
            });
            return response.data.content || '';
        }
        catch (error) {
            throw new Error(`Failed to read file: ${error}`);
        }
    }
    async writeFile(containerId, path, content) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            await this.apiClient.post(`/files/${containerId}`, {
                path,
                content
            });
        }
        catch (error) {
            throw new Error(`Failed to write file: ${error}`);
        }
    }
    async deleteFile(containerId, path) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            await this.apiClient.delete(`/files/${containerId}`, {
                params: { path }
            });
        }
        catch (error) {
            throw new Error(`Failed to delete file: ${error}`);
        }
    }
    // Terminal Operations
    async executeCommand(containerId, command, workingDirectory) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.post(`/terminal/${containerId}/execute`, {
                command,
                workingDirectory
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to execute command: ${error}`);
        }
    }
    async listTerminalSessions(containerId) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.get(`/terminal/${containerId}/sessions`);
            return response.data.sessions || [];
        }
        catch (error) {
            throw new Error(`Failed to list terminal sessions: ${error}`);
        }
    }
    async createTerminalSession(containerId) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.post(`/terminal/${containerId}/session`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to create terminal session: ${error}`);
        }
    }
    // Git Operations
    async gitClone(containerId, repoUrl, directory) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            await this.apiClient.post(`/git/${containerId}/clone`, {
                url: repoUrl,
                directory
            });
        }
        catch (error) {
            throw new Error(`Failed to clone repository: ${error}`);
        }
    }
    async gitStatus(containerId) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            const response = await this.apiClient.get(`/git/${containerId}/status`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get git status: ${error}`);
        }
    }
    async gitCommit(containerId, message) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            await this.apiClient.post(`/git/${containerId}/commit`, {
                message
            });
        }
        catch (error) {
            throw new Error(`Failed to commit changes: ${error}`);
        }
    }
    async gitPush(containerId) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            await this.apiClient.post(`/git/${containerId}/push`);
        }
        catch (error) {
            throw new Error(`Failed to push changes: ${error}`);
        }
    }
    async gitPull(containerId) {
        if (!this.apiClient) {
            throw new Error('Not connected to server');
        }
        try {
            await this.apiClient.post(`/git/${containerId}/pull`);
        }
        catch (error) {
            throw new Error(`Failed to pull changes: ${error}`);
        }
    }
}
exports.DiscoMCPClient = DiscoMCPClient;
//# sourceMappingURL=client.js.map