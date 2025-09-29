/**
 * Express Route Handler Types
 * Typed interfaces for Express route handlers with proper error handling
 */

import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, ApiError, AuthenticatedUser } from '../types/api';
import type { ValidationResult } from '../types';

// Enhanced Request interface with type safety
export interface TypedRequest<
  TBody = unknown,
  TQuery = Record<string, string>,
  TParams = Record<string, string>
> extends Request {
  body: TBody;
  query: TQuery;
  params: TParams;
  user?: AuthenticatedUser;
  session?: {
    id: string;
    userId: string;
    [key: string]: unknown;
  };
}

// Response interface with typed JSON methods
export interface TypedResponse<TData = unknown> extends Response {
  json(body: ApiResponse<TData>): this;
  status(code: number): this;
}

// Route handler type with proper return
export type RouteHandler<
  TData = unknown,
  TBody = unknown,
  TQuery = Record<string, string>,
  TParams = Record<string, string>
> = (
  req: TypedRequest<TBody, TQuery, TParams>,
  res: TypedResponse<TData>,
  next: NextFunction
) => Promise<void> | void;

// Async route handler wrapper
export type AsyncRouteHandler<
  TData = unknown,
  TBody = unknown,
  TQuery = Record<string, string>,
  TParams = Record<string, string>
> = (
  req: TypedRequest<TBody, TQuery, TParams>,
  res: TypedResponse<TData>,
  next: NextFunction
) => Promise<void>;

// Error handler type
export type ErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Middleware type
export type Middleware<
  TBody = unknown,
  TQuery = Record<string, string>,
  TParams = Record<string, string>
> = (
  req: TypedRequest<TBody, TQuery, TParams>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Route parameter validation types
export interface RouteParams {
  containerId?: string;
  sessionId?: string;
  userId?: string;
  fileId?: string;
  workflowId?: string;
  [key: string]: string | undefined;
}

// Common request body types
export interface LoginRequestBody {
  username?: string;
  email?: string;
  password: string;
  apiKey?: string;
}

export interface CreateContainerBody {
  name: string;
  image: string;
  environment?: Record<string, string>;
  ports?: Array<{
    internal: number;
    external?: number;
    protocol: 'tcp' | 'udp';
  }>;
}

export interface FileOperationBody {
  path: string;
  content?: string;
  encoding?: string;
}

// Common query parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterQuery {
  search?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Utility functions for route handlers
export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  status: 'success',
  data,
  metadata: {
    timestamp: Date.now(),
    requestId: crypto.randomUUID(),
    version: '1.0.0',
  },
});

export const createErrorResponse = (error: ApiError): ApiResponse<never> => ({
  status: 'error',
  error,
  metadata: {
    timestamp: Date.now(),
    requestId: crypto.randomUUID(),
    version: '1.0.0',
  },
});

// Parameter validation helpers
export const validateRequiredParam = (
  value: string | undefined,
  paramName: string
): string => {
  if (!value) {
    throw new Error(`Missing required parameter: ${paramName}`);
  }
  return value;
};

export const validateOptionalParam = (
  value: string | undefined,
  defaultValue: string
): string => {
  return value || defaultValue;
};

export const parseIntParam = (
  value: string | undefined,
  paramName: string,
  defaultValue?: number
): number => {
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

export const parseBooleanParam = (
  value: string | undefined,
  defaultValue = false
): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

// Async handler wrapper to catch errors
export const asyncHandler = <
  TData = unknown,
  TBody = unknown,
  TQuery = Record<string, string>,
  TParams = Record<string, string>
>(
  handler: AsyncRouteHandler<TData, TBody, TQuery, TParams>
): RouteHandler<TData, TBody, TQuery, TParams> => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

// Request validation wrapper
export const validateRequest = <TBody = unknown>(
  validationRules: Record<string, unknown>,
  handler: AsyncRouteHandler<unknown, TBody>
): RouteHandler<unknown, TBody> => {
  return asyncHandler(async (req, res, next) => {
    // Validation logic would go here
    // For now, just pass through to the handler
    await handler(req, res, next);
  });
};

// Common error responses
export const sendValidationError = (
  res: Response,
  errors: ValidationResult['errors']
): void => {
  res.status(400).json(createErrorResponse({
    type: 'VALIDATION_ERROR',
    field: errors[0]?.field || 'unknown',
    message: errors[0]?.message || 'Validation failed',
    code: 'INVALID_FORMAT',
    details: { errors },
  }));
};

export const sendAuthenticationError = (res: Response, message = 'Authentication required'): void => {
  res.status(401).json(createErrorResponse({
    type: 'AUTHENTICATION_ERROR',
    message,
    code: 'MISSING_CREDENTIALS',
  }));
};

export const sendAuthorizationError = (res: Response, resource: string, action: string): void => {
  res.status(403).json(createErrorResponse({
    type: 'AUTHORIZATION_ERROR',
    resource,
    action,
    message: `Insufficient permissions to ${action} ${resource}`,
    code: 'INSUFFICIENT_PERMISSIONS',
  }));
};

export const sendNotFoundError = (res: Response, resource: string, identifier: string): void => {
  res.status(404).json(createErrorResponse({
    type: 'NOT_FOUND_ERROR',
    resource,
    identifier,
    message: `${resource} with ID ${identifier} not found`,
  }));
};

export const sendInternalError = (res: Response, error: Error): void => {
  const correlationId = crypto.randomUUID();
  
  // Log the full error for debugging
  console.error(`Internal error [${correlationId}]:`, error);
  
  res.status(500).json(createErrorResponse({
    type: 'INTERNAL_ERROR',
    code: 'INTERNAL_ERROR',
    message: 'An internal server error occurred',
    correlationId,
    details: process.env.NODE_ENV === 'development' ? { error: error.message } : undefined,
  }));
};