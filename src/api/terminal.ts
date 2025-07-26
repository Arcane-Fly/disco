import { Router, Request, Response } from 'express';
import { WebContainer } from '@webcontainer/api';
import { containerManager } from '../lib/containerManager.js';
import { TerminalCommand, TerminalResponse, TerminalSessionRequest, ErrorCode } from '../types/index.js';
import { terminalSessionManager } from '../lib/terminalSessionManager.js';

const router = Router();

/**
 * POST /api/v1/terminal/:containerId/session
 * Create a new terminal session or resume an existing one
 */
router.post('/:containerId/session', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { sessionId, cwd, env }: TerminalSessionRequest = req.body;
    const userId = req.user!.userId;

    // Verify container exists and user has access
    const containerSession = await containerManager.getSession(containerId);
    if (!containerSession) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (containerSession.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    // Create or resume terminal session
    const terminalSession = await terminalSessionManager.createOrResumeSession({
      containerId,
      sessionId,
      cwd,
      env
    });

    // Set userId on the terminal session
    const session = await terminalSessionManager.getSession(terminalSession.sessionId);
    if (session) {
      session.userId = userId;
      await terminalSessionManager.updateEnvironment(terminalSession.sessionId, session.env);
    }

    res.json({
      status: 'success',
      data: terminalSession
    });

  } catch (error) {
    console.error('Terminal session creation error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to create terminal session'
      }
    });
  }
});

/**
 * GET /api/v1/terminal/:containerId/sessions
 * List all active terminal sessions for a container
 */
router.get('/:containerId/sessions', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const userId = req.user!.userId;

    // Verify container exists and user has access
    const containerSession = await containerManager.getSession(containerId);
    if (!containerSession) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (containerSession.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    const sessions = await terminalSessionManager.getContainerSessions(containerId);
    
    // Filter to only return sessions owned by this user
    const userSessions = sessions.filter(session => session.userId === userId);

    res.json({
      status: 'success',
      data: {
        sessions: userSessions.map(session => ({
          id: session.id,
          createdAt: session.createdAt,
          lastActive: session.lastActive,
          cwd: session.cwd,
          status: session.status,
          historyCount: session.history.length
        }))
      }
    });

  } catch (error) {
    console.error('Terminal sessions list error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to list terminal sessions'
      }
    });
  }
});

/**
 * GET /api/v1/terminal/:containerId/session/:sessionId/history
 * Get command history for a terminal session
 */
router.get('/:containerId/session/:sessionId/history', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const { limit, search } = req.query;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    const history = await terminalSessionManager.getSessionHistory(
      sessionId,
      limit ? parseInt(limit as string) : 50,
      search as string
    );

    res.json({
      status: 'success',
      data: { history }
    });

  } catch (error) {
    console.error('Terminal history error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get terminal history'
      }
    });
  }
});

/**
 * GET /api/v1/terminal/:containerId/session/:sessionId/suggestions
 * Get command suggestions based on partial input and history
 */
router.get('/:containerId/session/:sessionId/suggestions', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const { partial, limit } = req.query;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    const suggestions = await terminalSessionManager.getCommandSuggestions(
      sessionId,
      partial as string || '',
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      status: 'success',
      data: { suggestions }
    });

  } catch (error) {
    console.error('Command suggestions error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get command suggestions'
      }
    });
  }
});

/**
 * GET /api/v1/terminal/:containerId/session/:sessionId/frequent
 * Get frequently used commands for a session
 */
router.get('/:containerId/session/:sessionId/frequent', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const { limit } = req.query;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    const frequentCommands = await terminalSessionManager.getFrequentCommands(
      sessionId,
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      status: 'success',
      data: { commands: frequentCommands }
    });

  } catch (error) {
    console.error('Frequent commands error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get frequent commands'
      }
    });
  }
});

/**
 * POST /api/v1/terminal/:containerId/session/:sessionId/search
 * Advanced search through command history with filters
 */
router.post('/:containerId/session/:sessionId/search', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const { query, exitCode, dateFrom, dateTo, cwd, limit } = req.body;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    const searchOptions = {
      query,
      exitCode,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      cwd,
      limit
    };

    const results = await terminalSessionManager.searchCommandHistory(sessionId, searchOptions);

    res.json({
      status: 'success',
      data: { 
        results,
        total: results.length,
        searchOptions
      }
    });

  } catch (error) {
    console.error('Command history search error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to search command history'
      }
    });
  }
});

/**
 * POST /api/v1/terminal/:containerId/session/:sessionId/record/start
 * Start recording a terminal session
 */
router.post('/:containerId/session/:sessionId/record/start', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    if (session.recording) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Session is already being recorded'
        }
      });
    }

    const recordingId = await terminalSessionManager.startRecording(sessionId);

    res.json({
      status: 'success',
      data: { 
        recordingId,
        message: 'Recording started',
        sessionId
      }
    });

  } catch (error) {
    console.error('Start recording error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to start recording'
      }
    });
  }
});

/**
 * POST /api/v1/terminal/:containerId/session/:sessionId/record/stop
 * Stop recording a terminal session
 */
router.post('/:containerId/session/:sessionId/record/stop', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    const recording = await terminalSessionManager.stopRecording(sessionId);
    
    if (!recording) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'No active recording found for this session'
        }
      });
    }

    res.json({
      status: 'success',
      data: { 
        recording: {
          id: recording.id,
          startTime: recording.startTime,
          endTime: recording.endTime,
          metadata: recording.metadata,
          eventCount: recording.events.length
        },
        message: 'Recording stopped'
      }
    });

  } catch (error) {
    console.error('Stop recording error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to stop recording'
      }
    });
  }
});

/**
 * GET /api/v1/terminal/:containerId/session/:sessionId/recordings
 * Get all recordings for a terminal session
 */
router.get('/:containerId/session/:sessionId/recordings', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    const recordings = await terminalSessionManager.getSessionRecordings(sessionId);

    res.json({
      status: 'success',
      data: { 
        recordings: recordings.map(rec => ({
          id: rec.id,
          startTime: rec.startTime,
          endTime: rec.endTime,
          metadata: rec.metadata,
          eventCount: rec.events.length
        }))
      }
    });

  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get recordings'
      }
    });
  }
});

/**
 * GET /api/v1/terminal/:containerId/recording/:recordingId
 * Get a specific recording
 */
router.get('/:containerId/recording/:recordingId', async (req: Request, res: Response) => {
  try {
    const { containerId, recordingId } = req.params;
    const userId = req.user!.userId;

    const recording = await terminalSessionManager.getRecording(recordingId);
    
    if (!recording) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Recording not found'
        }
      });
    }

    // Verify user has access to the session
    const session = await terminalSessionManager.getSession(recording.sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this recording'
        }
      });
    }

    res.json({
      status: 'success',
      data: { recording }
    });

  } catch (error) {
    console.error('Get recording error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get recording'
      }
    });
  }
});

/**
 * POST /api/v1/terminal/:containerId/recording/:recordingId/replay
 * Start replaying a recording with Server-Sent Events
 */
router.post('/:containerId/recording/:recordingId/replay', async (req: Request, res: Response) => {
  try {
    const { containerId, recordingId } = req.params;
    const { speed = 1, skipCommands = false, skipOutput = false } = req.body;
    const userId = req.user!.userId;

    const recording = await terminalSessionManager.getRecording(recordingId);
    
    if (!recording) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Recording not found'
        }
      });
    }

    // Verify user has access to the session
    const session = await terminalSessionManager.getSession(recording.sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this recording'
        }
      });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Start the replay
    const replayIterable = await terminalSessionManager.replayRecording(recordingId, {
      speed,
      skipCommands,
      skipOutput
    });

    // Send initial message
    res.write(`data: ${JSON.stringify({ 
      type: 'replay_start', 
      metadata: recording.metadata,
      recordingId 
    })}\n\n`);

    // Stream events
    try {
      for await (const event of replayIterable) {
        res.write(`data: ${JSON.stringify({ 
          type: 'replay_event', 
          event 
        })}\n\n`);
      }
      
      // Send completion message
      res.write(`data: ${JSON.stringify({ 
        type: 'replay_complete' 
      })}\n\n`);
    } catch (replayError) {
      console.error('Replay error:', replayError);
      res.write(`data: ${JSON.stringify({ 
        type: 'replay_error', 
        message: 'Replay interrupted' 
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Replay recording error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to replay recording'
        }
      });
    }
  }
});

/**
 * DELETE /api/v1/terminal/:containerId/session/:sessionId
 * Terminate a terminal session
 */
router.delete('/:containerId/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { containerId, sessionId } = req.params;
    const userId = req.user!.userId;

    // Verify session exists and user has access
    const session = await terminalSessionManager.getSession(sessionId);
    if (!session || session.containerId !== containerId || session.userId !== userId) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Terminal session not found or access denied'
        }
      });
    }

    await terminalSessionManager.terminateSession(sessionId);

    res.json({
      status: 'success',
      data: { message: 'Terminal session terminated' }
    });

  } catch (error) {
    console.error('Terminal session termination error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to terminate terminal session'
      }
    });
  }
});

/**
 * POST /api/v1/terminal/:containerId/execute
 * Execute a command in the container with session support
 */
router.post('/:containerId/execute', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { command, cwd, env, sessionId }: TerminalCommand = req.body;
    const userId = req.user!.userId;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Command is required'
        }
      });
    }

    const containerSession = await containerManager.getSession(containerId);
    
    if (!containerSession) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (containerSession.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    // Validate command for security
    if (!isCommandSafe(command)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Command not allowed for security reasons'
        }
      });
    }

    // Get or create terminal session
    let terminalSession;
    if (sessionId) {
      terminalSession = await terminalSessionManager.getSession(sessionId);
      if (!terminalSession || terminalSession.containerId !== containerId || terminalSession.userId !== userId) {
        return res.status(404).json({
          status: 'error',
          error: {
            code: ErrorCode.CONTAINER_NOT_FOUND,
            message: 'Terminal session not found or access denied'
          }
        });
      }
    } else {
      // Create a temporary session for this command
      const sessionResponse = await terminalSessionManager.createOrResumeSession({
        containerId,
        cwd,
        env
      });
      terminalSession = await terminalSessionManager.getSession(sessionResponse.sessionId);
      if (terminalSession) {
        terminalSession.userId = userId;
      }
    }

    // Use session cwd and env if not provided in command
    const effectiveCwd = cwd || terminalSession?.cwd || '/tmp';
    const effectiveEnv = { 
      ...(terminalSession?.env || {}), 
      ...(env || {}) 
    };

    // Update session working directory if it changed
    if (terminalSession && cwd && cwd !== terminalSession.cwd) {
      await terminalSessionManager.updateWorkingDirectory(terminalSession.id, cwd);
    }

    // Update session environment if provided
    if (terminalSession && env) {
      await terminalSessionManager.updateEnvironment(terminalSession.id, env);
    }

    console.log(`💻 Executing command: "${command}" in container ${containerId}${terminalSession ? ` (session: ${terminalSession.id})` : ''}`);

    const startTime = Date.now();
    const result = await executeCommand(containerSession.container, command, effectiveCwd, effectiveEnv);
    const duration = Date.now() - startTime;

    // Save command to terminal session history
    if (terminalSession) {
      await terminalSessionManager.addCommandToHistory(
        terminalSession.id,
        command,
        result.output,
        result.exitCode,
        duration
      );
    }

    const response: TerminalResponse = {
      ...result,
      duration
    };

    // Include session ID in response if using a session
    const responseData = terminalSession 
      ? { ...response, sessionId: terminalSession.id }
      : response;

    res.json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    console.error('Command execution error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: error instanceof Error ? error.message : 'Command execution failed'
      }
    });
  }
});

/**
 * POST /api/v1/terminal/:containerId/stream
 * Execute a command with streaming output
 */
router.post('/:containerId/stream', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { command, cwd, env }: TerminalCommand = req.body;
    const userId = req.user!.userId;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Command is required'
        }
      });
    }

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    // Validate command for security
    if (!isCommandSafe(command)) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Command not allowed for security reasons'
        }
      });
    }

    console.log(`🌊 Streaming command: "${command}" in container ${containerId}`);

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const startTime = Date.now();
    
    try {
      await executeCommandStreaming(session.container, command, cwd, env, (data: {type: string; data?: string; exitCode?: number; error?: string}) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      });
      
      const duration = Date.now() - startTime;
      
      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        duration: duration
      })}\n\n`);
      
    } catch (error) {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Command execution failed'
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Streaming command error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to start command streaming'
      }
    });
  }
});

/**
 * GET /api/v1/terminal/:containerId/history
 * Get command history for the container
 */
router.get('/:containerId/history', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const userId = req.user!.userId;

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    // Get command history - try to get from most recent session first
    let history: string[] = [];
    try {
      // Get the most recent session for this container
      const sessions = await terminalSessionManager.getContainerSessions(containerId);
      const userSessions = sessions.filter(s => s.userId === userId);
      if (userSessions.length > 0) {
        const recentSession = userSessions[0]; // Already sorted by most recent
        history = await getCommandHistory(session.container, recentSession.id);
      } else {
        history = await getCommandHistory(session.container);
      }
    } catch (error) {
      console.error('Error getting command history:', error);
      history = await getCommandHistory(session.container);
    }

    res.json({
      status: 'success',
      data: {
        history: history
      }
    });

  } catch (error) {
    console.error('Command history error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to get command history'
      }
    });
  }
});

/**
 * POST /api/v1/terminal/:containerId/kill
 * Kill a running process
 */
router.post('/:containerId/kill', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { pid, signal = 'SIGTERM' } = req.body;
    const userId = req.user!.userId;

    const session = await containerManager.getSession(containerId);
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found'
        }
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    if (!pid) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Process ID is required'
        }
      });
    }

    await killProcess(session.container, pid, signal);

    console.log(`🔫 Killed process ${pid} with signal ${signal} in container ${containerId}`);

    res.json({
      status: 'success',
      data: {
        message: `Process ${pid} killed with signal ${signal}`
      }
    });

  } catch (error) {
    console.error('Process kill error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Failed to kill process'
      }
    });
  }
});

// Helper functions

function isCommandSafe(command: string): boolean {
  // Enhanced command validation for security
  const dangerousCommands = [
    // File system damage
    'rm -rf /',
    'rm -rf .*',
    'dd if=',
    'mkfs',
    'fdisk',
    'format',
    
    // User/system access
    'passwd',
    'su ',
    'sudo su',
    'sudo -i',
    'sudo bash',
    'sudo sh',
    
    // Network/download and execute
    'curl.*\\|.*sh',
    'wget.*\\|.*sh',
    'curl.*\\|.*bash',
    'wget.*\\|.*bash',
    'bash <\\(curl',
    'sh <\\(curl',
    
    // Code execution
    'eval',
    'exec',
    'python -c',
    'node -e',
    'ruby -e',
    
    // Process manipulation
    'kill -9 1',
    'killall -9',
    'pkill -9',
    
    // System modification
    'mount',
    'umount',
    'chmod 777 /',
    'chown root',
    
    // Package managers (to prevent unauthorized installs)
    'apt-get install',
    'apt install',
    'yum install',
    'npm install -g',
    'pip install',
    
    // Kernel/system
    'modprobe',
    'insmod',
    'rmmod',
    
    // Redirects to sensitive files
    '> /etc/',
    '>> /etc/',
    '> /bin/',
    '>> /bin/',
    '> /usr/',
    '>> /usr/'
  ];

  const lowerCommand = command.toLowerCase().trim();
  
  // Check against dangerous patterns
  const isDangerous = dangerousCommands.some(dangerous => {
    const regex = new RegExp(dangerous, 'i');
    return regex.test(lowerCommand);
  });
  
  if (isDangerous) {
    console.warn(`🚫 Blocked potentially dangerous command: ${command}`);
    return false;
  }
  
  // Additional checks for command injection
  const injectionPatterns = [
    /;.*rm/i,
    /&&.*rm/i,
    /\|.*rm/i,
    /`.*rm.*`/i,
    /\$\(.*rm.*\)/i,
    /;.*sudo/i,
    /&&.*sudo/i,
    /\|.*sudo/i
  ];
  
  const hasInjection = injectionPatterns.some(pattern => pattern.test(command));
  
  if (hasInjection) {
    console.warn(`🚫 Blocked command with potential injection: ${command}`);
    return false;
  }
  
  return true;
}

async function executeCommand(
  container: WebContainer, 
  command: string, 
  cwd?: string, 
  env?: Record<string, string>
): Promise<Omit<TerminalResponse, 'duration'>> {
  try {
    // Parse command and arguments
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    
    // Set up spawn options
    const spawnOptions: {
      cwd?: string;
      env?: Record<string, string>;
    } = {};
    if (cwd) {
      spawnOptions.cwd = cwd;
    }
    if (env) {
      spawnOptions.env = { 
        ...Object.fromEntries(
          Object.entries(process.env).filter(([_, value]) => value !== undefined)
        ) as Record<string, string>,
        ...env 
      };
    }
    
    console.log(`Executing command: ${cmd} with args:`, args);
    
    // Spawn the process using WebContainer
    const containerProcess = await container.spawn(cmd, args, spawnOptions);
    
    // Capture stdout and stderr using proper stream handling
    let stdout = '';
    let stderr = '';
    
    // Create promises to handle output streams
    const outputPromises: Promise<void>[] = [];
    
    // Handle stdout stream
    if (containerProcess.output) {
      const stdoutPromise = new Promise<void>((resolve) => {
        const reader = containerProcess.output.getReader();
        
        function readStream() {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve();
              return;
            }
            
            stdout += value;
            console.log('Command output:', value);
            
            readStream(); // Continue reading
          }).catch((error) => {
            console.warn('Error reading stdout:', error);
            resolve();
          });
        }
        
        readStream();
      });
      outputPromises.push(stdoutPromise);
    }
    
    // Wait for the process to complete
    const exitCode = await containerProcess.exit;
    
    // Wait for all output streams to be read
    await Promise.all(outputPromises);
    
    // If no output captured via streams, provide basic feedback
    if (!stdout && exitCode === 0) {
      stdout = `Command "${command}" executed successfully`;
    }
    if (!stderr && exitCode !== 0) {
      stderr = `Command failed with exit code ${exitCode}`;
    }
    
    return {
      output: stdout || `Command "${command}" completed`,
      exitCode: exitCode,
      stdout: stdout,
      stderr: stderr
    };
  } catch (error) {
    console.error('Command execution error:', error);
    
    // Return error information
    return {
      output: `Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      exitCode: 1,
      stdout: '',
      stderr: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function executeCommandStreaming(
  container: WebContainer,
  command: string,
  cwd?: string,
  env?: Record<string, string>,
  onData?: (data: {type: string; data?: string; exitCode?: number; error?: string}) => void
): Promise<void> {
  // Read stream chunks and send them immediately
  async function readStream(reader: ReadableStreamDefaultReader<string>, onData: (data: {type: string; data?: string; exitCode?: number; error?: string}) => void): Promise<void> {
    try {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      
      onData({
        type: 'stdout',
        data: value
      });
      
      // Continue reading
      await readStream(reader, onData);
    } catch (error) {
      console.warn('Error reading stdout stream:', error);
    }
  }

  try {
    // Parse command and arguments
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    
    // Set up spawn options
    const spawnOptions: {
      cwd?: string;
      env?: Record<string, string>;
    } = {};
    if (cwd) {
      spawnOptions.cwd = cwd;
    }
    if (env) {
      spawnOptions.env = { 
        ...Object.fromEntries(
          Object.entries(process.env).filter(([_, value]) => value !== undefined)
        ) as Record<string, string>,
        ...env 
      };
    }
    
    console.log(`Streaming command: ${cmd} with args:`, args);
    
    // Spawn the process using WebContainer
    const containerProcess = await container.spawn(cmd, args, spawnOptions);
    
    // Handle stdout stream with real-time streaming
    if (containerProcess.output && onData) {
      const reader = containerProcess.output.getReader();
      
      // Start reading the stream
      readStream(reader, onData).catch(console.error);
    }
    
    // Wait for the process to complete and send exit code
    const exitCode = await containerProcess.exit;
    
    if (onData) {
      onData({
        type: 'exit',
        exitCode: exitCode
      });
    }
    
  } catch (error) {
    if (onData) {
      onData({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

async function getCommandHistory(container: WebContainer, sessionId?: string): Promise<string[]> {
  // If we have a session ID, get history from terminal session manager
  if (sessionId) {
    try {
      const history = await terminalSessionManager.getSessionHistory(sessionId, 50);
      return history.map(entry => entry.command);
    } catch (error) {
      console.error('Failed to get session history:', error);
    }
  }

  // If no session or session history fails, try to get bash history from container
  try {
    const historyResult = await executeCommand(container, 'history', undefined, undefined);
    if (historyResult.exitCode === 0) {
      // Parse history output - format is usually "  123  command"
      const historyLines = historyResult.output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          // Remove line numbers and leading whitespace
          const match = line.match(/^\s*\d+\s+(.+)$/);
          return match ? match[1] : line.trim();
        })
        .filter(cmd => cmd.length > 0);
      
      return historyLines.slice(-50); // Return last 50 commands
    }
  } catch (error) {
    console.error('Failed to get bash history from container:', error);
  }

  // Fallback to common commands
  return [
    'ls -la',
    'pwd',
    'git status',
    'npm install',
    'npm start'
  ];
}

async function killProcess(container: WebContainer, pid: number, signal: string): Promise<void> {
  try {
    // Use the kill command to send signal to process
    const killCommand = `kill -${signal} ${pid}`;
    const result = await executeCommand(container, killCommand, undefined, undefined);
    
    if (result.exitCode !== 0) {
      // If kill failed, try to get process info to provide better error
      const psResult = await executeCommand(container, `ps -p ${pid}`, undefined, undefined);
      if (psResult.exitCode !== 0) {
        throw new Error(`Process ${pid} not found`);
      } else {
        throw new Error(`Failed to kill process ${pid}: ${result.stderr}`);
      }
    }
    
    console.log(`Successfully sent signal ${signal} to process ${pid}`);
  } catch (error) {
    console.error(`Failed to kill process ${pid}:`, error);
    throw error;
  }
}

export { router as terminalRouter };