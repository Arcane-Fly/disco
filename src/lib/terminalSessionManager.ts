import { v4 as uuidv4 } from 'uuid';
import { TerminalSession, TerminalHistoryEntry, TerminalSessionRequest, TerminalSessionResponse } from '../types/index.js';
import { redisSessionManager } from './redisSession.js';

/**
 * Terminal Session Manager for persistent terminal sessions across reconnections
 * 
 * Features:
 * - Session persistence across reconnections
 * - Command history storage and retrieval
 * - Working directory persistence
 * - Environment variable preservation
 * - Multi-terminal support per container
 */
class TerminalSessionManager {
  private sessions: Map<string, TerminalSession> = new Map();
  private readonly SESSION_TIMEOUT_MINUTES = 60; // Sessions expire after 1 hour of inactivity
  private readonly MAX_HISTORY_ENTRIES = 1000; // Maximum command history per session
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Start cleanup interval (check every 10 minutes)
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 10 * 60 * 1000);
    console.log('🖥️  Terminal Session Manager initialized');
  }

  /**
   * Create a new terminal session or resume an existing one
   */
  async createOrResumeSession(request: TerminalSessionRequest): Promise<TerminalSessionResponse> {
    const { containerId, sessionId, cwd = '/tmp', env = {} } = request;

    // If sessionId is provided, try to resume existing session
    if (sessionId) {
      const existingSession = await this.getSession(sessionId);
      if (existingSession && existingSession.containerId === containerId) {
        existingSession.lastActive = new Date();
        existingSession.status = 'active';
        await this.saveSession(existingSession);
        
        console.log(`🔄 Resumed terminal session ${sessionId} for container ${containerId}`);
        
        return {
          sessionId: existingSession.id,
          status: 'resumed',
          cwd: existingSession.cwd,
          env: existingSession.env,
          history: existingSession.history.slice(-50) // Return last 50 commands
        };
      }
    }

    // Create new session
    const newSessionId = uuidv4();
    const newSession: TerminalSession = {
      id: newSessionId,
      containerId,
      userId: '', // Will be set by the caller
      createdAt: new Date(),
      lastActive: new Date(),
      cwd,
      env: { 
        ...Object.fromEntries(
          Object.entries(process.env).filter(([_, value]) => value !== undefined)
        ) as Record<string, string>, 
        ...env 
      }, // Merge with process env
      history: [],
      status: 'active',
      processIds: []
    };

    this.sessions.set(newSessionId, newSession);
    await this.saveSession(newSession);

    console.log(`✨ Created new terminal session ${newSessionId} for container ${containerId}`);

    return {
      sessionId: newSessionId,
      status: 'created',
      cwd: newSession.cwd,
      env: newSession.env,
      history: []
    };
  }

  /**
   * Get a terminal session by ID
   */
  async getSession(sessionId: string): Promise<TerminalSession | null> {
    // First try in-memory cache
    let session = this.sessions.get(sessionId);
    
    // If not in memory, try to restore from Redis
    if (!session) {
      const restoredSession = await this.restoreSession(sessionId);
      if (restoredSession) {
        session = restoredSession;
        this.sessions.set(sessionId, session);
      }
    }

    return session || null;
  }

  /**
   * Add a command to session history
   */
  async addCommandToHistory(
    sessionId: string, 
    command: string, 
    output: string, 
    exitCode: number, 
    duration: number
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      console.warn(`Attempted to add command to non-existent session: ${sessionId}`);
      return;
    }

    const historyEntry: TerminalHistoryEntry = {
      id: uuidv4(),
      command,
      timestamp: new Date(),
      output,
      exitCode,
      duration,
      cwd: session.cwd
    };

    session.history.push(historyEntry);
    session.lastActive = new Date();

    // Limit history size
    if (session.history.length > this.MAX_HISTORY_ENTRIES) {
      session.history = session.history.slice(-this.MAX_HISTORY_ENTRIES);
    }

    await this.saveSession(session);
  }

  /**
   * Update session working directory
   */
  async updateWorkingDirectory(sessionId: string, newCwd: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.cwd = newCwd;
      session.lastActive = new Date();
      await this.saveSession(session);
    }
  }

  /**
   * Update session environment variables
   */
  async updateEnvironment(sessionId: string, env: Record<string, string>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.env = { ...session.env, ...env };
      session.lastActive = new Date();
      await this.saveSession(session);
    }
  }

  /**
   * Get session history with filtering
   */
  async getSessionHistory(
    sessionId: string, 
    limit: number = 50, 
    search?: string
  ): Promise<TerminalHistoryEntry[]> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return [];
    }

    let history = session.history;

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      history = history.filter(entry => 
        entry.command.toLowerCase().includes(searchLower) ||
        entry.output.toLowerCase().includes(searchLower)
      );
    }

    // Return most recent entries first
    return history.slice(-limit).reverse();
  }

  /**
   * List all active sessions for a container
   */
  async getContainerSessions(containerId: string): Promise<TerminalSession[]> {
    const sessions = Array.from(this.sessions.values()).filter(
      session => session.containerId === containerId && session.status === 'active'
    );

    // Also check Redis for sessions not in memory
    const redisSessionIds = await this.getRedisSessionIds(containerId);
    for (const sessionId of redisSessionIds) {
      if (!this.sessions.has(sessionId)) {
        const session = await this.restoreSession(sessionId);
        if (session && session.status === 'active') {
          sessions.push(session);
          this.sessions.set(sessionId, session);
        }
      }
    }

    return sessions.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
  }

  /**
   * Terminate a terminal session
   */
  async terminateSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.status = 'terminated';
      session.lastActive = new Date();
      await this.saveSession(session);
      
      // Remove from memory cache
      this.sessions.delete(sessionId);
      console.log(`🔒 Terminated terminal session ${sessionId}`);
    }
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const cutoffTime = new Date(Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000);
    let cleanedCount = 0;

    // Clean up in-memory sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActive < cutoffTime) {
        await this.terminateSession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired terminal sessions`);
    }
  }

  /**
   * Save session to Redis for persistence
   */
  private async saveSession(session: TerminalSession): Promise<void> {
    try {
      if (redisSessionManager.isConnected()) {
        const sessionKey = `terminal_session:${session.id}`;
        const containerKey = `container_sessions:${session.containerId}`;
        
        // Save session data
        await redisSessionManager.set(sessionKey, JSON.stringify(session), 60 * 60); // 1 hour TTL
        
        // Add to container session list
        await redisSessionManager.sAdd(containerKey, session.id);
      }
    } catch (error) {
      console.error('Failed to save terminal session to Redis:', error);
      // Continue without Redis - sessions will still work in memory
    }
  }

  /**
   * Restore session from Redis
   */
  private async restoreSession(sessionId: string): Promise<TerminalSession | null> {
    try {
      if (redisSessionManager.isConnected()) {
        const sessionKey = `terminal_session:${sessionId}`;
        const sessionData = await redisSessionManager.get(sessionKey);
        
        if (sessionData) {
          const session = JSON.parse(sessionData);
          // Convert date strings back to Date objects
          session.createdAt = new Date(session.createdAt);
          session.lastActive = new Date(session.lastActive);
          session.history = session.history.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
          
          console.log(`🔄 Restored terminal session ${sessionId} from Redis`);
          return session;
        }
      }
    } catch (error) {
      console.error('Failed to restore terminal session from Redis:', error);
    }
    
    return null;
  }

  /**
   * Get session IDs for a container from Redis
   */
  private async getRedisSessionIds(containerId: string): Promise<string[]> {
    try {
      if (redisSessionManager.isConnected()) {
        const containerKey = `container_sessions:${containerId}`;
        return await redisSessionManager.sMembers(containerKey);
      }
    } catch (error) {
      console.error('Failed to get container sessions from Redis:', error);
    }
    
    return [];
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Save all active sessions to Redis
    for (const session of this.sessions.values()) {
      if (session.status === 'active') {
        session.status = 'suspended';
        await this.saveSession(session);
      }
    }
    
    console.log('🛑 Terminal Session Manager shutdown complete');
  }
}

// Export singleton instance
export const terminalSessionManager = new TerminalSessionManager();