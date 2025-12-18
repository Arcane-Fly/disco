/**
 * Modern UI Component Library - Phase 1 Implementation
 * Based on shadcn/ui architecture patterns with enhanced AI capabilities
 * Follows the improvement roadmap specifications
 */

export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';

// Enhanced loading and state components
export { Skeleton, SkeletonText, SkeletonCard } from './Skeleton';
export type { SkeletonProps, SkeletonTextProps, SkeletonCardProps } from './Skeleton';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

// Toast notifications
export { Toast, ToastProvider, useToast } from './Toast';
export type { ToastProps, ToastType } from './Toast';

// Placeholder components (to be implemented)
export {
  Badge,
  Tooltip,
  NodeConnector,
  Grid,
  Container,
  Sidebar,
  Chart,
  MetricCard,
  ProgressIndicator,
  CodeGenerator,
  SmartSuggestions,
} from './placeholders';

// Advanced components for workflow building
export { DragDropProvider } from './DragDropProvider';
export { WorkflowNode } from './WorkflowNode';

// AI-powered components - Simplified for Phase 1
export { AIAssistant } from './AIAssistant';
