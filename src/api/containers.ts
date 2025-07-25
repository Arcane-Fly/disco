import { Router, Request, Response } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { ContainerCreateResponse, ErrorCode } from '../types/index.js';

const router = Router();

/**
 * POST /api/v1/containers
 * Create a new WebContainer instance
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    console.log(`📦 Creating container for user: ${userId}`);

    const session = await containerManager.createSession(userId);

    const response: ContainerCreateResponse = {
      containerId: session.id,
      status: session.status,
      url: session.url
    };

    res.status(201).json({
      status: 'success',
      data: response
    });

  } catch (error) {
    console.error('Container creation error:', error);
    
    let statusCode = 500;
    let errorCode = ErrorCode.INTERNAL_ERROR;
    let message = 'Failed to create container';

    if (error instanceof Error) {
      if (error.message.includes('limit reached')) {
        statusCode = 429;
        errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
        message = error.message;
      } else if (error.message.includes('WebContainer')) {
        errorCode = ErrorCode.WEBCONTAINER_ERROR;
        message = error.message;
      }
    }

    res.status(statusCode).json({
      status: 'error',
      error: {
        code: errorCode,
        message: message
      }
    });
  }
});

/**
 * GET /api/v1/containers
 * List all containers for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const containers = containerManager.getUserContainers(userId);

    const containerList = containers.map(session => ({
      containerId: session.id,
      status: session.status,
      url: session.url,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
      repositoryUrl: session.repositoryUrl
    }));

    res.json({
      status: 'success',
      data: {
        containers: containerList,
        count: containerList.length
      }
    });

  } catch (error) {
    console.error('Container list error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to list containers'
      }
    });
  }
});

/**
 * GET /api/v1/containers/:containerId
 * Get status of a specific container
 */
router.get('/:containerId', async (req: Request, res: Response) => {
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

    // Check if user owns this container
    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        containerId: session.id,
        status: session.status,
        url: session.url,
        createdAt: session.createdAt,
        lastActive: session.lastActive,
        repositoryUrl: session.repositoryUrl
      }
    });

  } catch (error) {
    console.error('Container status error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get container status'
      }
    });
  }
});

/**
 * DELETE /api/v1/containers/:containerId
 * Terminate a container instance
 */
router.delete('/:containerId', async (req: Request, res: Response) => {
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

    // Check if user owns this container
    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    await containerManager.terminateSession(containerId);

    console.log(`🗑️  Container ${containerId} terminated by user ${userId}`);

    res.json({
      status: 'success',
      data: {
        message: 'Container terminated successfully'
      }
    });

  } catch (error) {
    console.error('Container termination error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to terminate container'
      }
    });
  }
});

/**
 * POST /api/v1/containers/:containerId/restart
 * Restart a container instance
 */
router.post('/:containerId/restart', async (req: Request, res: Response) => {
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

    // Check if user owns this container
    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    // Terminate existing session
    await containerManager.terminateSession(containerId);
    
    // Create new session
    const newSession = await containerManager.createSession(userId);

    console.log(`🔄 Container restarted: ${containerId} -> ${newSession.id}`);

    const response: ContainerCreateResponse = {
      containerId: newSession.id,
      status: newSession.status,
      url: newSession.url
    };

    res.json({
      status: 'success',
      data: response
    });

  } catch (error) {
    console.error('Container restart error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to restart container'
      }
    });
  }
});

/**
 * GET /api/v1/containers/stats
 * Get container statistics (for monitoring)
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = containerManager.getStats();
    
    res.json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('Container stats error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get container stats'
      }
    });
  }
});

export { router as containersRouter };