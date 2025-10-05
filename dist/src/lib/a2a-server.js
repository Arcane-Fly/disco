/**
 * A2A (Agent-to-Agent) Server Implementation
 * Following the master cheat sheet for A2A protocol integration
 * This is a simplified implementation until the official a2a-protocol package is available
 */
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
/**
 * A2A Server for agent-to-agent communication
 * Based on the master cheat sheet A2A protocol specification
 */
export class A2AServer {
    skills = new Map();
    tasks = new Map();
    router;
    agentCard;
    constructor(config) {
        this.router = Router();
        this.agentCard = {
            name: config.name,
            version: config.version,
            skills: [],
            endpoint: `http://localhost:${config.port}`,
        };
        this.setupRoutes();
    }
    /**
     * Register a skill with the A2A server
     * Example usage: server.registerSkill('greet', async ({ name }) => `Hello, ${name}!`)
     */
    registerSkill(name, handler) {
        this.skills.set(name, { name, handler });
        this.agentCard.skills = Array.from(this.skills.keys());
    }
    /**
     * Get the Express router for A2A endpoints
     */
    getRouter() {
        return this.router;
    }
    setupRoutes() {
        // Agent Card endpoint
        this.router.get('/agent-card', (req, res) => {
            res.json(this.agentCard);
        });
        // Core A2A method: tasks/send
        this.router.post('/tasks/send', async (req, res) => {
            try {
                const { skill, data } = req.body;
                if (!skill || !this.skills.has(skill)) {
                    return res.status(400).json({
                        success: false,
                        error: `Unknown skill: ${skill}`,
                    });
                }
                const skillHandler = this.skills.get(skill);
                const result = await skillHandler.handler(data);
                res.json({
                    success: true,
                    result,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        // Core A2A method: tasks/sendSubscribe (SSE streaming)
        this.router.get('/tasks/sendSubscribe', async (req, res) => {
            try {
                const { skill, data } = req.query;
                if (!skill || !this.skills.has(skill)) {
                    return res.status(400).json({
                        success: false,
                        error: `Unknown skill: ${skill}`,
                    });
                }
                // Set up SSE
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                });
                const taskId = uuidv4();
                // Send initial task started event
                res.write(`data: ${JSON.stringify({ taskId, status: 'started' })}\n\n`);
                try {
                    const skillHandler = this.skills.get(skill);
                    const parsedData = typeof data === 'string' ? JSON.parse(data) : data || {};
                    const result = await skillHandler.handler(parsedData);
                    // Send result
                    res.write(`data: ${JSON.stringify({ taskId, status: 'completed', result })}\n\n`);
                }
                catch (error) {
                    // Send error
                    res.write(`data: ${JSON.stringify({
                        taskId,
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    })}\n\n`);
                }
                res.end();
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        // Core A2A method: tasks/get
        this.router.get('/tasks/get/:taskId', (req, res) => {
            const { taskId } = req.params;
            const task = this.tasks.get(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found',
                });
            }
            res.json({
                success: true,
                status: task.status,
                result: task.result,
                error: task.error,
            });
        });
        // Core A2A method: tasks/cancel
        this.router.post('/tasks/cancel/:taskId', (req, res) => {
            const { taskId } = req.params;
            // In a real implementation, this would cancel the running task
            this.tasks.delete(taskId);
            res.json({
                success: true,
                message: 'Task cancelled',
            });
        });
        // List available skills
        this.router.get('/skills', (req, res) => {
            res.json({
                skills: Array.from(this.skills.keys()),
                agentCard: this.agentCard,
            });
        });
    }
    /**
     * Example skill registration for demonstration
     */
    registerExampleSkills() {
        // Greet skill - simple example from the master cheat sheet
        this.registerSkill('greet', async (data) => {
            const { name } = data;
            return `Hello, ${name}! This is the A2A agent responding.`;
        });
        // MCP integration skill
        this.registerSkill('mcp-status', async () => {
            return {
                status: 'healthy',
                protocol: 'MCP 1.18.2',
                capabilities: ['resources', 'tools', 'prompts'],
                timestamp: new Date().toISOString(),
            };
        });
        // Container management skill
        this.registerSkill('create-container', async ({ template }) => {
            return {
                containerId: uuidv4(),
                template: template || 'default',
                status: 'created',
                timestamp: new Date().toISOString(),
            };
        });
    }
}
//# sourceMappingURL=a2a-server.js.map