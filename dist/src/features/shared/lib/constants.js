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
};
// Authentication
export const AUTH_CONFIG = {
    TOKEN_KEY: 'auth-token',
    REFRESH_TOKEN_KEY: 'refresh-token',
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
};
// UI Constants
export const UI_CONFIG = {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    ANIMATION_DURATION: 200,
    TOAST_DURATION: 5000,
    MODAL_Z_INDEX: 1000,
    DROPDOWN_Z_INDEX: 999,
};
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
};
// Validation Rules
export const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
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
};
// Container Status
export const CONTAINER_STATUS = {
    CREATING: 'creating',
    RUNNING: 'running',
    STOPPED: 'stopped',
    ERROR: 'error',
    DESTROYED: 'destroyed',
};
// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    VIEWER: 'viewer',
    API: 'api',
};
// Loading States
export const LOADING_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
};
// Connection States
export const CONNECTION_STATES = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error',
};
// Theme Configuration
export const THEME_CONFIG = {
    DEFAULT_THEME: 'system',
    STORAGE_KEY: 'theme-preference',
    THEMES: ['light', 'dark', 'system'],
};
// Feature Flags
export const FEATURE_FLAGS = {
    ANALYTICS: 'analytics',
    COLLABORATION: 'collaboration',
    WORKFLOW: 'workflow',
    ADVANCED_SEARCH: 'advanced-search',
    REAL_TIME_SYNC: 'real-time-sync',
};
// Pagination
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};
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
};
// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth-token',
    REFRESH_TOKEN: 'refresh-token',
    USER_PREFERENCES: 'user-preferences',
    THEME: 'theme-preference',
    SIDEBAR_STATE: 'sidebar-state',
    RECENT_FILES: 'recent-files',
    WORKSPACE_STATE: 'workspace-state',
};
// Date Formats
export const DATE_FORMATS = {
    SHORT: 'MMM d, yyyy',
    LONG: 'MMMM d, yyyy',
    WITH_TIME: 'MMM d, yyyy HH:mm',
    TIME_ONLY: 'HH:mm',
    ISO: 'yyyy-MM-dd',
    RELATIVE_THRESHOLD: 7 * 24 * 60 * 60 * 1000, // 7 days
};
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
};
// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
    MAX_BUNDLE_SIZE: 500, // KB
    MAX_INITIAL_LOAD_TIME: 3000, // 3 seconds
    MAX_API_RESPONSE_TIME: 2000, // 2 seconds
    MAX_COMPONENTS_PER_CHUNK: 20,
    LAZY_LOAD_THRESHOLD: 100, // KB
};
//# sourceMappingURL=constants.js.map