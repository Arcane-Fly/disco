import { v4 as uuidv4 } from 'uuid';
import { getStringOrDefault } from './guards.js';
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
    sessions = new Map();
    SESSION_TIMEOUT_MINUTES = 60; // Sessions expire after 1 hour of inactivity
    MAX_HISTORY_ENTRIES = 1000; // Maximum command history per session
    cleanupInterval;
    constructor() {
        // Start cleanup interval (check every 10 minutes) - skip in tests
        if (process.env.NODE_ENV !== 'test') {
            this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 10 * 60 * 1000);
        }
        console.log('🖥️  Terminal Session Manager initialized');
    }
    /**
     * Create a new terminal session or resume an existing one
     */
    async createOrResumeSession(request) {
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
                    history: existingSession.history.slice(-50), // Return last 50 commands
                };
            }
        }
        // Create new session
        const newSessionId = uuidv4();
        const newSession = {
            id: newSessionId,
            containerId,
            userId: '', // Will be set by the caller
            createdAt: new Date(),
            lastActive: new Date(),
            cwd,
            env: {
                ...Object.fromEntries(Object.entries(process.env).filter(([_, value]) => value !== undefined)),
                ...env,
            }, // Merge with process env
            history: [],
            status: 'active',
            processIds: [],
        };
        this.sessions.set(newSessionId, newSession);
        await this.saveSession(newSession);
        console.log(`✨ Created new terminal session ${newSessionId} for container ${containerId}`);
        return {
            sessionId: newSessionId,
            status: 'created',
            cwd: newSession.cwd,
            env: newSession.env,
            history: [],
        };
    }
    /**
     * Get a terminal session by ID
     */
    async getSession(sessionId) {
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
     * Add a command to session history and recording
     */
    async addCommandToHistory(sessionId, command, output, exitCode, duration) {
        const session = await this.getSession(sessionId);
        if (!session) {
            console.warn(`Attempted to add command to non-existent session: ${sessionId}`);
            return;
        }
        const historyEntry = {
            id: uuidv4(),
            command,
            timestamp: new Date(),
            output,
            exitCode,
            duration,
            cwd: session.cwd,
        };
        session.history.push(historyEntry);
        session.lastActive = new Date();
        // Add to recording if active
        if (session.recording) {
            await this.addRecordingEvent(sessionId, {
                type: 'command',
                data: { command, exitCode, duration },
            });
            await this.addRecordingEvent(sessionId, {
                type: 'output',
                data: { output },
            });
        }
        // Limit history size
        if (session.history.length > this.MAX_HISTORY_ENTRIES) {
            session.history = session.history.slice(-this.MAX_HISTORY_ENTRIES);
        }
        await this.saveSession(session);
    }
    /**
     * Update session working directory
     */
    async updateWorkingDirectory(sessionId, newCwd) {
        const session = await this.getSession(sessionId);
        if (session) {
            const oldCwd = session.cwd;
            session.cwd = newCwd;
            session.lastActive = new Date();
            // Add to recording if active
            if (session.recording && oldCwd !== newCwd) {
                await this.addRecordingEvent(sessionId, {
                    type: 'cwd_change',
                    data: { cwd: newCwd },
                });
            }
            await this.saveSession(session);
        }
    }
    /**
     * Update session environment variables
     */
    async updateEnvironment(sessionId, env) {
        const session = await this.getSession(sessionId);
        if (session) {
            const oldEnv = { ...session.env };
            session.env = { ...session.env, ...env };
            session.lastActive = new Date();
            // Add to recording if active
            if (session.recording) {
                const changedEnv = Object.fromEntries(Object.entries(env).filter(([key, value]) => oldEnv[key] !== value));
                if (Object.keys(changedEnv).length > 0) {
                    await this.addRecordingEvent(sessionId, {
                        type: 'env_change',
                        data: { env: changedEnv },
                    });
                }
            }
            await this.saveSession(session);
        }
    }
    /**
     * Get session history with filtering and search
     */
    async getSessionHistory(sessionId, limit = 50, search, commandsOnly = false) {
        const session = await this.getSession(sessionId);
        if (!session) {
            return [];
        }
        let history = session.history;
        // Filter by search term if provided
        if (search) {
            const searchLower = search.toLowerCase();
            history = history.filter(entry => entry.command.toLowerCase().includes(searchLower) ||
                (!commandsOnly && entry.output.toLowerCase().includes(searchLower)));
        }
        // Return most recent entries first
        return history.slice(-limit).reverse();
    }
    /**
     * Get command suggestions based on history and patterns
     */
    async getCommandSuggestions(sessionId, partialCommand, limit = 10) {
        const session = await this.getSession(sessionId);
        if (!session) {
            return [];
        }
        const partialLower = partialCommand.toLowerCase();
        const suggestions = new Set();
        // Get commands from history that start with the partial command
        session.history
            .filter(entry => entry.command.toLowerCase().startsWith(partialLower))
            .forEach(entry => suggestions.add(entry.command));
        // Add common commands that match
        const commonCommands = [
            'ls -la',
            'ls -l',
            'cd',
            'pwd',
            'cat',
            'echo',
            'mkdir',
            'rm',
            'cp',
            'mv',
            'npm install',
            'npm run',
            'npm start',
            'npm test',
            'npm run build',
            'git status',
            'git add',
            'git commit',
            'git push',
            'git pull',
            'git log',
            'docker build',
            'docker run',
            'docker ps',
            'docker stop',
            'python',
            'node',
            'yarn',
            'pip install',
        ];
        commonCommands
            .filter(cmd => cmd.toLowerCase().startsWith(partialLower))
            .forEach(cmd => suggestions.add(cmd));
        return Array.from(suggestions).slice(0, limit);
    }
    /**
     * Get frequently used commands
     */
    async getFrequentCommands(sessionId, limit = 10) {
        const session = await this.getSession(sessionId);
        if (!session) {
            return [];
        }
        // Count command frequency
        const commandCounts = new Map();
        session.history.forEach(entry => {
            const baseCommand = getStringOrDefault(entry.command.split(' ')[0], 'unknown'); // Get the base command (e.g., 'git' from 'git status')
            commandCounts.set(baseCommand, (commandCounts.get(baseCommand) || 0) + 1);
        });
        // Sort by frequency and return top commands
        return Array.from(commandCounts.entries())
            .map(([command, count]) => ({ command, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    /**
     * Start recording a terminal session
     */
    async startRecording(sessionId) {
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new Error('Terminal session not found');
        }
        const recordingId = uuidv4();
        const recording = {
            id: recordingId,
            sessionId,
            startTime: new Date(),
            events: [],
            metadata: {
                totalCommands: 0,
                totalDuration: 0,
                finalStatus: 'completed',
            },
        };
        session.recording = recording;
        await this.saveSession(session);
        console.log(`🎬 Started recording session ${sessionId} (recording: ${recordingId})`);
        return recordingId;
    }
    /**
     * Stop recording a terminal session
     */
    async stopRecording(sessionId) {
        const session = await this.getSession(sessionId);
        if (!session || !session.recording) {
            return null;
        }
        session.recording.endTime = new Date();
        session.recording.metadata.finalStatus = 'completed';
        const recording = { ...session.recording };
        // Save recording separately for later retrieval
        await this.saveRecording(recording);
        // Remove recording from session (keep session light)
        delete session.recording;
        await this.saveSession(session);
        console.log(`🎬 Stopped recording session ${sessionId} (${recording.events.length} events captured)`);
        return recording;
    }
    /**
     * Add an event to the current recording
     */
    async addRecordingEvent(sessionId, event) {
        const session = await this.getSession(sessionId);
        if (!session || !session.recording) {
            return; // No recording active
        }
        const recordingEvent = {
            ...event,
            timestamp: new Date(),
        };
        session.recording.events.push(recordingEvent);
        // Update metadata
        if (event.type === 'command') {
            session.recording.metadata.totalCommands++;
        }
        if (event.data.duration) {
            session.recording.metadata.totalDuration += event.data.duration;
        }
        await this.saveSession(session);
    }
    /**
     * Get recording for a session
     */
    async getRecording(recordingId) {
        try {
            if (redisSessionManager.isConnected()) {
                const recordingKey = `terminal_recording:${recordingId}`;
                const recordingData = await redisSessionManager.get(recordingKey);
                if (recordingData) {
                    const recording = JSON.parse(recordingData);
                    // Convert date strings back to Date objects
                    recording.startTime = new Date(recording.startTime);
                    if (recording.endTime) {
                        recording.endTime = new Date(recording.endTime);
                    }
                    recording.events = recording.events.map((event) => ({
                        ...event,
                        timestamp: new Date(event.timestamp),
                    }));
                    return recording;
                }
            }
        }
        catch (error) {
            console.error('Failed to get recording from Redis:', error);
        }
        return null;
    }
    /**
     * List all recordings for a session
     */
    async getSessionRecordings(sessionId) {
        try {
            if (redisSessionManager.isConnected()) {
                const recordingKey = `session_recordings:${sessionId}`;
                const recordingIds = await redisSessionManager.sMembers(recordingKey);
                const recordings = [];
                for (const recordingId of recordingIds) {
                    const recording = await this.getRecording(recordingId);
                    if (recording) {
                        recordings.push(recording);
                    }
                }
                return recordings.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
            }
        }
        catch (error) {
            console.error('Failed to get session recordings from Redis:', error);
        }
        return [];
    }
    /**
     * Replay a terminal recording
     */
    async replayRecording(recordingId, options = {}) {
        const recording = await this.getRecording(recordingId);
        if (!recording) {
            throw new Error('Recording not found');
        }
        const { speed = 1, skipCommands = false, skipOutput = false } = options;
        return {
            async *[Symbol.asyncIterator]() {
                let lastTimestamp = null;
                for (const event of recording.events) {
                    // Skip events based on options
                    if (skipCommands && event.type === 'command')
                        continue;
                    if (skipOutput && event.type === 'output')
                        continue;
                    // Calculate delay based on real timing and speed
                    if (lastTimestamp) {
                        const realDelay = event.timestamp.getTime() - lastTimestamp.getTime();
                        const adjustedDelay = realDelay / speed;
                        if (adjustedDelay > 0) {
                            await new Promise(resolve => setTimeout(resolve, adjustedDelay));
                        }
                    }
                    lastTimestamp = event.timestamp;
                    yield event;
                }
            },
        };
    }
    async searchCommandHistory(sessionId, options) {
        const session = await this.getSession(sessionId);
        if (!session) {
            return [];
        }
        let results = session.history;
        // Apply filters
        if (options.query) {
            const queryLower = options.query.toLowerCase();
            results = results.filter(entry => entry.command.toLowerCase().includes(queryLower) ||
                entry.output.toLowerCase().includes(queryLower));
        }
        if (options.exitCode !== undefined) {
            results = results.filter(entry => entry.exitCode === options.exitCode);
        }
        if (options.dateFrom) {
            results = results.filter(entry => entry.timestamp >= options.dateFrom);
        }
        if (options.dateTo) {
            results = results.filter(entry => entry.timestamp <= options.dateTo);
        }
        if (options.cwd) {
            results = results.filter(entry => entry.cwd === options.cwd);
        }
        // Sort by timestamp (most recent first) and limit
        return results
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, options.limit || 50);
    }
    /**
     * List all active sessions for a container
     */
    async getContainerSessions(containerId) {
        const sessions = Array.from(this.sessions.values()).filter(session => session.containerId === containerId && session.status === 'active');
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
    async terminateSession(sessionId) {
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
    async cleanupExpiredSessions() {
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
     * Save recording to Redis for persistence
     */
    async saveRecording(recording) {
        try {
            if (redisSessionManager.isConnected()) {
                const recordingKey = `terminal_recording:${recording.id}`;
                const sessionRecordingKey = `session_recordings:${recording.sessionId}`;
                // Save recording data
                await redisSessionManager.set(recordingKey, JSON.stringify(recording), 24 * 60 * 60); // 24 hour TTL
                // Add to session recordings list
                await redisSessionManager.sAdd(sessionRecordingKey, recording.id);
            }
        }
        catch (error) {
            console.error('Failed to save recording to Redis:', error);
        }
    }
    /**
     * Save session to Redis for persistence
     */
    async saveSession(session) {
        try {
            if (redisSessionManager.isConnected()) {
                const sessionKey = `terminal_session:${session.id}`;
                const containerKey = `container_sessions:${session.containerId}`;
                // Save session data
                await redisSessionManager.set(sessionKey, JSON.stringify(session), 60 * 60); // 1 hour TTL
                // Add to container session list
                await redisSessionManager.sAdd(containerKey, session.id);
            }
        }
        catch (error) {
            console.error('Failed to save terminal session to Redis:', error);
            // Continue without Redis - sessions will still work in memory
        }
    }
    /**
     * Restore session from Redis
     */
    async restoreSession(sessionId) {
        try {
            if (redisSessionManager.isConnected()) {
                const sessionKey = `terminal_session:${sessionId}`;
                const sessionData = await redisSessionManager.get(sessionKey);
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    // Convert date strings back to Date objects
                    session.createdAt = new Date(session.createdAt);
                    session.lastActive = new Date(session.lastActive);
                    session.history = session.history.map((entry) => ({
                        ...entry,
                        timestamp: new Date(entry.timestamp),
                    }));
                    console.log(`🔄 Restored terminal session ${sessionId} from Redis`);
                    return session;
                }
            }
        }
        catch (error) {
            console.error('Failed to restore terminal session from Redis:', error);
        }
        return null;
    }
    /**
     * Get session IDs for a container from Redis
     */
    async getRedisSessionIds(containerId) {
        try {
            if (redisSessionManager.isConnected()) {
                const containerKey = `container_sessions:${containerId}`;
                return await redisSessionManager.sMembers(containerKey);
            }
        }
        catch (error) {
            console.error('Failed to get container sessions from Redis:', error);
        }
        return [];
    }
    /**
     * Graceful shutdown
     */
    async shutdown() {
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
//# sourceMappingURL=terminalSessionManager.js.map