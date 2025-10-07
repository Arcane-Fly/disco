/**
 * Design Tokens
 * 
 * Central export for all design tokens.
 * These tokens ensure consistency across the application.
 */

export * from './colors';
export * from './spacing';
export * from './typography';

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const tokens = {
  colors,
  spacing,
  typography,
} as const;

export type DesignTokens = typeof tokens;
