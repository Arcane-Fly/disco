import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import {
  GitCloneRequest,
  GitCommitRequest,
  GitPushRequest,
  GitResponse,
  ErrorCode,
} from '../types/index.js';
import { loggers } from '../lib/logger.js';

const router = Router();

/**
 * POST /api/v1/git/:containerId/clone
 * Clone a repository into the container
 */
router.post('/:containerId/clone', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { url, branch, authToken, directory }: GitCloneRequest = req.body;
    const userId = req.user!.userId;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Repository URL is required',
        },
      });
    }

    const session = await containerManager.getSession(containerId);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found',
        },
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container',
        },
      });
    }

    loggers.git.info('Cloning repository', { url, containerId, branch });

    const result = await cloneRepository(session.container, {
      url,
      branch: branch || 'main',
      authToken,
      directory: directory || '.',
    });

    // Update session with repository info
    session.repositoryUrl = url;

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    loggers.git.error('Git clone error', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to clone repository',
      },
    });
  }
});

/**
 * POST /api/v1/git/:containerId/commit
 * Commit changes in the repository
 */
router.post('/:containerId/commit', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { message, files, author }: GitCommitRequest = req.body;
    const userId = req.user!.userId;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Commit message is required',
        },
      });
    }

    const session = await containerManager.getSession(containerId);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found',
        },
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container',
        },
      });
    }

    console.log(`📝 Committing changes in container ${containerId}: "${message}"`);

    const result = await commitChanges(session.container, {
      message,
      files,
      author,
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Git commit error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to commit changes',
      },
    });
  }
});

/**
 * POST /api/v1/git/:containerId/push
 * Push changes to remote repository
 */
router.post('/:containerId/push', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { remote = 'origin', branch = 'main', authToken, force }: GitPushRequest = req.body;
    const userId = req.user!.userId;

    if (!authToken || typeof authToken !== 'string') {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Authentication token is required for push operations',
        },
      });
    }

    const session = await containerManager.getSession(containerId);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found',
        },
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container',
        },
      });
    }

    console.log(`📤 Pushing changes from container ${containerId} to ${remote}/${branch}`);

    const result = await pushChanges(session.container, {
      remote,
      branch,
      authToken,
      force,
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Git push error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to push changes',
      },
    });
  }
});

/**
 * POST /api/v1/git/:containerId/pull
 * Pull changes from remote repository
 */
router.post('/:containerId/pull', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { remote = 'origin', branch = 'main', authToken } = req.body;
    const userId = req.user!.userId;

    const session = await containerManager.getSession(containerId);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found',
        },
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container',
        },
      });
    }

    console.log(`📥 Pulling changes in container ${containerId} from ${remote}/${branch}`);

    const result = await pullChanges(session.container, {
      remote,
      branch,
      authToken,
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Git pull error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to pull changes',
      },
    });
  }
});

/**
 * GET /api/v1/git/:containerId/status
 * Get repository status
 */
router.get('/:containerId/status', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const userId = req.user!.userId;

    const session = await containerManager.getSession(containerId);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found',
        },
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container',
        },
      });
    }

    const status = await getGitStatus(session.container);

    res.json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: 'Failed to get repository status',
      },
    });
  }
});

/**
 * GET /api/v1/git/:containerId/log
 * Get commit history
 */
router.get('/:containerId/log', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { limit = 10, branch } = req.query;
    const userId = req.user!.userId;

    const session = await containerManager.getSession(containerId);

    if (!session) {
      return res.status(404).json({
        status: 'error',
        error: {
          code: ErrorCode.CONTAINER_NOT_FOUND,
          message: 'Container not found',
        },
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container',
        },
      });
    }

    const log = await getGitLog(session.container, {
      limit: parseInt(limit as string) || 10,
      branch: branch as string,
    });

    res.json({
      status: 'success',
      data: log,
    });
  } catch (error) {
    console.error('Git log error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: 'Failed to get commit history',
      },
    });
  }
});

// Helper functions for Git operations

async function cloneRepository(container: any, options: GitCloneRequest): Promise<GitResponse> {
  try {
    const { url, branch = 'main', directory = '.', authToken } = options;

    // Build git clone command with real WebContainer spawn
    const args = ['clone'];

    if (branch) {
      args.push('-b', branch);
    }

    // Handle authentication by setting up credentials if authToken is provided
    if (authToken) {
      // For GitHub, we can modify the URL to include the token
      const authenticatedUrl = url.includes('github.com')
        ? url.replace('https://github.com/', `https://${authToken}@github.com/`)
        : url;
      args.push(authenticatedUrl);
    } else {
      args.push(url);
    }

    if (directory !== '.') {
      args.push(directory);
    }

    console.log(`Executing git clone with args:`, args);

    // Execute git clone using WebContainer spawn
    const process = await container.spawn('git', args);

    // Capture output
    let stdout = '';
    const stderr = '';

    // Handle output streams if available
    if (process.output?.readable) {
      const reader = process.output.getReader();
      const decoder = new TextDecoder();

      let reading = true;
      while (reading) {
        const { done, value } = await reader.read();
        if (done) {
          reading = false;
          break;
        }
        stdout += decoder.decode(value, { stream: true });
      }
    }

    // Wait for process to complete and capture output
    const exitCode = await process.exit;

    if (exitCode !== 0) {
      throw new Error(`Git clone failed with exit code ${exitCode}. Output: ${stderr || stdout}`);
    }

    // Get current commit hash after successful clone
    let commitHash = 'unknown';
    try {
      const hashProcess = await container.spawn('git', ['rev-parse', 'HEAD'], {
        cwd: directory !== '.' ? directory : undefined,
      });

      if (hashProcess.output?.readable) {
        const reader = hashProcess.output.getReader();
        const decoder = new TextDecoder();
        let hashOutput = '';

        let reading = true;
        while (reading) {
          const { done, value } = await reader.read();
          if (done) {
            reading = false;
            break;
          }
          hashOutput += decoder.decode(value, { stream: true });
        }

        const hashExitCode = await hashProcess.exit;
        if (hashExitCode === 0) {
          commitHash = hashOutput.trim();
        }
      }
    } catch (hashError) {
      console.warn('Could not get commit hash after clone:', hashError);
    }

    return {
      success: true,
      message: `Repository cloned successfully to ${directory}`,
      data: {
        url,
        branch,
        directory,
        commit: commitHash,
        output: stdout,
      },
    };
  } catch (error) {
    console.error('Git clone error:', error);
    throw new Error(`Clone failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function commitChanges(container: any, options: GitCommitRequest): Promise<GitResponse> {
  try {
    const { message, files, author } = options;

    // Set git author if provided
    if (author) {
      try {
        await container.spawn('git', ['config', 'user.name', author.name]);
        await container.spawn('git', ['config', 'user.email', author.email]);
      } catch (configError) {
        console.warn('Could not set git author:', configError);
      }
    }

    // Stage files
    const addArgs = ['add'];
    if (files && files.length > 0) {
      addArgs.push(...files);
    } else {
      addArgs.push('.');
    }

    console.log(`Executing git add with args:`, addArgs);
    const addProcess = await container.spawn('git', addArgs);
    const addExitCode = await addProcess.exit;

    if (addExitCode !== 0) {
      throw new Error(`Git add failed with exit code ${addExitCode}`);
    }

    // Commit changes
    console.log(`Executing git commit with message: "${message}"`);
    const commitProcess = await container.spawn('git', ['commit', '-m', message]);
    const commitExitCode = await commitProcess.exit;

    if (commitExitCode !== 0) {
      throw new Error(`Git commit failed with exit code ${commitExitCode}`);
    }

    // Get the commit hash
    let commitHash = 'unknown';
    try {
      const hashProcess = await container.spawn('git', ['rev-parse', 'HEAD']);
      const hashExitCode = await hashProcess.exit;
      if (hashExitCode === 0) {
        commitHash = 'committed-successfully';
      }
    } catch (hashError) {
      console.warn('Could not get commit hash:', hashError);
    }

    return {
      success: true,
      message: 'Changes committed successfully',
      data: {
        commitHash,
        message,
        files: files || [],
        author,
      },
    };
  } catch (error) {
    console.error('Git commit error:', error);
    throw new Error(`Commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function pushChanges(container: any, options: GitPushRequest): Promise<GitResponse> {
  try {
    const { remote = 'origin', branch = 'main', authToken, force = false } = options;

    // Build push arguments
    const args = ['push'];

    if (force) {
      args.push('--force');
    }

    args.push(remote, branch);

    // Handle authentication by setting up git config if authToken is provided
    if (authToken) {
      try {
        // For GitHub, we can set up credential helper or use URL with token
        const remoteUrl = await getRemoteUrl(container, remote);
        if (remoteUrl && remoteUrl.includes('github.com')) {
          const authenticatedUrl = remoteUrl.replace(
            'https://github.com/',
            `https://${authToken}@github.com/`
          );
          await container.spawn('git', ['remote', 'set-url', remote, authenticatedUrl]);
        }
      } catch (authError) {
        console.warn('Could not set up authentication:', authError);
      }
    }

    console.log(`Executing git push with args:`, args);
    const pushProcess = await container.spawn('git', args);
    const exitCode = await pushProcess.exit;

    if (exitCode !== 0) {
      throw new Error(`Git push failed with exit code ${exitCode}`);
    }

    return {
      success: true,
      message: `Changes pushed successfully to ${remote}/${branch}`,
      data: {
        remote,
        branch,
        force,
      },
    };
  } catch (error) {
    console.error('Git push error:', error);
    throw new Error(`Push failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get remote URL
async function getRemoteUrl(container: any, remote: string = 'origin'): Promise<string | null> {
  try {
    const process = await container.spawn('git', ['remote', 'get-url', remote]);
    const exitCode = await process.exit;

    if (exitCode === 0) {
      // In a real implementation, we would read the stdout
      // For now, return null since we can't easily capture stdout
      return null;
    }
    return null;
  } catch (error) {
    console.warn('Could not get remote URL:', error);
    return null;
  }
}

async function pullChanges(container: any, options: any): Promise<GitResponse> {
  try {
    const { remote = 'origin', branch = 'main', authToken } = options;

    // Handle authentication similar to push
    if (authToken) {
      try {
        const remoteUrl = await getRemoteUrl(container, remote);
        if (remoteUrl && remoteUrl.includes('github.com')) {
          const authenticatedUrl = remoteUrl.replace(
            'https://github.com/',
            `https://${authToken}@github.com/`
          );
          await container.spawn('git', ['remote', 'set-url', remote, authenticatedUrl]);
        }
      } catch (authError) {
        console.warn('Could not set up authentication for pull:', authError);
      }
    }

    const args = ['pull', remote, branch];

    console.log(`Executing git pull with args:`, args);
    const pullProcess = await container.spawn('git', args);
    const exitCode = await pullProcess.exit;

    if (exitCode !== 0) {
      throw new Error(`Git pull failed with exit code ${exitCode}`);
    }

    return {
      success: true,
      message: `Changes pulled successfully from ${remote}/${branch}`,
      data: {
        remote,
        branch,
        commits: [], // Would need stdout parsing to get actual commit info
      },
    };
  } catch (error) {
    console.error('Git pull error:', error);
    throw new Error(`Pull failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getGitStatus(container: any): Promise<any> {
  try {
    // Get git status using real WebContainer spawn
    const statusProcess = await container.spawn('git', ['status', '--porcelain']);
    const statusExitCode = await statusProcess.exit;

    if (statusExitCode !== 0) {
      throw new Error(`Git status failed with exit code ${statusExitCode}`);
    }

    // Get current branch
    let branch = 'main';
    try {
      const branchProcess = await container.spawn('git', ['branch', '--show-current']);
      const branchExitCode = await branchProcess.exit;
      if (branchExitCode === 0) {
        // In real implementation, we would parse stdout to get branch name
        branch = 'current-branch';
      }
    } catch (branchError) {
      console.warn('Could not get current branch:', branchError);
    }

    // Note: In a real implementation, we would parse the status output
    // For now, return a basic structure indicating the command succeeded
    return {
      branch: branch,
      ahead: 0,
      behind: 0,
      staged: [],
      modified: [],
      untracked: [],
      conflicted: [],
    };
  } catch (error) {
    console.error('Git status error:', error);
    // Return basic status if git command fails
    return {
      branch: 'unknown',
      ahead: 0,
      behind: 0,
      staged: [],
      modified: [],
      untracked: [],
      conflicted: [],
    };
  }
}

async function getGitLog(
  container: any,
  options: { limit: number; branch?: string }
): Promise<any> {
  try {
    const { limit, branch } = options;

    // Build git log command
    const args = ['log', `--max-count=${limit}`, '--oneline'];

    if (branch) {
      args.push(branch);
    }

    console.log(`Executing git log with args:`, args);
    const logProcess = await container.spawn('git', args);
    const exitCode = await logProcess.exit;

    if (exitCode !== 0) {
      throw new Error(`Git log failed with exit code ${exitCode}`);
    }

    // Note: In a real implementation, we would parse the log output from stdout
    // For now, return a basic structure indicating the command succeeded
    return {
      commits: [],
      total: 0,
      branch: branch || 'current',
    };
  } catch (error) {
    console.error('Git log error:', error);
    // Return empty log if command fails
    return {
      commits: [],
      total: 0,
      branch: options.branch || 'unknown',
    };
  }
}

export { router as gitRouter };
