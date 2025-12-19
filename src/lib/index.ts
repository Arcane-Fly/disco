/**
 * Library Barrel Export
 * 
 * Centralized exports for all library modules and utilities.
 * Library functions should be pure where possible.
 */

// API utilities
export * from './api/index.js';

// Core libraries
export * from './logger.js';
export * from './guards.js';
export * from './sanitization.js';
export * from './store.js';
export * from './database.js';

// Container and execution
export * from './containerManager.js';
export * from './containerProxy.js';
export * from './terminalSessionManager.js';

// Session and state management
export * from './redisSession.js';
export * from './oauthState.js';

// Security and compliance
export * from './securityComplianceManager.js';

// Collaboration and team management
export * from './collaborationManager.js';
export * from './teamCollaborationManager.js';
// Note: conflictResolver is already exported via collaborationManager

// Performance and optimization
export * from './performanceOptimizer.js';
export * from './memoryMonitor.js';
export * from './memoryUtils.js';

// Enhancement and automation
export * from './mcpEnhancementEngine.js';
export * from './codeQualityEnhancer.js';
export * from './browserAutomation.js';
export * from './enhanced-browser.js';
// Note: enhanced-ux-automation shares types with store, avoid duplicate exports
export * from './enhanced-rag.js';

// Validation and contracts
export * from './contractValidator.js';

// PocketFlow
export * from './pocketflow.js';

// A2A (Agent-to-Agent)
export * from './a2a-client.js';
export * from './a2a-server.js';

// OpenAPI
export * from './openapi.js';
