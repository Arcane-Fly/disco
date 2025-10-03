import { ContainerSession } from '../types/index.js';
/**
 * Redis session manager for persistent container sessions
 */
declare class RedisSessionManager {
    private client;
    private connected;
    private readonly keyPrefix;
    private readonly sessionExpiry;
    constructor();
    /**
     * Initialize Redis connection
     */
    private initializeRedis;
    /**
     * Check if Redis is available
     */
    isAvailable(): boolean;
    /**
     * Store session in Redis
     */
    setSession(sessionId: string, session: ContainerSession): Promise<void>;
    /**
     * Get session from Redis
     */
    getSession(sessionId: string): Promise<Partial<ContainerSession> | null>;
    /**
     * Update session last active time
     */
    updateLastActive(sessionId: string): Promise<void>;
    /**
     * Delete session from Redis
     */
    deleteSession(sessionId: string): Promise<void>;
    /**
     * Get all sessions for a user
     */
    getUserSessions(userId: string): Promise<string[]>;
    /**
     * Get all active sessions
     */
    getAllSessions(): Promise<string[]>;
    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Get Redis statistics
     */
    getStats(): Promise<{
        connected: boolean;
        totalSessions: number;
        error: string;
        redisUrl?: undefined;
    } | {
        connected: boolean;
        totalSessions: number;
        redisUrl: string;
        error?: undefined;
    }>;
    /**
     * Generic set method for any key-value storage
     */
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    /**
     * Generic get method for any key
     */
    get(key: string): Promise<string | null>;
    /**
     * Add member to a set
     */
    sAdd(key: string, member: string): Promise<void>;
    /**
     * Get all members of a set
     */
    sMembers(key: string): Promise<string[]>;
    /**
     * Remove member from a set
     */
    sRem(key: string, member: string): Promise<void>;
    /**
     * Check if Redis is connected
     */
    isConnected(): boolean;
    /**
     * Close Redis connection
     */
    shutdown(): Promise<void>;
}
export declare const redisSessionManager: RedisSessionManager;
export {};
//# sourceMappingURL=redisSession.d.ts.map