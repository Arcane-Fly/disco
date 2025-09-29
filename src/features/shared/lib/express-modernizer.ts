/**
 * Express Route Modernization Utilities
 * Systematic approach to convert legacy Express handlers to modern TypeScript standards
 */

import type { Request, Response, NextFunction } from 'express';

// Modern async handler wrapper
export const modernAsyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

// Parameter validation with modern TypeScript
export const getRequiredParam = (req: Request, paramName: string): string => {
  const value = req.params[paramName];
  if (!value) {
    throw new Error(`Missing required parameter: ${paramName}`);
  }
  return value;
};

export const getOptionalParam = (req: Request, paramName: string, defaultValue = ''): string => {
  return req.params[paramName] || defaultValue;
};

// Modern response helpers
export const sendModernSuccess = <T>(res: Response, data: T): void => {
  res.json({
    status: 'success' as const,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendModernError = (res: Response, status: number, message: string, code?: string): void => {
  res.status(status).json({
    status: 'error' as const,
    error: {
      message,
      code: code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
    },
  });
};

// Common error responses
export const sendBadRequest = (res: Response, message = 'Bad Request'): void => {
  sendModernError(res, 400, message, 'BAD_REQUEST');
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized'): void => {
  sendModernError(res, 401, message, 'UNAUTHORIZED');
};

export const sendNotFound = (res: Response, message = 'Not Found'): void => {
  sendModernError(res, 404, message, 'NOT_FOUND');
};

export const sendServerError = (res: Response, error: Error): void => {
  console.error('Server error:', error);
  sendModernError(res, 500, 'Internal Server Error', 'INTERNAL_ERROR');
};