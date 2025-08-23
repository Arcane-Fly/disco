import { Request, Response, NextFunction } from 'express';
import { containerManager } from '../lib/containerManager.js';
import { ErrorCode } from '../types/index.js';

/**
 * Extended Request interface to include validated session
 */
export interface SessionValidatedRequest extends Request {
  session?: any; // Container session object
}

/**
 * Middleware to validate container session and user permissions
 * Automatically handles session retrieval, existence check, and permission validation
 */
export const validateContainerSession = async (
  req: SessionValidatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { containerId } = req.params;
    const userId = req.user!.userId;

    if (!containerId) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: 'Container ID is required'
        }
      });
    }

    // Get container session
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

    // Check user permissions
    if (session.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        error: {
          code: ErrorCode.PERMISSION_DENIED,
          message: 'Access denied to this container'
        }
      });
    }

    // Attach validated session to request for use in handlers
    req.session = session;
    next();

  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.EXECUTION_ERROR,
        message: 'Session validation failed'
      }
    });
  }
};

/**
 * Helper function for manual session validation in places where middleware isn't suitable
 */
export const getValidatedSession = async (containerId: string, userId: string) => {
  const session = await containerManager.getSession(containerId);
  
  if (!session) {
    throw new Error('CONTAINER_NOT_FOUND');
  }

  if (session.userId !== userId) {
    throw new Error('PERMISSION_DENIED');
  }

  return session;
};