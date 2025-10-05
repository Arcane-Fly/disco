/**
 * Application Configuration
 * Centralized configuration management for the application
 */
import { API_CONFIG, AUTH_CONFIG, THEME_CONFIG } from './constants';
// Environment detection
export const getEnvironment = () => {
    if (typeof window === 'undefined') {
        return process.env.NODE_ENV || 'development';
    }
    // Client-side environment detection
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    if (hostname.includes('staging') || hostname.includes('preview')) {
        return 'staging';
    }
    if (hostname.includes('test')) {
        return 'test';
    }
    return 'production';
};
// Current environment
export const ENV = getEnvironment();
// Is development environment
export const isDevelopment = ENV === 'development';
// Is production environment
export const isProduction = ENV === 'production';
// Base application configuration
export const config = {
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
    },
    auth: {
        tokenKey: AUTH_CONFIG.TOKEN_KEY,
        refreshTokenKey: AUTH_CONFIG.REFRESH_TOKEN_KEY,
        tokenExpiry: AUTH_CONFIG.TOKEN_EXPIRY,
    },
    features: {
        analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        collaboration: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
        workflow: process.env.NEXT_PUBLIC_ENABLE_WORKFLOW === 'true',
    },
    ui: {
        theme: process.env.NEXT_PUBLIC_DEFAULT_THEME || THEME_CONFIG.DEFAULT_THEME,
        animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== 'false',
        compactMode: process.env.NEXT_PUBLIC_COMPACT_MODE === 'true',
    },
};
// Logger configuration
export const getLogLevel = () => {
    const level = process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL;
    switch (level) {
        case 'debug':
        case 'info':
        case 'warn':
        case 'error':
        case 'fatal':
            return level;
        default:
            return isDevelopment ? 'debug' : 'info';
    }
};
// Database configuration (server-side only)
export const getDatabaseUrl = () => {
    return process.env.DATABASE_URL || 'sqlite://./data/app.db';
};
// Redis configuration (server-side only)
export const getRedisUrl = () => {
    return process.env.REDIS_URL || 'redis://localhost:6379';
};
// WebSocket configuration
export const getWebSocketUrl = () => {
    const protocol = isProduction ? 'wss' : 'ws';
    const host = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:3001';
    return `${protocol}://${host}`;
};
// Feature flag helper
export const isFeatureEnabled = (feature) => {
    return config.features[feature];
};
// API endpoints configuration
export const API_ENDPOINTS = {
    // Authentication
    AUTH_LOGIN: '/api/v1/auth/login',
    AUTH_LOGOUT: '/api/v1/auth/logout',
    AUTH_REFRESH: '/api/v1/auth/refresh',
    AUTH_PROFILE: '/api/v1/auth/profile',
    // Containers
    CONTAINERS: '/api/v1/containers',
    CONTAINER_DETAILS: (id) => `/api/v1/containers/${id}`,
    CONTAINER_START: (id) => `/api/v1/containers/${id}/start`,
    CONTAINER_STOP: (id) => `/api/v1/containers/${id}/stop`,
    // Files
    FILES: '/api/v1/files',
    FILE_CONTENT: (path) => `/api/v1/files/content?path=${encodeURIComponent(path)}`,
    FILE_UPLOAD: '/api/v1/files/upload',
    FILE_DOWNLOAD: (path) => `/api/v1/files/download?path=${encodeURIComponent(path)}`,
    // Git
    GIT_STATUS: '/api/v1/git/status',
    GIT_COMMIT: '/api/v1/git/commit',
    GIT_PUSH: '/api/v1/git/push',
    GIT_PULL: '/api/v1/git/pull',
    // Terminal
    TERMINAL_SESSIONS: '/api/v1/terminal/sessions',
    TERMINAL_SESSION: (id) => `/api/v1/terminal/sessions/${id}`,
    // Health
    HEALTH: '/api/health',
    HEALTH_DETAILED: '/api/health/detailed',
};
// CORS configuration
export const getCorsConfig = () => ({
    origin: isDevelopment
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : [process.env.NEXT_PUBLIC_FRONTEND_URL].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
// Security configuration
export const SECURITY_CONFIG = {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-development',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    sessionSecret: process.env.SESSION_SECRET || 'fallback-session-secret',
};
// Validation helper
export const validateConfig = () => {
    const required = [
        'NEXT_PUBLIC_API_URL',
        'JWT_SECRET',
        'SESSION_SECRET',
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0 && isProduction) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (isDevelopment && missing.length > 0) {
        console.warn('⚠️ Missing optional environment variables:', missing.join(', '));
    }
};
// Initialize configuration validation
if (typeof process !== 'undefined') {
    validateConfig();
}
//# sourceMappingURL=config.js.map