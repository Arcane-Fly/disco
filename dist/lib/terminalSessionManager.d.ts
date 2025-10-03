import { TerminalSession, TerminalHistoryEntry, TerminalSessionRequest, TerminalSessionResponse, TerminalRecording, TerminalEvent } from '../types/index.js';
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
declare class TerminalSessionManager {
    private sessions;
    private readonly SESSION_TIMEOUT_MINUTES;
    private readonly MAX_HISTORY_ENTRIES;
    private cleanupInterval;
    constructor();
    /**
     * Create a new terminal session or resume an existing one
     */
    createOrResumeSession(request: TerminalSessionRequest): Promise<TerminalSessionResponse>;
    /**
     * Get a terminal session by ID
     */
    getSession(sessionId: string): Promise<TerminalSession | null>;
    /**
     * Add a command to session history and recording
     */
    addCommandToHistory(sessionId: string, command: string, output: string, exitCode: number, duration: number): Promise<void>;
    /**
     * Update session working directory
     */
    updateWorkingDirectory(sessionId: string, newCwd: string): Promise<void>;
    /**
     * Update session environment variables
     */
    updateEnvironment(sessionId: string, env: Record<string, string>): Promise<void>;
    /**
     * Get session history with filtering and search
     */
    getSessionHistory(sessionId: string, limit?: number, search?: string, commandsOnly?: boolean): Promise<TerminalHistoryEntry[]>;
    /**
     * Get command suggestions based on history and patterns
     */
    getCommandSuggestions(sessionId: string, partialCommand: string, limit?: number): Promise<string[]>;
    /**
     * Get frequently used commands
     */
    getFrequentCommands(sessionId: string, limit?: number): Promise<Array<{
        command: string;
        count: number;
    }>>;
    /**
     * Start recording a terminal session
     */
    startRecording(sessionId: string): Promise<string>;
    /**
     * Stop recording a terminal session
     */
    stopRecording(sessionId: string): Promise<TerminalRecording | null>;
    /**
     * Add an event to the current recording
     */
    addRecordingEvent(sessionId: string, event: Omit<TerminalEvent, 'timestamp'>): Promise<void>;
    /**
     * Get recording for a session
     */
    getRecording(recordingId: string): Promise<TerminalRecording | null>;
    /**
     * List all recordings for a session
     */
    getSessionRecordings(sessionId: string): Promise<TerminalRecording[]>;
    /**
     * Replay a terminal recording
     */
    replayRecording(recordingId: string, options?: {
        speed?: number;
        skipCommands?: boolean;
        skipOutput?: boolean;
    }): Promise<AsyncIterable<TerminalEvent>>;
    searchCommandHistory(sessionId: string, options: {
        query?: string;
        exitCode?: number;
        dateFrom?: Date;
        dateTo?: Date;
        cwd?: string;
        limit?: number;
    }): Promise<TerminalHistoryEntry[]>;
    /**
     * List all active sessions for a container
     */
    getContainerSessions(containerId: string): Promise<TerminalSession[]>;
    /**
     * Terminate a terminal session
     */
    terminateSession(sessionId: string): Promise<void>;
    /**
     * Clean up expired sessions
     */
    private cleanupExpiredSessions;
    /**
     * Save recording to Redis for persistence
     */
    private saveRecording;
    /**
     * Save session to Redis for persistence
     */
    private saveSession;
    /**
     * Restore session from Redis
     */
    private restoreSession;
    /**
     * Get session IDs for a container from Redis
     */
    private getRedisSessionIds;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}
export declare const terminalSessionManager: TerminalSessionManager;
export {};
//# sourceMappingURL=terminalSessionManager.d.ts.map