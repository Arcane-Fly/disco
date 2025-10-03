import { Server as SocketIOServer } from 'socket.io';
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
    locks: Map<string, {
        userId: string;
        timestamp: Date;
    }>;
    baseContent?: string;
    history: Array<{
        version: number;
        content: string;
        userId: string;
        timestamp: Date;
        operation: 'create' | 'update' | 'merge' | 'conflict-resolution';
    }>;
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
    strategy: 'last-write-wins' | 'merge' | 'manual' | 'smart-merge' | 'semantic-merge';
    resolvedContent: string;
    conflictedSections?: Array<{
        start: number;
        end: number;
        versions: string[];
        resolution?: 'auto' | 'manual';
        confidence?: number;
    }>;
    metadata?: {
        conflictType: 'textual' | 'semantic' | 'structural';
        severity: 'low' | 'medium' | 'high';
        autoResolved: boolean;
        userId: string;
        timestamp: Date;
    };
}
declare class CollaborationManager {
    private io;
    private sessions;
    private userSessions;
    private socketUsers;
    constructor(io: SocketIOServer);
    private setupWebSocketHandlers;
    private handleJoinCollaboration;
    private handleLeaveCollaboration;
    private handleFileUpdate;
    private handleFileLock;
    private handleCursorPosition;
    private handleManualConflictResolution;
    private handleGetFileHistory;
    private handleDisconnect;
    private resolveAdvancedConflict;
    private findSessionKey;
    getActiveCollaborations(containerId: string): CollaborationSession[];
    getSessionUsers(sessionId: string): string[];
    broadcastSystemMessage(containerId: string, message: string): void;
    syncFileToCollaborators(containerId: string, filePath: string, content: string, excludeUserId?: string): Promise<void>;
    getSessionHistory(sessionId: string, limit?: number): any[];
    resolveManualConflict(sessionId: string, resolvedContent: string, strategy: string, userId: string): Promise<{
        version: number;
        timestamp: Date;
    }>;
}
export { CollaborationManager };
export declare let collaborationManager: CollaborationManager;
export declare const initializeCollaborationManager: (io: SocketIOServer) => CollaborationManager;
//# sourceMappingURL=collaborationManager.d.ts.map