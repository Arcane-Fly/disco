/**
 * Container Proxy Implementation
 * Provides server-side container management using Docker
 * Compatible with WebContainer API interface
 */

import Docker from 'dockerode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ContainerProxyConfig {
  dockerHost?: string;
  dockerPort?: number;
  maxContainers?: number;
  containerTimeout?: number;
  defaultImage?: string;
  resourceLimits?: {
    cpuShares?: number;
    memory?: string;
    diskQuota?: string;
  };
  redisUrl?: string;
}

export interface ContainerSession {
  id: string;
  containerId?: string;
  status: 'pending' | 'running' | 'stopped' | 'error';
  createdAt: Date;
  lastActivity: Date;
  userId?: string;
  template: string;
  files: Map<string, string>;
  processes: Map<string, ProcessInfo>;
  environment: Record<string, string>;
}

export interface ProcessInfo {
  pid: string;
  command: string;
  status: 'running' | 'exited';
  exitCode?: number;
  output: string[];
  startedAt: Date;
}

export interface FileSystemAPI {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  rm(path: string, options?: { recursive?: boolean }): Promise<void>;
  stat(path: string): Promise<{ isFile: boolean; isDirectory: boolean; size: number }>;
}

export interface ProcessAPI {
  spawn(command: string, args: string[], options?: {
    cwd?: string;
    env?: Record<string, string>;
  }): Promise<{ pid: string; output: AsyncIterableIterator<string> }>;
  kill(pid: string): Promise<void>;
  exec(command: string, options?: {
    cwd?: string;
    env?: Record<string, string>;
  }): Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

export class ContainerProxy extends EventEmitter {
  private docker: Docker;
  private sessions: Map<string, ContainerSession>;
  private redis?: any; // Redis client if available
  private config: Required<ContainerProxyConfig>;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: ContainerProxyConfig = {}) {
    super();
    
    this.config = {
      dockerHost: config.dockerHost || process.env.DOCKER_HOST || '/var/run/docker.sock',
      dockerPort: config.dockerPort || 2375,
      maxContainers: config.maxContainers || 50,
      containerTimeout: config.containerTimeout || 3600000, // 1 hour
      defaultImage: config.defaultImage || 'node:20-alpine',
      resourceLimits: {
        cpuShares: config.resourceLimits?.cpuShares || 512,
        memory: config.resourceLimits?.memory || '512m',
        diskQuota: config.resourceLimits?.diskQuota || '1g',
        ...config.resourceLimits
      },
      redisUrl: config.redisUrl || process.env.REDIS_URL || ''
    };

    // Initialize Docker client
    if (this.config.dockerHost.startsWith('/')) {
      // Unix socket
      this.docker = new Docker({ socketPath: this.config.dockerHost });
    } else {
      // TCP connection
      this.docker = new Docker({
        host: this.config.dockerHost,
        port: this.config.dockerPort
      });
    }

    this.sessions = new Map();

    // Initialize Redis if URL provided
    if (this.config.redisUrl) {
      // Redis initialization would go here if ioredis is available
      // For now, we'll skip Redis to avoid dependency issues
      console.log('Redis URL provided but Redis support disabled in container proxy');
    }

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Create a new container session
   */
  async createSession(template: string = 'node', userId?: string): Promise<string> {
    // Check container limit
    const activeContainers = Array.from(this.sessions.values())
      .filter(s => s.status === 'running').length;
    
    if (activeContainers >= this.config.maxContainers) {
      throw new Error('Maximum container limit reached');
    }

    const sessionId = uuidv4();
    const session: ContainerSession = {
      id: sessionId,
      status: 'pending',
      createdAt: new Date(),
      lastActivity: new Date(),
      userId,
      template,
      files: new Map(),
      processes: new Map(),
      environment: {}
    };

    this.sessions.set(sessionId, session);

    try {
      // Create Docker container
      const container = await this.createDockerContainer(sessionId, template);
      session.containerId = container.id;
      session.status = 'running';

      // Start the container
      await container.start();

      // Save to Redis if available
      if (this.redis) {
        await this.saveSessionToRedis(session);
      }

      this.emit('session:created', { sessionId, containerId: container.id });
      console.log(`Container session created: ${sessionId}`);

      return sessionId;
    } catch (error) {
      session.status = 'error';
      this.emit('session:error', { sessionId, error });
      console.error(`Failed to create container session: ${error}`);
      throw error;
    }
  }

  /**
   * Create a Docker container for the session
   */
  private async createDockerContainer(sessionId: string, template: string) {
    const image = this.getImageForTemplate(template);
    
    // Ensure image exists
    await this.pullImageIfNeeded(image);

    const container = await this.docker.createContainer({
      Image: image,
      name: `webcontainer-${sessionId}`,
      Hostname: `container-${sessionId.slice(0, 8)}`,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      OpenStdin: false,
      StdinOnce: false,
      Env: [
        `SESSION_ID=${sessionId}`,
        'NODE_ENV=development'
      ],
      WorkingDir: '/workspace',
      Cmd: ['/bin/sh'],
      HostConfig: {
        CpuShares: this.config.resourceLimits.cpuShares,
        Memory: this.parseMemoryLimit(this.config.resourceLimits.memory!),
        AutoRemove: true,
        NetworkMode: 'bridge',
        Binds: [],
        CapDrop: ['ALL'],
        CapAdd: ['CHOWN', 'SETUID', 'SETGID', 'DAC_OVERRIDE'],
        SecurityOpt: ['no-new-privileges']
      },
      Labels: {
        'webcontainer.session': sessionId,
        'webcontainer.template': template,
        'webcontainer.created': new Date().toISOString()
      }
    });

    return container;
  }

  /**
   * Get Docker image for template
   */
  private getImageForTemplate(template: string): string {
    const imageMap: Record<string, string> = {
      'node': 'node:20-alpine',
      'python': 'python:3.11-alpine',
      'ruby': 'ruby:3.2-alpine',
      'go': 'golang:1.21-alpine',
      'rust': 'rust:1.74-alpine',
      'java': 'openjdk:21-alpine',
      'php': 'php:8.2-alpine',
      'deno': 'denoland/deno:alpine',
      'bun': 'oven/bun:alpine'
    };

    return imageMap[template] || this.config.defaultImage;
  }

  /**
   * Pull Docker image if not present
   */
  private async pullImageIfNeeded(image: string): Promise<void> {
    try {
      await this.docker.getImage(image).inspect();
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log(`Pulling Docker image: ${image}`);
        const stream = await this.docker.pull(image);
        
        // Wait for pull to complete
        await new Promise((resolve, reject) => {
          this.docker.modem.followProgress(stream, (err: any, res: any) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Get filesystem API for a session
   */
  getFileSystem(sessionId: string): FileSystemAPI {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') {
      throw new Error('Session not found or not running');
    }

    const container = this.docker.getContainer(session.containerId!);

    return {
      readFile: async (filePath: string) => {
        const fullPath = path.posix.join('/workspace', filePath);
        const exec = await container.exec({
          Cmd: ['cat', fullPath],
          AttachStdout: true,
          AttachStderr: true
        });

        const stream = await exec.start({});
        const output = await this.streamToString(stream);
        
        session.lastActivity = new Date();
        return output;
      },

      writeFile: async (filePath: string, content: string) => {
        const fullPath = path.posix.join('/workspace', filePath);
        const dir = path.posix.dirname(fullPath);
        
        // Ensure directory exists
        await container.exec({
          Cmd: ['mkdir', '-p', dir],
          AttachStdout: true,
          AttachStderr: true
        }).then(exec => exec.start({}));

        // Write file
        const escapedContent = content.replace(/'/g, "'\\''");
        const exec = await container.exec({
          Cmd: ['sh', '-c', `echo '${escapedContent}' > ${fullPath}`],
          AttachStdout: true,
          AttachStderr: true
        });

        await exec.start({});
        
        session.files.set(filePath, content);
        session.lastActivity = new Date();
      },

      readdir: async (dirPath: string) => {
        const fullPath = path.posix.join('/workspace', dirPath);
        const exec = await container.exec({
          Cmd: ['ls', '-1', fullPath],
          AttachStdout: true,
          AttachStderr: true
        });

        const stream = await exec.start({});
        const output = await this.streamToString(stream);
        
        session.lastActivity = new Date();
        return output.split('\n').filter(Boolean);
      },

      mkdir: async (dirPath: string, options = {}) => {
        const fullPath = path.posix.join('/workspace', dirPath);
        const cmd = options.recursive 
          ? ['mkdir', '-p', fullPath]
          : ['mkdir', fullPath];
        
        const exec = await container.exec({
          Cmd: cmd,
          AttachStdout: true,
          AttachStderr: true
        });

        await exec.start({});
        session.lastActivity = new Date();
      },

      rm: async (filePath: string, options = {}) => {
        const fullPath = path.posix.join('/workspace', filePath);
        const cmd = options.recursive
          ? ['rm', '-rf', fullPath]
          : ['rm', fullPath];
        
        const exec = await container.exec({
          Cmd: cmd,
          AttachStdout: true,
          AttachStderr: true
        });

        await exec.start({});
        
        session.files.delete(filePath);
        session.lastActivity = new Date();
      },

      stat: async (filePath: string) => {
        const fullPath = path.posix.join('/workspace', filePath);
        const exec = await container.exec({
          Cmd: ['stat', '-c', '%F|%s', fullPath],
          AttachStdout: true,
          AttachStderr: true
        });

        const stream = await exec.start({});
        const output = await this.streamToString(stream);
        const [type, size] = output.trim().split('|');
        
        session.lastActivity = new Date();
        
        return {
          isFile: type === 'regular file',
          isDirectory: type === 'directory',
          size: parseInt(size, 10)
        };
      }
    };
  }

  /**
   * Get process API for a session
   */
  getProcess(sessionId: string): ProcessAPI {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') {
      throw new Error('Session not found or not running');
    }

    const container = this.docker.getContainer(session.containerId!);

    return {
      spawn: async (command: string, args: string[], options = {}) => {
        const pid = uuidv4();
        const processInfo: ProcessInfo = {
          pid,
          command: `${command} ${args.join(' ')}`,
          status: 'running',
          output: [],
          startedAt: new Date()
        };

        session.processes.set(pid, processInfo);

        const exec = await container.exec({
          Cmd: [command, ...args],
          AttachStdout: true,
          AttachStderr: true,
          WorkingDir: options.cwd ? path.posix.join('/workspace', options.cwd) : '/workspace',
          Env: options.env ? Object.entries(options.env).map(([k, v]) => `${k}=${v}`) : undefined
        });

        const stream = await exec.start({});
        
        // Create async iterator for output
        const output = {
          async *[Symbol.asyncIterator]() {
            const chunks: string[] = [];
            
            stream.on('data', (chunk: Buffer) => {
              const text = chunk.toString('utf8');
              chunks.push(text);
              processInfo.output.push(text);
            });

            stream.on('end', () => {
              processInfo.status = 'exited';
              processInfo.exitCode = 0;
            });

            while (processInfo.status === 'running') {
              if (chunks.length > 0) {
                yield chunks.shift()!;
              } else {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }

            // Yield remaining chunks
            while (chunks.length > 0) {
              yield chunks.shift()!;
            }
          }
        };

        session.lastActivity = new Date();
        return { pid, output: output as AsyncIterableIterator<string> };
      },

      kill: async (pid: string) => {
        const processInfo = session.processes.get(pid);
        if (processInfo) {
          processInfo.status = 'exited';
          processInfo.exitCode = -1;
          session.lastActivity = new Date();
        }
      },

      exec: async (command: string, options = {}) => {
        const exec = await container.exec({
          Cmd: ['sh', '-c', command],
          AttachStdout: true,
          AttachStderr: true,
          WorkingDir: options.cwd ? path.posix.join('/workspace', options.cwd) : '/workspace',
          Env: options.env ? Object.entries(options.env).map(([k, v]) => `${k}=${v}`) : undefined
        });

        const stream = await exec.start({});
        const output = await this.streamToString(stream);
        
        session.lastActivity = new Date();
        
        // Parse stdout and stderr (simplified)
        return {
          stdout: output,
          stderr: '',
          exitCode: 0
        };
      }
    };
  }

  /**
   * Terminate a container session
   */
  async terminateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.containerId) {
      try {
        const container = this.docker.getContainer(session.containerId);
        await container.stop({ t: 5 });
        await container.remove();
      } catch (error: any) {
        if (error.statusCode !== 404) {
          console.error(`Failed to stop container: ${error}`);
        }
      }
    }

    this.sessions.delete(sessionId);
    
    if (this.redis) {
      await this.redis.del(`session:${sessionId}`);
    }

    this.emit('session:terminated', { sessionId });
    console.log(`Container session terminated: ${sessionId}`);
  }

  /**
   * Get session info
   */
  getSession(sessionId: string): ContainerSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all sessions
   */
  listSessions(): ContainerSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Parse memory limit string to bytes
   */
  private parseMemoryLimit(memory: string): number {
    const units: Record<string, number> = {
      'b': 1,
      'k': 1024,
      'm': 1024 * 1024,
      'g': 1024 * 1024 * 1024
    };

    const match = memory.toLowerCase().match(/^(\d+)([bkmg])?$/);
    if (!match) {
      throw new Error(`Invalid memory limit: ${memory}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2] || 'b';
    
    return value * units[unit];
  }

  /**
   * Convert stream to string
   */
  private async streamToString(stream: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      stream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf8'));
      });
      
      stream.on('error', reject);
    });
  }

  /**
   * Save session to Redis
   */
  private async saveSessionToRedis(session: ContainerSession): Promise<void> {
    if (!this.redis) return;

    const data = {
      ...session,
      files: Array.from(session.files.entries()),
      processes: Array.from(session.processes.entries())
    };

    await this.redis.set(
      `session:${session.id}`,
      JSON.stringify(data),
      'EX',
      this.config.containerTimeout / 1000
    );
  }

  /**
   * Restore sessions from Redis
   */
  private async restoreSessionsFromRedis(): Promise<void> {
    if (!this.redis) return;

    try {
      const keys = await this.redis.keys('session:*');
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const session = JSON.parse(data);
          session.files = new Map(session.files);
          session.processes = new Map(session.processes);
          session.createdAt = new Date(session.createdAt);
          session.lastActivity = new Date(session.lastActivity);
          
          this.sessions.set(session.id, session);
        }
      }

      console.log(`Restored ${keys.length} sessions from Redis`);
    } catch (error) {
      console.error(`Failed to restore sessions from Redis: ${error}`);
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(async () => {
      const now = Date.now();
      const timeout = this.config.containerTimeout;

      for (const [sessionId, session] of this.sessions.entries()) {
        const lastActivity = session.lastActivity.getTime();
        
        if (now - lastActivity > timeout) {
          console.log(`Session ${sessionId} timed out, terminating...`);
          await this.terminateSession(sessionId);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Terminate all sessions
    for (const sessionId of this.sessions.keys()) {
      await this.terminateSession(sessionId);
    }

    if (this.redis) {
      await this.redis.quit();
    }

    this.removeAllListeners();
  }
}

// Export singleton instance
export const containerProxy = new ContainerProxy({
  maxContainers: parseInt(process.env.MAX_CONTAINERS || '50', 10),
  containerTimeout: parseInt(process.env.CONTAINER_TIMEOUT || '3600000', 10),
  redisUrl: process.env.REDIS_URL
});
