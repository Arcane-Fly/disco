/**
 * Branded types for type safety and domain modeling
 * Prevents mixing up different string/number types that should be distinct
 */

export type Brand<T, K> = T & { readonly __brand: K };

// User domain types
export type UserId = Brand<string, 'UserId'>;
export type Username = Brand<string, 'Username'>;
export type Email = Brand<string, 'Email'>;

// Container domain types  
export type ContainerId = Brand<string, 'ContainerId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type TerminalId = Brand<string, 'TerminalId'>;

// Workflow domain types
export type WorkflowId = Brand<string, 'WorkflowId'>;
export type NodeId = Brand<string, 'NodeId'>;
export type ConnectionId = Brand<string, 'ConnectionId'>;

// File system types
export type FilePath = Brand<string, 'FilePath'>;
export type DirectoryPath = Brand<string, 'DirectoryPath'>;

// Security types
export type ApiKey = Brand<string, 'ApiKey'>;
export type JwtToken = Brand<string, 'JwtToken'>;
export type CsrfToken = Brand<string, 'CsrfToken'>;

// Type guards for runtime validation
export const isUserId = (value: string): value is UserId => 
  value.length > 0 && /^[a-zA-Z0-9_-]+$/.test(value);

export const isContainerId = (value: string): value is ContainerId => 
  value.startsWith('container_') && value.length > 10;

export const isSessionId = (value: string): value is SessionId =>
  value.startsWith('sess_') && value.length > 5;

export const isEmail = (value: string): value is Email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isFilePath = (value: string): value is FilePath =>
  value.length > 0 && !value.includes('..');

// Factory functions for creating branded types
export const createUserId = (value: string): UserId => {
  if (!isUserId(value)) {
    throw new Error(`Invalid UserId: ${value}`);
  }
  return value as UserId;
};

export const createContainerId = (value: string): ContainerId => {
  if (!isContainerId(value)) {
    throw new Error(`Invalid ContainerId: ${value}`);
  }
  return value as ContainerId;
};

export const createSessionId = (value: string): SessionId => {
  if (!isSessionId(value)) {
    throw new Error(`Invalid SessionId: ${value}`);
  }
  return value as SessionId;
};

export const createEmail = (value: string): Email => {
  if (!isEmail(value)) {
    throw new Error(`Invalid Email: ${value}`);
  }
  return value as Email;
};