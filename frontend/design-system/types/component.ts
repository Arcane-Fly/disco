/**
 * Design System: Component Types
 * 
 * Shared type definitions for UI components.
 */

import { ReactNode } from 'react';

/**
 * Base props that all components should accept
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Inline styles (use sparingly, prefer className) */
  style?: React.CSSProperties;
  /** Children elements */
  children?: ReactNode;
  /** Data attributes for testing */
  'data-testid'?: string;
}

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component color variants
 */
export type ComponentVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

/**
 * Loading state
 */
export interface LoadingState {
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * Disabled state
 */
export interface DisabledState {
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Common interactive element props
 */
export interface InteractiveProps extends BaseComponentProps, LoadingState, DisabledState {
  onClick?: (event: React.MouseEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}
