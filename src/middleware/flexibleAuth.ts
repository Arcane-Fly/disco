import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, ErrorCode } from '../types/index.js';

// Flexible auth middleware that supports both Bearer token and query parameter
export const flexibleAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | null = null;

    // Try to get token from Authorization header first (existing method)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If no Authorization header, try to get token from query parameter (new method)
    if (!token && req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    // If still no token, return authentication required error
    if (!token) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Authentication required. Provide Authorization header or token query parameter.',
          details: 'Use "Authorization: Bearer <token>" header or "?token=<token>" query parameter',
        },
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        status: 'error',
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Server configuration error',
        },
      });
    }

    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          status: 'error',
          error: {
            code: ErrorCode.AUTH_FAILED,
            message: 'Token expired',
          },
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          status: 'error',
          error: {
            code: ErrorCode.AUTH_FAILED,
            message: 'Invalid token',
          },
        });
      } else {
        return res.status(401).json({
          status: 'error',
          error: {
            code: ErrorCode.AUTH_FAILED,
            message: 'Token verification failed',
          },
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal authentication error',
      },
    });
  }
};