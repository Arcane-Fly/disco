/**
 * Strict API Response Types
 * Eliminates 'any' usage with proper type definitions
 */

import type { UserId, SessionId, ContainerId, ApiKey, Timestamp } from './branded';

// Base API Response Structure
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

// Paginated Response Structure
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalPages: number;
  };
}

// Response Metadata
export interface ResponseMetadata {
  timestamp: Timestamp;
  requestId: string;
  version: string;
  processingTime?: number;
  warnings?: string[];
}

// Structured Error Types
export type ApiError = 
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | RateLimitError
  | NotFoundError
  | ConflictError
  | InternalError;

export interface ValidationError {
  type: 'VALIDATION_ERROR';
  field: string;
  message: string;
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'TOO_SHORT' | 'TOO_LONG' | 'OUT_OF_RANGE';
  details?: Record<string, unknown>;
}

export interface AuthenticationError {
  type: 'AUTHENTICATION_ERROR';
  message: string;
  code: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'MISSING_CREDENTIALS';
}

export interface AuthorizationError {
  type: 'AUTHORIZATION_ERROR';
  resource: string;
  action: string;
  message: string;
  code: 'INSUFFICIENT_PERMISSIONS' | 'RESOURCE_FORBIDDEN' | 'ACTION_NOT_ALLOWED';
}

export interface RateLimitError {
  type: 'RATE_LIMIT_ERROR';
  retryAfter: number;
  limit: number;
  remaining: number;
  resetTime: Timestamp;
  message: string;
}

export interface NotFoundError {
  type: 'NOT_FOUND_ERROR';
  resource: string;
  identifier: string;
  message: string;
}

export interface ConflictError {
  type: 'CONFLICT_ERROR';
  resource: string;
  conflictField: string;
  message: string;
  existingValue?: string;
}

export interface InternalError {
  type: 'INTERNAL_ERROR';
  code: string;
  message: string;
  correlationId?: string;
  details?: Record<string, unknown>;
}

// Request Types with Strict Validation
export interface ApiRequest<TBody = Record<string, unknown>, TQuery = Record<string, string>, TParams = Record<string, string>> {
  body: TBody;
  headers: Record<string, string>;
  query: TQuery;
  params: TParams;
  user?: AuthenticatedUser;
  session?: SessionData;
}

// Authentication Types
export interface AuthenticatedUser {
  id: UserId;
  email: string;
  role: UserRole;
  permissions: Permission[];
  sessionId: SessionId;
}

export type UserRole = 'admin' | 'user' | 'viewer' | 'api';

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
}

export interface SessionData {
  id: SessionId;
  userId: UserId;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  lastActivity: Timestamp;
  ipAddress: string;
  userAgent: string;
}

// Domain-Specific Response Types
export interface ContainerResponse {
  id: ContainerId;
  userId: UserId;
  status: ContainerStatus;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  config: ContainerConfig;
  resources: ContainerResources;
}

export type ContainerStatus = 'creating' | 'running' | 'stopped' | 'error' | 'destroyed';

export interface ContainerConfig {
  image: string;
  ports: PortMapping[];
  environment: Record<string, string>;
  volumes: VolumeMapping[];
  networkMode: 'bridge' | 'host' | 'none';
}

export interface PortMapping {
  internal: number;
  external?: number;
  protocol: 'tcp' | 'udp';
}

export interface VolumeMapping {
  source: string;
  target: string;
  readonly: boolean;
}

export interface ContainerResources {
  cpu: {
    usage: number;
    limit?: number;
  };
  memory: {
    usage: number;
    limit?: number;
  };
  storage: {
    usage: number;
    limit?: number;
  };
}

// File System Types
export interface FileSystemEntry {
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: Timestamp;
  permissions: FilePermissions;
  content?: string; // Only present for files when requested
}

export interface FilePermissions {
  readable: boolean;
  writable: boolean;
  executable: boolean;
  owner: string;
}

// Git Operation Types
export interface GitRepository {
  url: string;
  branch: string;
  commit: string;
  status: GitStatus;
  remotes: GitRemote[];
}

export interface GitStatus {
  clean: boolean;
  staged: GitFileChange[];
  unstaged: GitFileChange[];
  untracked: string[];
}

export interface GitFileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string; // For renamed files
}

export interface GitRemote {
  name: string;
  url: string;
  fetch: string;
  push: string;
}

// Terminal Session Types
export interface TerminalSession {
  id: SessionId;
  containerId: ContainerId;
  userId: UserId;
  status: 'active' | 'inactive' | 'closed';
  createdAt: Timestamp;
  lastActivity: Timestamp;
  shell: string;
  workingDirectory: string;
}

export interface TerminalCommand {
  id: string;
  sessionId: SessionId;
  command: string;
  output: string;
  exitCode: number;
  executedAt: Timestamp;
  duration: number;
}

// Utility Types for API Responses
export type SuccessResponse<T> = {
  status: 'success';
  data: T;
  metadata: ResponseMetadata;
};

export type ErrorResponse = {
  status: 'error';
  error: ApiError;
  metadata: ResponseMetadata;
};

// Type Guards
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is SuccessResponse<T> => {
  return response.status === 'success' && response.data !== undefined;
};

export const isErrorResponse = (response: ApiResponse<unknown>): response is ErrorResponse => {
  return response.status === 'error' && response.error !== undefined;
};

export const isValidationError = (error: ApiError): error is ValidationError => {
  return error.type === 'VALIDATION_ERROR';
};

export const isAuthenticationError = (error: ApiError): error is AuthenticationError => {
  return error.type === 'AUTHENTICATION_ERROR';
};

export const isAuthorizationError = (error: ApiError): error is AuthorizationError => {
  return error.type === 'AUTHORIZATION_ERROR';
};

export const isRateLimitError = (error: ApiError): error is RateLimitError => {
  return error.type === 'RATE_LIMIT_ERROR';
};

// Response Builder Utilities
export const createSuccessResponse = <T>(data: T, metadata?: Partial<ResponseMetadata>): SuccessResponse<T> => ({
  status: 'success',
  data,
  metadata: {
    timestamp: Date.now() as Timestamp,
    requestId: crypto.randomUUID(),
    version: '1.0.0',
    ...metadata,
  },
});

export const createErrorResponse = (error: ApiError, metadata?: Partial<ResponseMetadata>): ErrorResponse => ({
  status: 'error',
  error,
  metadata: {
    timestamp: Date.now() as Timestamp,
    requestId: crypto.randomUUID(),
    version: '1.0.0',
    ...metadata,
  },
});

export const createPaginatedResponse = <T>(
  items: T[],
  pagination: PaginatedResponse<T>['pagination'],
  metadata?: Partial<ResponseMetadata>
): PaginatedResponse<T> => ({
  status: 'success',
  data: items,
  pagination,
  metadata: {
    timestamp: Date.now() as Timestamp,
    requestId: crypto.randomUUID(),
    version: '1.0.0',
    ...metadata,
  },
});