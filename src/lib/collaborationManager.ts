import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

/**
 * Real-time Collaboration Manager
 * Implements WebSocket-based real-time sync and multi-user editing support
 */

export interface CollaborationSession {
  id: string;
  containerId: string;
  filePath: string;
  users: Set<string>;
  lastModified: Date;
  content: string;
  version: number;
  locks: Map<string, { userId: string; timestamp: Date }>;
}

export interface FileOperation {
  type: 'create' | 'update' | 'delete' | 'lock' | 'unlock';
  filePath: string;
  content?: string;
  userId: string;
  timestamp: Date;
  version: number;
  containerId: string;
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'merge' | 'manual';
  resolvedContent: string;
  conflictedSections?: Array<{
    start: number;
    end: number;
    versions: string[];
  }>;
}

class CollaborationManager {
  private io: SocketIOServer;
  private sessions: Map<string, CollaborationSession> = new Map();
  private userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('🤝 Collaboration client connected:', socket.id);

      // Join collaboration session
      socket.on('join-collaboration', async (data: { 
        containerId: string; 
        filePath: string; 
        userId: string 
      }) => {
        await this.handleJoinCollaboration(socket, data);
      });

      // Leave collaboration session
      socket.on('leave-collaboration', async (data: { sessionId: string; userId: string }) => {
        await this.handleLeaveCollaboration(socket, data);
      });

      // File content update
      socket.on('file-update', async (data: {
        sessionId: string;
        content: string;
        userId: string;
        version: number;
      }) => {
        await this.handleFileUpdate(socket, data);
      });

      // File lock/unlock
      socket.on('file-lock', async (data: {
        sessionId: string;
        filePath: string;
        userId: string;
        lock: boolean;
      }) => {
        await this.handleFileLock(socket, data);
      });

      // Cursor position sharing
      socket.on('cursor-position', (data: {
        sessionId: string;
        userId: string;
        position: { line: number; column: number };
      }) => {
        this.handleCursorPosition(socket, data);
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async handleJoinCollaboration(socket: Socket, data: {
    containerId: string;
    filePath: string;
    userId: string;
  }) {
    const sessionKey = `${data.containerId}:${data.filePath}`;
    let session = this.sessions.get(sessionKey);

    if (!session) {
      // Create new collaboration session
      session = {
        id: uuidv4(),
        containerId: data.containerId,
        filePath: data.filePath,
        users: new Set(),
        lastModified: new Date(),
        content: '', // Will be loaded from file system
        version: 1,
        locks: new Map()
      };
      this.sessions.set(sessionKey, session);
    }

    // Add user to session
    session.users.add(data.userId);
    this.socketUsers.set(socket.id, data.userId);

    // Track user sessions
    if (!this.userSessions.has(data.userId)) {
      this.userSessions.set(data.userId, new Set());
    }
    this.userSessions.get(data.userId)!.add(session.id);

    // Join socket room
    await socket.join(session.id);

    // Notify other users
    socket.to(session.id).emit('user-joined', {
      userId: data.userId,
      sessionId: session.id,
      userCount: session.users.size
    });

    // Send current state to new user
    socket.emit('collaboration-state', {
      sessionId: session.id,
      content: session.content,
      version: session.version,
      users: Array.from(session.users),
      locks: Object.fromEntries(session.locks)
    });

    console.log(`👥 User ${data.userId} joined collaboration session for ${data.filePath}`);
  }

  private async handleLeaveCollaboration(socket: Socket, data: { sessionId: string; userId: string }) {
    const session = this.sessions.get(this.findSessionKey(data.sessionId));
    if (!session) return;

    // Remove user from session
    session.users.delete(data.userId);
    this.socketUsers.delete(socket.id);

    // Remove user's locks
    for (const [path, lock] of session.locks.entries()) {
      if (lock.userId === data.userId) {
        session.locks.delete(path);
      }
    }

    // Leave socket room
    await socket.leave(data.sessionId);

    // Notify other users
    socket.to(data.sessionId).emit('user-left', {
      userId: data.userId,
      sessionId: data.sessionId,
      userCount: session.users.size
    });

    // Cleanup empty session
    if (session.users.size === 0) {
      this.sessions.delete(this.findSessionKey(data.sessionId));
    }

    console.log(`👋 User ${data.userId} left collaboration session`);
  }

  private async handleFileUpdate(socket: Socket, data: {
    sessionId: string;
    content: string;
    userId: string;
    version: number;
  }) {
    const session = this.sessions.get(this.findSessionKey(data.sessionId));
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // Version conflict detection
    if (data.version !== session.version) {
      const resolution = await this.resolveConflict(session, data.content, data.userId);
      socket.emit('conflict-detected', {
        sessionId: data.sessionId,
        resolution,
        currentVersion: session.version
      });
      return;
    }

    // Update session
    session.content = data.content;
    session.version += 1;
    session.lastModified = new Date();

    // Broadcast to other users
    socket.to(data.sessionId).emit('file-updated', {
      content: data.content,
      version: session.version,
      userId: data.userId,
      timestamp: session.lastModified
    });

    console.log(`📝 File updated by ${data.userId} in session ${data.sessionId}`);
  }

  private async handleFileLock(socket: Socket, data: {
    sessionId: string;
    filePath: string;
    userId: string;
    lock: boolean;
  }) {
    const session = this.sessions.get(this.findSessionKey(data.sessionId));
    if (!session) return;

    if (data.lock) {
      // Check if already locked by another user
      const existingLock = session.locks.get(data.filePath);
      if (existingLock && existingLock.userId !== data.userId) {
        socket.emit('lock-failed', {
          filePath: data.filePath,
          lockedBy: existingLock.userId
        });
        return;
      }

      // Set lock
      session.locks.set(data.filePath, {
        userId: data.userId,
        timestamp: new Date()
      });
    } else {
      // Remove lock
      session.locks.delete(data.filePath);
    }

    // Broadcast lock state
    this.io.to(data.sessionId).emit('file-lock-changed', {
      filePath: data.filePath,
      locked: data.lock,
      userId: data.userId
    });
  }

  private handleCursorPosition(socket: Socket, data: {
    sessionId: string;
    userId: string;
    position: { line: number; column: number };
  }) {
    // Broadcast cursor position to other users
    socket.to(data.sessionId).emit('cursor-moved', {
      userId: data.userId,
      position: data.position
    });
  }

  private handleDisconnect(socket: Socket) {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    console.log(`🔌 Collaboration client disconnected: ${socket.id} (${userId})`);

    // Find and leave all sessions for this user
    const userSessionIds = this.userSessions.get(userId);
    if (userSessionIds) {
      for (const sessionId of userSessionIds) {
        this.handleLeaveCollaboration(socket, { sessionId, userId });
      }
      this.userSessions.delete(userId);
    }

    this.socketUsers.delete(socket.id);
  }

  private async resolveConflict(
    session: CollaborationSession,
    newContent: string,
    userId: string
  ): Promise<ConflictResolution> {
    // Simple last-write-wins strategy for now
    // TODO: Implement more sophisticated conflict resolution
    return {
      strategy: 'last-write-wins',
      resolvedContent: newContent,
      conflictedSections: []
    };
  }

  private findSessionKey(sessionId: string): string {
    for (const [key, session] of this.sessions.entries()) {
      if (session.id === sessionId) {
        return key;
      }
    }
    return '';
  }

  // Public API methods
  public getActiveCollaborations(containerId: string): CollaborationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.containerId === containerId);
  }

  public getSessionUsers(sessionId: string): string[] {
    const session = this.sessions.get(this.findSessionKey(sessionId));
    return session ? Array.from(session.users) : [];
  }

  public broadcastSystemMessage(containerId: string, message: string) {
    const sessions = this.getActiveCollaborations(containerId);
    sessions.forEach(session => {
      this.io.to(session.id).emit('system-message', {
        message,
        timestamp: new Date()
      });
    });
  }

  public async syncFileToCollaborators(
    containerId: string,
    filePath: string,
    content: string,
    excludeUserId?: string
  ) {
    const sessionKey = `${containerId}:${filePath}`;
    const session = this.sessions.get(sessionKey);
    
    if (session) {
      session.content = content;
      session.version += 1;
      session.lastModified = new Date();

      // Broadcast to all users except the one who made the change
      this.io.to(session.id).emit('external-file-update', {
        content,
        version: session.version,
        filePath,
        excludeUserId
      });
    }
  }
}

export { CollaborationManager };
export let collaborationManager: CollaborationManager;

export const initializeCollaborationManager = (io: SocketIOServer) => {
  collaborationManager = new CollaborationManager(io);
  return collaborationManager;
};