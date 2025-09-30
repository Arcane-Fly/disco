/**
 * Route Helper Utilities
 * Modern Express route handlers with proper TypeScript support
 */

import type { Request, Response, NextFunction } from 'express';
import type { 
  AsyncRouteHandler, 
  TypedRequest, 
  TypedResponse,
  createSuccessResponse,
  createErrorResponse,
  sendAuthenticationError,
  sendValidationError,
  sendNotFoundError,
  sendInternalError
} from '../types/express';

// Parameter validation helpers
export const validateRequiredParam = (value: string | undefined, paramName: string): string => {
  if (!value) {
    throw new Error(`Missing required parameter: ${paramName}`);
  }
  return value;
};

export const validateOptionalParam = (value: string | undefined, defaultValue: string): string => {
  return value || defaultValue;
};

export const parseIntParam = (value: string | undefined, paramName: string, defaultValue?: number): number => {
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required parameter: ${paramName}`);
  }
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number parameter: ${paramName}`);
  }
  
  return parsed;
};

// Async handler wrapper to catch errors and ensure proper returns
export const asyncHandler = <TData = any, TBody = any, TQuery = any, TParams = any>(
  handler: AsyncRouteHandler<TData, TBody, TQuery, TParams>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req as any, res as any, next))
      .catch(next);
  };
};

// Response helpers with proper return types
export const sendSuccess = <T>(res: Response, data: T, message?: string): void => {
  res.json({
    status: 'success' as const,
    data,
    metadata: {
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
      version: '1.0.0',
    },
  });
};

export const sendError = (res: Response, statusCode: number, error: { type: string; message: string; code?: string }): void => {
  res.status(statusCode).json({
    status: 'error' as const,
    error,
    metadata: {
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
      version: '1.0.0',
    },
  });
};

// Common error responses
export const sendBadRequest = (res: Response, message = 'Bad request'): void => {
  sendError(res, 400, {
    type: 'VALIDATION_ERROR',
    message,
    code: 'BAD_REQUEST',
  });
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized'): void => {
  sendError(res, 401, {
    type: 'AUTHENTICATION_ERROR',
    message,
    code: 'UNAUTHORIZED',
  });
};

export const sendForbidden = (res: Response, message = 'Forbidden'): void => {
  sendError(res, 403, {
    type: 'AUTHORIZATION_ERROR', 
    message,
    code: 'FORBIDDEN',
  });
};

export const sendNotFound = (res: Response, message = 'Not found'): void => {
  sendError(res, 404, {
    type: 'NOT_FOUND_ERROR',
    message,
    code: 'NOT_FOUND',
  });
};

export const sendServerError = (res: Response, error: Error): void => {
  const correlationId = crypto.randomUUID();
  
  // Log the full error for debugging
  console.error(`Internal error [${correlationId}]:`, error);
  
  sendError(res, 500, {
    type: 'INTERNAL_ERROR',
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};