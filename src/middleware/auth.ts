import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, ErrorCode } from '../types/index.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Missing or invalid authorization header'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        status: 'error',
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Server configuration error'
        }
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        error: {
          code: ErrorCode.AUTH_FAILED,
          message: 'Invalid or expired token'
        }
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Authentication error'
      }
    });
  }
};