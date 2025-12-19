/**
 * API Routes Barrel Export
 * 
 * Centralized exports for all API route handlers.
 * This follows DRY principles and provides a single import point for API routes.
 */

// Core API routes
export * from './health.js';
export * from './auth.js';
export * from './session.js';

// Container and execution
export * from './containers.js';
export * from './terminal.js';
export * from './computer-use.js';

// File and Git operations
export * from './files.js';
export * from './git.js';

// Dashboard and monitoring
export * from './dashboard.js';
export * from './dashboard-integration.js';
export * from './enhanced-dashboard.js';
export * from './performance.js';

// Team collaboration
export * from './collaboration.js';
export * from './teams.js';

// Security and compliance
export * from './security.js';
export * from './gdpr.js';

// AI and enhancement features
export * from './anthropic.js';
export * from './openai.js';
export * from './rag.js';
export * from './enhancement.js';
export * from './strategic-ux.js';

// Integration and platform
export * from './mcp.js';
export * from './mcp-a2a-integration.js';
export * from './platform-connectors.js';
export * from './providers.js';

// Demos and contracts
export * from './contract-demo.js';
