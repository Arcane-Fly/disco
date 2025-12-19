/**
 * Middleware Barrel Export
 * 
 * Centralized exports for all Express middleware functions.
 * Middleware should follow the Express middleware signature.
 */

// Authentication middleware
export * from './auth.js';
export * from './enhanced-auth.js';
export * from './flexibleAuth.js';
export * from './sessionValidator.js';

// Security middleware
export * from './csp.js';
export * from './security-headers.js';
export * from './securityAudit.js';

// Request handling
export * from './errorHandler.js';
export * from './request-logger.js';
export * from './validation.js';
export * from './performance.js';
export * from './favicon.js';
