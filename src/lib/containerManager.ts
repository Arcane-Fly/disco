import { v4 as uuidv4 } from 'uuid';
import { ContainerSession } from '../types/index.js';
import { redisSessionManager } from './redisSession.js';
import { containerProxy } from './containerProxy.js';
import CircuitBreaker from 'opossum';

// Environment detection
const isServerEnvironment = typeof window === 'undefined';
const isBrowserEnvironment = typeof window !== 'undefined';

// Dynamic import for WebContainer to prevent server-side issues
let WebContainer: any = null;
if (isBrowserEnvironment) {
  // Only import WebContainer in browser environments
  import('@webcontainer/api').then(module => {
    WebContainer = module.WebContainer;
  }).catch(error => {
    console.warn('Failed to load WebContainer API:', error);
  });
}

interface ContainerPool {
  ready: any[]; // Changed from WebContainer[] to any[] for flexibility
  initializing: Promise<any>[];
}

class ContainerManager {
  private sessions: Map<string, ContainerSession> = new Map();
  private pool: ContainerPool = { ready: [], initializing: [] };
  private cleanupInterval: NodeJS.Timeout;
  private readonly maxInactiveMinutes: number;
  private readonly maxContainers: number;
  private readonly poolSize: number;
  private circuitBreaker: CircuitBreaker<[string], ContainerSession>;

  constructor(
    maxInactiveMinutes: number = parseInt(process.env.CONTAINER_TIMEOUT_MINUTES || "15", 10),
    maxContainers: number = parseInt(process.env.MAX_CONTAINERS || "20", 10),
    poolSize: number = parseInt(process.env.POOL_SIZE || "3", 10)
  ) {
    this.maxInactiveMinutes = maxInactiveMinutes;
    this.maxContainers = maxContainers;
    this.poolSize = poolSize;
    
    // Initialize circuit breaker for container creation
    this.circuitBreaker = new CircuitBreaker(this.createSessionInternal.bind(this), {
      timeout: 30000, // 30 second timeout
      errorThresholdPercentage: 50, // Trip if 50% of requests fail
      resetTimeout: 60000, // Try again after 1 minute
      volumeThreshold: 10, // Minimum 10 requests before considering trips
      capacitor: 10 // Number of recent requests to consider
    });
    
    this.circuitBreaker.on('open', () => {
      console.warn('⚠️ Container creation circuit breaker opened - too many failures');
    });
    
    this.circuitBreaker.on('halfOpen', () => {
      console.log('🔄 Container creation circuit breaker trying to close');
    });
    
    this.circuitBreaker.on('close', () => {
      console.log('✅ Container creation circuit breaker closed - service recovered');
    });
    
    // Start cleanup interval (check every 5 minutes)
    this.cleanupInterval = setInterval(() => this.cleanupInactive(), 5 * 60 * 1000);
    
    // Only pre-warm container pool in browser environments
    if (isBrowserEnvironment) {
      this.preWarmPool();
      console.log('🏗️  Container Manager initialized with WebContainer support');
    } else {
      console.log('🏗️  Container Manager initialized (server mode - WebContainer disabled)');
    }
  }

  /**
   * Create a new container session for a user
   */
  async createSession(userId: string): Promise<ContainerSession> {
    return this.circuitBreaker.fire(userId);
  }

  /**
   * Internal method for creating container sessions (used by circuit breaker)
   */
  private async createSessionInternal(userId: string): Promise<ContainerSession> {
    try {
      // Use Docker proxy in server environment
      if (isServerEnvironment) {
        const sessionId = await containerProxy.createSession('node', userId);
        const proxySession = containerProxy.getSession(sessionId);
        if (!proxySession) {
          throw new Error('Failed to create container session');
        }
        
        // Convert proxy session to ContainerSession format
        const session: ContainerSession = {
          id: sessionId,
          userId: userId || '',
          container: null, // No WebContainer in server mode
          createdAt: proxySession.createdAt,
          lastActive: proxySession.lastActivity,
          status: proxySession.status === 'running' ? 'ready' : proxySession.status as any
        };
        
        this.sessions.set(sessionId, session);
        
        // Store in Redis if available
        if (redisSessionManager.isAvailable()) {
          await redisSessionManager.setSession(sessionId, session);
        }
        
        console.log(`📦 Created Docker container session: ${sessionId} for user: ${userId}`);
        return session;
      }

      if (!WebContainer) {
        throw new Error('WebContainer API not loaded. Ensure you are in a browser environment.');
      }

      // Check if user has reached container limit
      const userContainers = this.getUserContainers(userId);
      if (userContainers.length >= 3) { // Max 3 containers per user
        throw new Error('User container limit reached');
      }

      // Check global container limit
      if (this.sessions.size >= this.maxContainers) {
        throw new Error('Global container limit reached');
      }

      const sessionId = `${userId}-${uuidv4()}`;
      
      // Try to get container from pool, otherwise create new one
      const container = await this.getOrCreateContainer();
      
      const session: ContainerSession = {
        id: sessionId,
        userId,
        container,
        createdAt: new Date(),
        lastActive: new Date(),
        status: 'initializing'
      };

      this.sessions.set(sessionId, session);
      
      // Store in Redis if available
      if (redisSessionManager.isAvailable()) {
        await redisSessionManager.setSession(sessionId, session);
      }
      
      // Initialize container environment
      await this.initializeContainer(session);
      
      console.log(`📦 Created container session: ${sessionId} for user: ${userId}`);
      return session;
      
    } catch (error) {
      console.error('Failed to create container session:', error);
      throw new Error(`Failed to create container: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get container session by ID (checks Redis first, then in-memory)
   */
  async getSession(sessionId: string): Promise<ContainerSession | undefined> {
    // First check in-memory cache
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.lastActive = new Date();
      
      // Update in Redis if available
      if (redisSessionManager.isAvailable()) {
        await redisSessionManager.setSession(sessionId, session);
      }
      
      return session;
    }
    
    // If not in memory, check Redis
    if (redisSessionManager.isAvailable()) {
      const redisSession = await redisSessionManager.getSession(sessionId);
      if (redisSession && redisSession.userId) {
        // Session found in Redis but not in memory - this means the container was lost
        // We need to recreate the container or mark session as invalid
        console.log(`🔄 Found session ${sessionId} in Redis but container not in memory`);
        // For now, return undefined to force session recreation
        return undefined;
      }
    }
    
    return undefined;
  }

  /**
   * Get all sessions for a user
   */
  getUserContainers(userId: string): ContainerSession[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  /**
   * Terminate a container session
   */
  async terminateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Teardown WebContainer
      await session.container.teardown();
      
      // Remove from sessions
      this.sessions.delete(sessionId);
      
      // Remove from Redis if available
      if (redisSessionManager.isAvailable()) {
        await redisSessionManager.deleteSession(sessionId);
      }
      
      console.log(`🗑️  Terminated container session: ${sessionId}`);
    } catch (error) {
      console.error(`Failed to terminate session ${sessionId}:`, error);
      // Remove from sessions even if teardown failed
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Get or create a WebContainer from pool
   */
  private async getOrCreateContainer(): Promise<any> {
    if (isServerEnvironment || !WebContainer) {
      throw new Error('WebContainer not available in server environment');
    }

    // Try to get from ready pool
    if (this.pool.ready.length > 0) {
      const container = this.pool.ready.pop()!;
      console.log('📦 Using container from pool');
      return container;
    }

    // Wait for an initializing container if available
    if (this.pool.initializing.length > 0) {
      console.log('⏳ Waiting for container to initialize...');
      return await this.pool.initializing.shift()!;
    }

    // Create new container
    console.log('🔧 Creating new WebContainer...');
    return await this.createWebContainer();
  }

  /**
   * Create a new WebContainer instance
   */
  private async createWebContainer(): Promise<any> {
    if (isServerEnvironment || !WebContainer) {
      throw new Error('WebContainer not available in server environment');
    }

    try {
      const container = await WebContainer.boot();
      console.log('✅ WebContainer created successfully');
      return container;
    } catch (error) {
      console.error('❌ Failed to create WebContainer:', error);
      throw new Error(`WebContainer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize container with basic environment
   */
  private async initializeContainer(session: ContainerSession): Promise<void> {
    try {
      const { container } = session;
      
      // Set up basic file structure
      await container.mount({
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: 'workspace',
              version: '1.0.0',
              type: 'module',
              scripts: {
                dev: 'node server.js'
              }
            }, null, 2)
          }
        },
        'server.js': {
          file: {
            contents: `
console.log('🚀 WebContainer workspace ready!');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
            `.trim()
          }
        }
      });

      // Update session status
      session.status = 'ready';
      session.url = await this.getContainerUrl(session);
      
      console.log(`✅ Container ${session.id} initialized and ready`);
      
    } catch (error) {
      console.error(`Failed to initialize container ${session.id}:`, error);
      session.status = 'error';
      throw error;
    }
  }

  /**
   * Get container URL for access
   */
  private async getContainerUrl(session: ContainerSession): Promise<string> {
    try {
      // This would be implemented based on WebContainer's URL generation
      // For now, return a placeholder
      return `https://webcontainer-${session.id}.localhost:3000`;
    } catch (error) {
      console.error('Failed to get container URL:', error);
      return '';
    }
  }

  /**
   * Pre-warm container pool
   */
  private async preWarmPool(): Promise<void> {
    if (isServerEnvironment || !WebContainer) {
      console.log('📝 Container pre-warming skipped in server environment');
      return;
    }

    console.log(`🔥 Pre-warming container pool with ${this.poolSize} containers...`);
    
    for (let i = 0; i < this.poolSize; i++) {
      const containerPromise = this.createWebContainer();
      this.pool.initializing.push(containerPromise);
      
      containerPromise
        .then(container => {
          this.pool.ready.push(container);
          console.log(`✅ Pool container ${i + 1}/${this.poolSize} ready`);
        })
        .catch(error => {
          console.error(`❌ Failed to pre-warm container ${i + 1}:`, error);
        })
        .finally(() => {
          // Remove from initializing array
          const index = this.pool.initializing.indexOf(containerPromise);
          if (index > -1) {
            this.pool.initializing.splice(index, 1);
          }
        });
    }
  }

  /**
   * Clean up inactive containers
   */
  private async cleanupInactive(): Promise<void> {
    const now = new Date();
    const sessionsToCleanup: string[] = [];
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const memoryThreshold = parseInt(process.env.MEMORY_THRESHOLD || "75", 10);
    
    // If memory usage is high, be more aggressive with cleanup
    const effectiveMaxInactiveMinutes = memoryPercentage > memoryThreshold 
      ? Math.max(5, this.maxInactiveMinutes * 0.5)  // Clean up after half the time if memory is high
      : this.maxInactiveMinutes;

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveMinutes = (now.getTime() - session.lastActive.getTime()) / (1000 * 60);
      
      if (inactiveMinutes > effectiveMaxInactiveMinutes) {
        sessionsToCleanup.push(sessionId);
      }
    }

    // If we're still over memory threshold, clean up the oldest sessions regardless of time
    if (memoryPercentage > memoryThreshold && sessionsToCleanup.length === 0) {
      const sortedSessions = Array.from(this.sessions.entries())
        .sort(([,a], [,b]) => a.lastActive.getTime() - b.lastActive.getTime());
      
      // Clean up oldest 25% of sessions if memory is critical
      const sessionsToRemove = Math.ceil(sortedSessions.length * 0.25);
      for (let i = 0; i < sessionsToRemove && i < sortedSessions.length; i++) {
        sessionsToCleanup.push(sortedSessions[i][0]);
      }
      
      if (sessionsToCleanup.length > 0) {
        console.warn(`⚠️ High memory usage (${memoryPercentage.toFixed(1)}%), force-cleaning ${sessionsToCleanup.length} oldest sessions`);
      }
    }

    if (sessionsToCleanup.length > 0) {
      console.log(`🧹 Cleaning up ${sessionsToCleanup.length} inactive containers (memory: ${memoryPercentage.toFixed(1)}%)`);
      
      for (const sessionId of sessionsToCleanup) {
        try {
          await this.terminateSession(sessionId);
        } catch (error) {
          console.error(`Failed to cleanup session ${sessionId}:`, error);
        }
      }
      
      // Trigger garbage collection if available
      if (global.gc && memoryPercentage > memoryThreshold) {
        global.gc();
        console.log('🗑️ Triggered garbage collection due to high memory usage');
      }
    }

    console.log(`📊 Active containers: ${this.sessions.size}/${this.maxContainers} (Memory: ${memoryPercentage.toFixed(1)}%)`);
  }

  /**
   * Get container statistics
   */
  getStats() {
    const stats = {
      activeSessions: this.sessions.size,
      maxContainers: this.maxContainers,
      poolReady: this.pool.ready.length,
      poolInitializing: this.pool.initializing.length,
      webContainerAvailable: isBrowserEnvironment && !!WebContainer,
      environment: isServerEnvironment ? 'server' : 'browser',
      sessionsByUser: {} as Record<string, number>
    };

    // Count sessions by user
    for (const session of this.sessions.values()) {
      stats.sessionsByUser[session.userId] = (stats.sessionsByUser[session.userId] || 0) + 1;
    }

    return stats;
  }

  /**
   * Check if container functionality is available
   */
  isContainerAvailable(): boolean {
    return isBrowserEnvironment && !!WebContainer;
  }

  /**
   * Get environment info
   */
  getEnvironmentInfo() {
    return {
      environment: isServerEnvironment ? 'server' : 'browser',
      webContainerSupported: !isServerEnvironment,
      webContainerLoaded: !!WebContainer,
      containerFunctionalityAvailable: this.isContainerAvailable()
    };
  }

  /**
   * Shutdown container manager
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Container Manager...');
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Terminate all sessions
    const sessionIds = Array.from(this.sessions.keys());
    for (const sessionId of sessionIds) {
      try {
        await this.terminateSession(sessionId);
      } catch (error) {
        console.error(`Failed to terminate session ${sessionId} during shutdown:`, error);
      }
    }

    // Cleanup pool containers
    for (const container of this.pool.ready) {
      try {
        await container.teardown();
      } catch (error) {
        console.error('Failed to teardown pool container:', error);
      }
    }

    // Wait for initializing containers and cleanup
    for (const containerPromise of this.pool.initializing) {
      try {
        const container = await containerPromise;
        await container.teardown();
      } catch (error) {
        console.error('Failed to teardown initializing container:', error);
      }
    }

    this.sessions.clear();
    this.pool.ready = [];
    this.pool.initializing = [];
    
    console.log('✅ Container Manager shutdown complete');
  }
}

// Create singleton instance
export const containerManager = new ContainerManager();