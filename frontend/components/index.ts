/**
 * Frontend Components Barrel Export
 * 
 * Centralized exports for all top-level components.
 * Enables clean imports: import { Layout, Navigation } from '@/components'
 */

// Layout components
export { default as Layout } from './Layout';
export { default as Navigation } from './Navigation';

// Utility components
export { default as DemoBanner } from './DemoBanner';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as WebContainerCompatibilityCheck } from './WebContainerCompatibilityCheck';

// Dynamic components (for lazy loading)
export { default as DynamicComponents } from './DynamicComponents';
export { AnalyticsDashboard, WorkflowBuilder } from './DynamicComponents';

// UI components (re-export from ui directory)
export * from './ui';

// Workflow components
export * from './workflow';
