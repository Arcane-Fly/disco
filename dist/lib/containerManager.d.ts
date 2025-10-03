import { ContainerSession } from '../types/index.js';
declare class ContainerManager {
    private sessions;
    private pool;
    private cleanupInterval;
    private readonly maxInactiveMinutes;
    private readonly maxContainers;
    private readonly poolSize;
    constructor(maxInactiveMinutes?: number, maxContainers?: number, poolSize?: number);
    /**
     * Create a new container session for a user
     */
    createSession(userId: string): Promise<ContainerSession>;
    /**
     * Get container session by ID (checks Redis first, then in-memory)
     */
    getSession(sessionId: string): Promise<ContainerSession | undefined>;
    /**
     * Get all sessions for a user
     */
    getUserContainers(userId: string): ContainerSession[];
    /**
     * Terminate a container session
     */
    terminateSession(sessionId: string): Promise<void>;
    /**
     * Get or create a WebContainer from pool
     */
    private getOrCreateContainer;
    /**
     * Create a new WebContainer instance
     */
    private createWebContainer;
    /**
     * Initialize container with basic environment
     */
    private initializeContainer;
    /**
     * Get container URL for access
     */
    private getContainerUrl;
    /**
     * Pre-warm container pool
     */
    private preWarmPool;
    /**
     * Clean up inactive containers
     */
    private cleanupInactive;
    /**
     * Get container statistics
     */
    getStats(): {
        activeSessions: number;
        maxContainers: number;
        poolReady: number;
        poolInitializing: number;
        webContainerAvailable: boolean;
        environment: string;
        sessionsByUser: Record<string, number>;
    };
    /**
     * Check if container functionality is available
     */
    isContainerAvailable(): boolean;
    /**
     * Get environment info
     */
    getEnvironmentInfo(): {
        environment: string;
        webContainerSupported: boolean;
        webContainerLoaded: boolean;
        containerFunctionalityAvailable: boolean;
    };
    /**
     * Shutdown container manager
     */
    shutdown(): Promise<void>;
}
export declare const containerManager: ContainerManager;
export {};
//# sourceMappingURL=containerManager.d.ts.map