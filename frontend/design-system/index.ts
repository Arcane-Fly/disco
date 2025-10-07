/**
 * Design System
 * 
 * Centralized design system exports.
 * Import from '@/design-system' to access tokens, types, and utilities.
 * 
 * @example
 * ```ts
 * import { tokens, ComponentSize, EntityId } from '@/design-system';
 * 
 * // Use design tokens
 * const buttonColor = tokens.colors.brand.primary;
 * 
 * // Use type definitions
 * type MySize = ComponentSize;
 * type MyId = EntityId;
 * ```
 */

// Export all design tokens
export * from './tokens';

// Export all type definitions
export * from './types';

// Re-export for convenience
import { tokens } from './tokens';
export { tokens };
