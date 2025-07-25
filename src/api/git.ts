import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { GitCloneRequest, GitCommitRequest, GitPushRequest, GitResponse, ErrorCode } from '../types/index.js';

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
          message: 'Repository URL is required'
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

    console.log(`📥 Cloning repository: ${url} into container ${containerId}`);

    const result = await cloneRepository(session.container, {
      url,
      branch: branch || 'main',
      authToken,
      directory: directory || '.'
    });

    // Update session with repository info
    session.repositoryUrl = url;

    res.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Git clone error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to clone repository'
      }
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
          message: 'Commit message is required'
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

    console.log(`📝 Committing changes in container ${containerId}: "${message}"`);

    const result = await commitChanges(session.container, {
      message,
      files,
      author
    });

    res.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Git commit error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to commit changes'
      }
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
          message: 'Authentication token is required for push operations'
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

    console.log(`📤 Pushing changes from container ${containerId} to ${remote}/${branch}`);

    const result = await pushChanges(session.container, {
      remote,
      branch,
      authToken,
      force
    });

    res.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Git push error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to push changes'
      }
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

    console.log(`📥 Pulling changes in container ${containerId} from ${remote}/${branch}`);

    const result = await pullChanges(session.container, {
      remote,
      branch,
      authToken
    });

    res.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Git pull error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: error instanceof Error ? error.message : 'Failed to pull changes'
      }
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

    const status = await getGitStatus(session.container);

    res.json({
      status: 'success',
      data: status
    });

  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: 'Failed to get repository status'
      }
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

    const log = await getGitLog(session.container, {
      limit: parseInt(limit as string) || 10,
      branch: branch as string
    });

    res.json({
      status: 'success',
      data: log
    });

  } catch (error) {
    console.error('Git log error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.GIT_ERROR,
        message: 'Failed to get commit history'
      }
    });
  }
});

// Helper functions for Git operations

async function cloneRepository(container: any, options: GitCloneRequest): Promise<GitResponse> {
  try {
    // Mock implementation - in real WebContainer, you would execute git commands
    const { url, branch = 'main', directory = '.', authToken } = options;
    
    // Simulate git clone
    const command = `git clone ${branch ? `-b ${branch}` : ''} ${url} ${directory}`;
    
    // In real implementation, you would handle authentication with authToken
    console.log(`Executing: ${command}`);
    
    return {
      success: true,
      message: `Repository cloned successfully to ${directory}`,
      data: {
        url,
        branch,
        directory,
        commit: 'abc123def456' // Mock commit hash
      }
    };
  } catch (error) {
    throw new Error(`Clone failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function commitChanges(container: any, options: GitCommitRequest): Promise<GitResponse> {
  try {
    const { message, files, author } = options;
    
    // Mock implementation
    let command = 'git add ';
    if (files && files.length > 0) {
      command += files.join(' ');
    } else {
      command += '.';
    }
    
    console.log(`Executing: ${command}`);
    
    if (author) {
      console.log(`Setting author: ${author.name} <${author.email}>`);
    }
    
    console.log(`Executing: git commit -m "${message}"`);
    
    const commitHash = 'def456abc789'; // Mock commit hash
    
    return {
      success: true,
      message: 'Changes committed successfully',
      data: {
        commitHash,
        message,
        files: files || [],
        author
      }
    };
  } catch (error) {
    throw new Error(`Commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function pushChanges(container: any, options: GitPushRequest): Promise<GitResponse> {
  try {
    const { remote, branch, authToken, force } = options;
    
    // Mock implementation
    const command = `git push ${force ? '--force' : ''} ${remote} ${branch}`;
    console.log(`Executing: ${command}`);
    
    return {
      success: true,
      message: `Changes pushed successfully to ${remote}/${branch}`,
      data: {
        remote,
        branch,
        force
      }
    };
  } catch (error) {
    throw new Error(`Push failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function pullChanges(container: any, options: any): Promise<GitResponse> {
  try {
    const { remote, branch, authToken } = options;
    
    // Mock implementation
    const command = `git pull ${remote} ${branch}`;
    console.log(`Executing: ${command}`);
    
    return {
      success: true,
      message: `Changes pulled successfully from ${remote}/${branch}`,
      data: {
        remote,
        branch,
        commits: [] // Mock commits pulled
      }
    };
  } catch (error) {
    throw new Error(`Pull failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getGitStatus(_container: any): Promise<any> {
  // Mock git status
  return {
    branch: 'main',
    ahead: 0,
    behind: 0,
    staged: [],
    modified: ['src/server.ts'],
    untracked: ['temp.txt'],
    conflicted: []
  };
}

async function getGitLog(_container: any, options: { limit: number; branch?: string }): Promise<any> {
  // Mock git log
  return {
    commits: [
      {
        hash: 'abc123def456',
        message: 'Initial commit',
        author: 'Developer <dev@example.com>',
        date: new Date().toISOString(),
        files: ['README.md', 'package.json']
      },
      {
        hash: 'def456abc789',
        message: 'Add server implementation',
        author: 'Developer <dev@example.com>',
        date: new Date(Date.now() - 86400000).toISOString(),
        files: ['src/server.ts']
      }
    ],
    total: 2,
    branch: options.branch || 'main'
  };
}

export { router as gitRouter };