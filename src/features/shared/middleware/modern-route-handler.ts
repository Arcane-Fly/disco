/**
 * Modern Route Handler Middleware
 * Systematic approach to modernize Express route handlers
 */

import type { Request, Response, NextFunction } from 'express';

// Modern async wrapper that ensures proper return handling
export const modernHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = fn(req, res, next);
    
    if (result instanceof Promise) {
      result.catch(next);
    }
  };
};

// Parameter validation middleware
export const validateParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = requiredParams.filter(param => !req.params[param]);
    
    if (missing.length > 0) {
      res.status(400).json({
        status: 'error',
        error: {
          code: 'MISSING_PARAMETERS',
          message: `Missing required parameters: ${missing.join(', ')}`,
        },
      });
      return;
    }
    
    next();
  };
};

// Body validation middleware
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = requiredFields.filter(field => !(field in req.body));
    
    if (missing.length > 0) {
      res.status(400).json({
        status: 'error',
        error: {
          code: 'MISSING_FIELDS',
          message: `Missing required fields: ${missing.join(', ')}`,
        },
      });
      return;
    }
    
    next();
  };
};

// Standard response helpers
export const sendSuccess = <T>(res: Response, data: T): void => {
  res.json({
    status: 'success',
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (res: Response, status: number, code: string, message: string): void => {
  res.status(status).json({
    status: 'error',
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  });
};

// Common error responses
export const badRequest = (res: Response, message = 'Bad Request'): void => 
  sendError(res, 400, 'BAD_REQUEST', message);

export const unauthorized = (res: Response, message = 'Unauthorized'): void => 
  sendError(res, 401, 'UNAUTHORIZED', message);

export const forbidden = (res: Response, message = 'Forbidden'): void => 
  sendError(res, 403, 'FORBIDDEN', message);

export const notFound = (res: Response, message = 'Not Found'): void => 
  sendError(res, 404, 'NOT_FOUND', message);

export const serverError = (res: Response, error: Error): void => {
  console.error('Server error:', error);
  sendError(res, 500, 'INTERNAL_ERROR', 'Internal Server Error');
};