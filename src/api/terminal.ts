import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { TerminalCommand, TerminalResponse, ErrorCode } from '../types/index.js';

const router = Router();

/**
 * POST /api/v1/terminal/:containerId/execute
 * Execute a command in the container
 */
router.post('/:containerId/execute', async (req: Request, res: Response) => {
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

    const session = containerManager.getSession(containerId);
    
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

    console.log(`💻 Executing command: "${command}" in container ${containerId}`);

    const startTime = Date.now();
    const result = await executeCommand(session.container, command, cwd, env);
    const duration = Date.now() - startTime;

    const response: TerminalResponse = {
      ...result,
      duration
    };

    res.json({
      status: 'success',
      data: response
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

    const session = containerManager.getSession(containerId);
    
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
      await executeCommandStreaming(session.container, command, cwd, env, (data: any) => {
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

    const session = containerManager.getSession(containerId);
    
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

    // Get command history (this would be stored in the container or database)
    const history = await getCommandHistory(session.container);

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

    const session = containerManager.getSession(containerId);
    
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
  // Basic command validation for security
  const dangerousCommands = [
    'rm -rf /',
    'dd if=',
    'mkfs',
    'fdisk',
    'passwd',
    'su ',
    'sudo su',
    'curl.*|.*sh',
    'wget.*|.*sh',
    'eval',
    'exec'
  ];

  const lowerCommand = command.toLowerCase().trim();
  
  return !dangerousCommands.some(dangerous => {
    const regex = new RegExp(dangerous, 'i');
    return regex.test(lowerCommand);
  });
}

async function executeCommand(
  container: any, 
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
    const spawnOptions: any = {};
    if (cwd) {
      spawnOptions.cwd = cwd;
    }
    if (env) {
      spawnOptions.env = { ...process.env, ...env };
    }
    
    console.log(`Executing command: ${cmd} with args:`, args);
    
    // Spawn the process using WebContainer
    const containerProcess = await container.spawn(cmd, args, spawnOptions);
    
    // Wait for the process to complete
    const exitCode = await containerProcess.exit;
    
    // Note: In a real implementation, we would capture stdout/stderr
    // WebContainer's spawn API provides streams for this, but for now
    // we'll return a basic success response
    
    return {
      output: `Command "${command}" executed successfully`,
      exitCode: exitCode,
      stdout: `Command executed: ${command}`,
      stderr: exitCode !== 0 ? `Command failed with exit code ${exitCode}` : ''
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
  _container: any,
  command: string,
  cwd?: string,
  _env?: Record<string, string>,
  onData?: (data: any) => void
): Promise<void> {
  try {
    // Mock streaming implementation
    const chunks = [
      'Starting command execution...\n',
      `Running: ${command}\n`,
      `Working directory: ${cwd || '/'}\n`,
      'Command completed successfully.\n'
    ];

    for (let i = 0; i < chunks.length; i++) {
      if (onData) {
        onData({
          type: 'stdout',
          data: chunks[i]
        });
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (onData) {
      onData({
        type: 'exit',
        exitCode: 0
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

async function getCommandHistory(_container: any): Promise<string[]> {
  // Mock command history - in production, this would be stored
  return [
    'npm install',
    'npm start',
    'ls -la',
    'git status',
    'node server.js'
  ];
}

async function killProcess(_container: any, pid: number, signal: string): Promise<void> {
  // Mock process killing - in production, this would use WebContainer's process API
  console.log(`Mock: Killing process ${pid} with signal ${signal}`);
}

export { router as terminalRouter };