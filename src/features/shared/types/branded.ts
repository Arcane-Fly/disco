/**
 * Branded Types for Enhanced Type Safety
 * Implements domain-driven design patterns with compile-time type checking
 */

// Generic brand utility type
export type Brand<T, K> = T & { readonly __brand: K };

// Domain-specific branded types
export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type ContainerId = Brand<string, 'ContainerId'>;
export type ApiKey = Brand<string, 'ApiKey'>;
export type Email = Brand<string, 'Email'>;
export type Timestamp = Brand<number, 'Timestamp'>;
export type NonNegativeNumber = Brand<number, 'NonNegativeNumber'>;
export type PositiveNumber = Brand<number, 'PositiveNumber'>;
export type Percentage = Brand<number, 'Percentage'>;
export type FilePath = Brand<string, 'FilePath'>;
export type FileContent = Brand<string, 'FileContent'>;

// Type guards and constructors with validation
export const createUserId = (value: string): UserId => {
  if (!value || value.trim().length < 3) {
    throw new Error('User ID must be at least 3 characters long');
  }
  return value.trim() as UserId;
};

export const createSessionId = (value: string): SessionId => {
  if (!value || !/^[a-zA-Z0-9-_]{10,}$/.test(value)) {
    throw new Error('Session ID must be alphanumeric with at least 10 characters');
  }
  return value as SessionId;
};

export const createContainerId = (value: string): ContainerId => {
  if (!value || !/^[a-zA-Z0-9-]{8,}$/.test(value)) {
    throw new Error('Container ID must be alphanumeric-dash with at least 8 characters');
  }
  return value as ContainerId;
};

export const createApiKey = (value: string): ApiKey => {
  if (!value || value.length < 16) {
    throw new Error('API key must be at least 16 characters long');
  }
  return value as ApiKey;
};

export const createEmail = (value: string): Email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error('Invalid email format');
  }
  return value.toLowerCase() as Email;
};

export const createTimestamp = (value: number = Date.now()): Timestamp => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Timestamp must be a non-negative integer');
  }
  return value as Timestamp;
};

export const createNonNegativeNumber = (value: number): NonNegativeNumber => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('Number must be finite and non-negative');
  }
  return value as NonNegativeNumber;
};

export const createPositiveNumber = (value: number): PositiveNumber => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Number must be finite and positive');
  }
  return value as PositiveNumber;
};

export const createPercentage = (value: number): Percentage => {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
  return value as Percentage;
};

export const createFilePath = (value: string): FilePath => {
  if (!value || value.includes('..') || value.includes('//')) {
    throw new Error('Invalid file path');
  }
  return value as FilePath;
};

export const createFileContent = (value: string): FileContent => {
  if (typeof value !== 'string') {
    throw new Error('File content must be a string');
  }
  return value as FileContent;
};

// Type utilities for working with branded types
export const unwrap = <T extends Brand<unknown, unknown>>(branded: T): T extends Brand<infer U, unknown> ? U : never => {
  return branded as never;
};

// Validation utilities
export const isValidUserId = (value: string): value is UserId => {
  return value.trim().length >= 3;
};

export const isValidEmail = (value: string): value is Email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isValidApiKey = (value: string): value is ApiKey => {
  return value.length >= 16;
};