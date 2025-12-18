import { Response } from 'express';
import { ErrorCode } from '../../types/index.js';

/**
 * Standardized API response format
 */
export interface StandardAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    correlationId?: string;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

/**
 * Format successful API response
 */
export function formatSuccessResponse<T>(
  data: T,
  requestId?: string
): StandardAPIResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId,
    },
  };
}

/**
 * Format error API response
 */
export function formatErrorResponse(
  code: ErrorCode | string,
  message: string,
  details?: unknown,
  correlationId?: string
): StandardAPIResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      correlationId,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

/**
 * Send standardized success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  requestId?: string
): Response {
  return res.status(statusCode).json(formatSuccessResponse(data, requestId));
}

/**
 * Send standardized error response
 */
export function sendError(
  res: Response,
  code: ErrorCode | string,
  message: string,
  statusCode: number = 500,
  details?: unknown,
  correlationId?: string
): Response {
  return res
    .status(statusCode)
    .json(formatErrorResponse(code, message, details, correlationId));
}

/**
 * Map error to appropriate HTTP status code
 */
export function getStatusCodeForError(code: ErrorCode | string): number {
  const statusCodes: Record<string, number> = {
    [ErrorCode.INVALID_REQUEST]: 400,
    [ErrorCode.AUTH_FAILED]: 401,
    [ErrorCode.PERMISSION_DENIED]: 403,
    [ErrorCode.CONTAINER_NOT_FOUND]: 404,
    [ErrorCode.FILE_NOT_FOUND]: 404,
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
    [ErrorCode.EXECUTION_ERROR]: 422,
    [ErrorCode.WEBCONTAINER_ERROR]: 503,
    [ErrorCode.GIT_ERROR]: 422,
    [ErrorCode.INTERNAL_ERROR]: 500,
  };

  return statusCodes[code] || 500;
}
