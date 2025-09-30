/**
 * A2A (Agent-to-Agent) Server Implementation
 * Following the master cheat sheet for A2A protocol integration
 * This is a simplified implementation until the official a2a-protocol package is available
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { A2ATaskRequest, A2ATaskResponse, A2AAgentCard } from './a2a-client.js';

export interface A2ASkill {
  name: string;
  handler: (data: Record<string, unknown>) => Promise<unknown>;
}

/**
 * A2A Server for agent-to-agent communication
 * Based on the master cheat sheet A2A protocol specification
 */
export class A2AServer {
  private skills: Map<string, A2ASkill> = new Map();
  private tasks: Map<string, { status: 'pending' | 'completed' | 'failed'; result?: unknown; error?: string }> = new Map();
  private router: Router;
  private agentCard: A2AAgentCard;

  constructor(config: { name: string; version: string; port: number }) {
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
  registerSkill(name: string, handler: (data: Record<string, unknown>) => Promise<unknown>): void {
    this.skills.set(name, { name, handler });
    this.agentCard.skills = Array.from(this.skills.keys());
  }

  /**
   * Get the Express router for A2A endpoints
   */
  getRouter(): Router {
    return this.router;
  }

  private setupRoutes(): void {
    // Agent Card endpoint
    this.router.get('/agent-card', (req: Request, res: Response) => {
      res.json(this.agentCard);
    });

    // Core A2A method: tasks/send
    this.router.post('/tasks/send', async (req: Request, res: Response) => {
      try {
        const { skill, data } = req.body as A2ATaskRequest;
        
        if (!skill || !this.skills.has(skill)) {
          return res.status(400).json({
            success: false,
            error: `Unknown skill: ${skill}`,
          });
        }

        const skillHandler = this.skills.get(skill)!;
        const result = await skillHandler.handler(data);

        res.json({
          success: true,
          result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Core A2A method: tasks/sendSubscribe (SSE streaming)
    this.router.get('/tasks/sendSubscribe', async (req: Request, res: Response) => {
      try {
        const { skill, data } = req.query;
        
        if (!skill || !this.skills.has(skill as string)) {
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
          const skillHandler = this.skills.get(skill as string)!;
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data || {};
          const result = await skillHandler.handler(parsedData);

          // Send result
          res.write(`data: ${JSON.stringify({ taskId, status: 'completed', result })}\n\n`);
        } catch (error) {
          // Send error
          res.write(`data: ${JSON.stringify({ 
            taskId, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })}\n\n`);
        }

        res.end();
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Core A2A method: tasks/get
    this.router.get('/tasks/get/:taskId', (req: Request, res: Response) => {
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
    this.router.post('/tasks/cancel/:taskId', (req: Request, res: Response) => {
      const { taskId } = req.params;
      
      // In a real implementation, this would cancel the running task
      this.tasks.delete(taskId);

      res.json({
        success: true,
        message: 'Task cancelled',
      });
    });

    // List available skills
    this.router.get('/skills', (req: Request, res: Response) => {
      res.json({
        skills: Array.from(this.skills.keys()),
        agentCard: this.agentCard,
      });
    });
  }

  /**
   * Example skill registration for demonstration
   */
  registerExampleSkills(): void {
    // Greet skill - simple example from the master cheat sheet
    this.registerSkill('greet', async ({ name }: { name: string }) => {
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
    this.registerSkill('create-container', async ({ template }: { template?: string }) => {
      return {
        containerId: uuidv4(),
        template: template || 'default',
        status: 'created',
        timestamp: new Date().toISOString(),
      };
    });
  }
}