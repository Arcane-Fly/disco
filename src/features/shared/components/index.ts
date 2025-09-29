/**
 * Shared Components Barrel Export
 * Central export point for all shared UI components
 */

// UI Components (only export what exists)
export { Button } from './ui/Button';
export type { ButtonProps } from './ui/Button';

export { ErrorBoundary } from './ui/ErrorBoundary';
export type { ErrorBoundaryProps } from './ui/ErrorBoundary';

// Note: Other components will be added as they are implemented
// This prevents TypeScript errors for non-existent exports