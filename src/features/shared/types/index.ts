/**
 * Shared Types Barrel Export
 * Central export point for all shared type definitions
 */

// Branded types for type safety
export * from './branded';

// API response and request types
export * from './api';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type EmptyObject = Record<string, never>;

// Function utility types
export type AsyncFunction<T = void> = () => Promise<T>;
export type AsyncFunctionWithArgs<TArgs extends unknown[], TReturn = void> = (...args: TArgs) => Promise<TReturn>;

// Event handler types
export type EventHandler<TEvent = Event> = (event: TEvent) => void;
export type AsyncEventHandler<TEvent = Event> = (event: TEvent) => Promise<void>;

// Form and input types
export type FormSubmitHandler<TData = Record<string, unknown>> = (data: TData) => void | Promise<void>;
export type InputChangeHandler<TValue = string> = (value: TValue) => void;

// Status and state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// Generic CRUD operations
export interface CrudOperations<T, TCreateData, TUpdateData> {
  create: (data: TCreateData) => Promise<T>;
  read: (id: string) => Promise<T | null>;
  update: (id: string, data: TUpdateData) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: (filters?: Record<string, unknown>) => Promise<T[]>;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpiry: number;
  };
  features: {
    analytics: boolean;
    collaboration: boolean;
    workflow: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    animations: boolean;
    compactMode: boolean;
  };
}

// Environment types
export type Environment = 'development' | 'test' | 'staging' | 'production';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Component prop types
export interface BaseComponentProps {
  id?: string;
  className?: string;
  'data-testid'?: string;
}

// Async resource types
export interface AsyncResource<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  facets?: string[];
}

export interface FilterOption<T = string> {
  label: string;
  value: T;
  count?: number;
}

// Date and time types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}

// Validation types
export interface ValidationRule<T = unknown> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Theme and styling types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Analytics and tracking types
export interface AnalyticsEvent {
  name: string;
  category: 'user_action' | 'system_event' | 'error' | 'performance';
  properties?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Feature flag types
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  variant?: string;
  rolloutPercentage?: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  url?: string;
}