import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../types/index.js';

export const errorHandler = (error: Error & { name?: string; code?: string; type?: string }, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error response
  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ErrorCode.INVALID_REQUEST;
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = ErrorCode.AUTH_FAILED;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = ErrorCode.PERMISSION_DENIED;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = ErrorCode.CONTAINER_NOT_FOUND;
    message = 'Resource not found';
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorCode = ErrorCode.INVALID_REQUEST;
    message = 'File too large';
  } else if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    errorCode = ErrorCode.INVALID_REQUEST;
    message = 'Invalid JSON format';
  }

  res.status(statusCode).json({
    status: 'error',
    error: {
      code: errorCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack 
      })
    }
  });
};