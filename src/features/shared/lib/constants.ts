/**
 * Shared Constants
 * Application-wide constants and configuration values
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth-token',
  REFRESH_TOKEN_KEY: 'refresh-token',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// UI Constants
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  MODAL_Z_INDEX: 1000,
  DROPDOWN_Z_INDEX: 999,
} as const;

// File Upload
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  MISSING_CREDENTIALS: 'MISSING_CREDENTIALS',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_FORBIDDEN: 'RESOURCE_FORBIDDEN',
  ACTION_NOT_ALLOWED: 'ACTION_NOT_ALLOWED',
  
  // Validation
  REQUIRED: 'REQUIRED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  TOO_SHORT: 'TOO_SHORT',
  TOO_LONG: 'TOO_LONG',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
} as const;

// Container Status
export const CONTAINER_STATUS = {
  CREATING: 'creating',
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error',
  DESTROYED: 'destroyed',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
  API: 'api',
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Connection States
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  DEFAULT_THEME: 'system',
  STORAGE_KEY: 'theme-preference',
  THEMES: ['light', 'dark', 'system'] as const,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ANALYTICS: 'analytics',
  COLLABORATION: 'collaboration',
  WORKFLOW: 'workflow',
  ADVANCED_SEARCH: 'advanced-search',
  REAL_TIME_SYNC: 'real-time-sync',
} as const;

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  MESSAGE: 'message',
  CONTAINER_STATUS_CHANGE: 'container:status:change',
  FILE_CHANGE: 'file:change',
  TERMINAL_OUTPUT: 'terminal:output',
  SYSTEM_NOTIFICATION: 'system:notification',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme-preference',
  SIDEBAR_STATE: 'sidebar-state',
  RECENT_FILES: 'recent-files',
  WORKSPACE_STATE: 'workspace-state',
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd',
  RELATIVE_THRESHOLD: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  MAX_BUNDLE_SIZE: 500, // KB
  MAX_INITIAL_LOAD_TIME: 3000, // 3 seconds
  MAX_API_RESPONSE_TIME: 2000, // 2 seconds
  MAX_COMPONENTS_PER_CHUNK: 20,
  LAZY_LOAD_THRESHOLD: 100, // KB
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  POOL_SIZE: 10,
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  IDLE_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  QUERY_TIMEOUT: 30000, // 30 seconds
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 3600, // 1 hour in seconds
  MAX_TTL: 86400, // 24 hours
  MIN_TTL: 60, // 1 minute
  MEMORY_CHECK_INTERVAL: 60000, // 1 minute in milliseconds
} as const;

// Container Configuration
export const CONTAINER_CONFIG = {
  MAX_CONTAINERS: 50,
  TIMEOUT_MINUTES: 30,
  POOL_SIZE: 5,
  CLEANUP_THRESHOLD_MB: 1024,
  MAX_MEMORY_MB: 256,
  HEALTHCHECK_INTERVAL: 30000, // 30 seconds
} as const;

// API Rate Limiting
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 100,
  DELAY_MS: 0,
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false,
} as const;

// Logging Configuration
export const LOG_CONFIG = {
  LEVELS: ['error', 'warn', 'info', 'http', 'debug'] as const,
  DEFAULT_LEVEL: 'info',
  MAX_FILE_SIZE: 10485760, // 10MB
  MAX_FILES: 5,
  DATE_PATTERN: 'YYYY-MM-DD',
} as const;

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  PING_TIMEOUT: 60000, // 1 minute
  PING_INTERVAL: 25000, // 25 seconds
  MAX_HTTP_BUFFER_SIZE: 1e8, // 100MB
  TRANSPORT: ['websocket', 'polling'] as const,
} as const;