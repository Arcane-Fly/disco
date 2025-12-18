import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../../types/index.js';
import { sendError, getStatusCodeForError } from './response-formatter.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode | string,
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode || getStatusCodeForError(code);
  }
}

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Log error for monitoring
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle known application errors
  if (err instanceof AppError) {
    sendError(
      res,
      err.code,
      err.message,
      err.statusCode || 500,
      process.env.NODE_ENV === 'development' ? err.details : undefined,
      req.headers['x-correlation-id'] as string
    );
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    sendError(
      res,
      ErrorCode.INVALID_REQUEST,
      'Validation failed',
      400,
      process.env.NODE_ENV === 'development' ? err.message : undefined,
      req.headers['x-correlation-id'] as string
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(
      res,
      ErrorCode.AUTH_FAILED,
      'Authentication failed',
      401,
      process.env.NODE_ENV === 'development' ? err.message : undefined,
      req.headers['x-correlation-id'] as string
    );
    return;
  }

  // Handle unknown errors
  sendError(
    res,
    ErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development' ? err.message : undefined,
    req.headers['x-correlation-id'] as string
  );
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  sendError(
    res,
    'NOT_FOUND',
    `Cannot ${req.method} ${req.path}`,
    404,
    undefined,
    req.headers['x-correlation-id'] as string
  );
}
