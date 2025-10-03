/**
 * Container Proxy Implementation
 * Provides server-side container management using Docker
 * Compatible with WebContainer API interface
 */
import { EventEmitter } from 'events';
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
    mkdir(path: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    rm(path: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    stat(path: string): Promise<{
        isFile: boolean;
        isDirectory: boolean;
        size: number;
    }>;
}
export interface ProcessAPI {
    spawn(command: string, args: string[], options?: {
        cwd?: string;
        env?: Record<string, string>;
    }): Promise<{
        pid: string;
        output: AsyncIterableIterator<string>;
    }>;
    kill(pid: string): Promise<void>;
    exec(command: string, options?: {
        cwd?: string;
        env?: Record<string, string>;
    }): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }>;
}
export declare class ContainerProxy extends EventEmitter {
    private docker;
    private sessions;
    private redis?;
    private config;
    private cleanupInterval?;
    constructor(config?: ContainerProxyConfig);
    /**
     * Create a new container session
     */
    createSession(template?: string, userId?: string): Promise<string>;
    /**
     * Create a Docker container for the session
     */
    private createDockerContainer;
    /**
     * Get Docker image for template
     */
    private getImageForTemplate;
    /**
     * Pull Docker image if not present
     */
    private pullImageIfNeeded;
    /**
     * Get filesystem API for a session
     */
    getFileSystem(sessionId: string): FileSystemAPI;
    /**
     * Get process API for a session
     */
    getProcess(sessionId: string): ProcessAPI;
    /**
     * Terminate a container session
     */
    terminateSession(sessionId: string): Promise<void>;
    /**
     * Get session info
     */
    getSession(sessionId: string): ContainerSession | undefined;
    /**
     * List all sessions
     */
    listSessions(): ContainerSession[];
    /**
     * Parse memory limit string to bytes
     */
    private parseMemoryLimit;
    /**
     * Convert stream to string
     */
    private streamToString;
    /**
     * Save session to Redis
     */
    private saveSessionToRedis;
    /**
     * Restore sessions from Redis
     */
    private restoreSessionsFromRedis;
    /**
     * Start cleanup interval
     */
    private startCleanupInterval;
    /**
     * Cleanup resources
     */
    destroy(): Promise<void>;
}
export declare const containerProxy: ContainerProxy;
//# sourceMappingURL=containerProxy.d.ts.map