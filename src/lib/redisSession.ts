import { createClient, RedisClientType } from 'redis';
import { ContainerSession } from '../types/index.js';

/**
 * Redis session manager for persistent container sessions
 */
class RedisSessionManager {
  private client: RedisClientType | null = null;
  private connected = false;
  private readonly keyPrefix = 'mcp:session:';
  private readonly sessionExpiry = 30 * 60; // 30 minutes in seconds

  constructor() {
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.log('📝 Redis URL not configured, using in-memory sessions');
      return;
    }

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500)
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('📡 Redis connected');
        this.connected = true;
      });

      this.client.on('disconnect', () => {
        console.log('📡 Redis disconnected');
        this.connected = false;
      });

      await this.client.connect();
      
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      this.client = null;
      this.connected = false;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.connected && this.client !== null;
  }

  /**
   * Store session in Redis
   */
  async setSession(sessionId: string, session: ContainerSession): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Redis not available for session storage');
    }

    try {
      const key = this.keyPrefix + sessionId;
      const sessionData = {
        id: session.id,
        userId: session.userId,
        createdAt: session.createdAt.toISOString(),
        lastActive: session.lastActive.toISOString(),
        status: session.status,
        url: session.url
        // Note: We don't serialize the WebContainer instance
      };

      await this.client!.setEx(key, this.sessionExpiry, JSON.stringify(sessionData));
      
    } catch (error) {
      console.error('Failed to store session in Redis:', error);
      throw error;
    }
  }

  /**
   * Get session from Redis
   */
  async getSession(sessionId: string): Promise<Partial<ContainerSession> | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const key = this.keyPrefix + sessionId;
      const sessionData = await this.client!.get(key);
      
      if (!sessionData) {
        return null;
      }

      const parsed = JSON.parse(sessionData);
      return {
        id: parsed.id,
        userId: parsed.userId,
        createdAt: new Date(parsed.createdAt),
        lastActive: new Date(parsed.lastActive),
        status: parsed.status,
        url: parsed.url
      };
      
    } catch (error) {
      console.error('Failed to get session from Redis:', error);
      return null;
    }
  }

  /**
   * Update session last active time
   */
  async updateLastActive(sessionId: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const session = await this.getSession(sessionId);
      if (session) {
        session.lastActive = new Date();
        await this.setSession(sessionId, session as ContainerSession);
      }
    } catch (error) {
      console.error('Failed to update session last active:', error);
    }
  }

  /**
   * Delete session from Redis
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const key = this.keyPrefix + sessionId;
      await this.client!.del(key);
    } catch (error) {
      console.error('Failed to delete session from Redis:', error);
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const pattern = this.keyPrefix + '*';
      const keys = await this.client!.keys(pattern);
      const userSessions: string[] = [];

      for (const key of keys) {
        const sessionData = await this.client!.get(key);
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          if (parsed.userId === userId) {
            userSessions.push(parsed.id);
          }
        }
      }

      return userSessions;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Get all active sessions
   */
  async getAllSessions(): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const pattern = this.keyPrefix + '*';
      const keys = await this.client!.keys(pattern);
      return keys.map(key => key.replace(this.keyPrefix, ''));
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const pattern = this.keyPrefix + '*';
      const keys = await this.client!.keys(pattern);
      let cleanedCount = 0;

      const now = new Date();
      const maxInactiveMs = 30 * 60 * 1000; // 30 minutes

      for (const key of keys) {
        const sessionData = await this.client!.get(key);
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          const lastActive = new Date(parsed.lastActive);
          const inactiveMs = now.getTime() - lastActive.getTime();

          if (inactiveMs > maxInactiveMs) {
            await this.client!.del(key);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired Redis sessions`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get Redis statistics
   */
  async getStats() {
    if (!this.isAvailable()) {
      return {
        connected: false,
        totalSessions: 0,
        error: 'Redis not available'
      };
    }

    try {
      const pattern = this.keyPrefix + '*';
      const keys = await this.client!.keys(pattern);
      
      return {
        connected: true,
        totalSessions: keys.length,
        redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured'
      };
    } catch (error) {
      return {
        connected: false,
        totalSessions: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generic set method for any key-value storage
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.connected || !this.client) return;
    
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Error setting Redis key:', error);
    }
  }

  /**
   * Generic get method for any key
   */
  async get(key: string): Promise<string | null> {
    if (!this.connected || !this.client) return null;
    
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Error getting Redis key:', error);
      return null;
    }
  }

  /**
   * Add member to a set
   */
  async sAdd(key: string, member: string): Promise<void> {
    if (!this.connected || !this.client) return;
    
    try {
      await this.client.sAdd(key, member);
    } catch (error) {
      console.error('Error adding to Redis set:', error);
    }
  }

  /**
   * Get all members of a set
   */
  async sMembers(key: string): Promise<string[]> {
    if (!this.connected || !this.client) return [];
    
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      console.error('Error getting Redis set members:', error);
      return [];
    }
  }

  /**
   * Remove member from a set
   */
  async sRem(key: string, member: string): Promise<void> {
    if (!this.connected || !this.client) return;
    
    try {
      await this.client.sRem(key, member);
    } catch (error) {
      console.error('Error removing from Redis set:', error);
    }
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Close Redis connection
   */
  async shutdown(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('✅ Redis connection closed');
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }
  }
}

// Create singleton instance
export const redisSessionManager = new RedisSessionManager();