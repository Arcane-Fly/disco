/**
 * Design Tokens: Colors
 * 
 * Centralized color definitions for the design system.
 * Based on CSS custom properties defined in globals.css
 */

export const colors = {
  brand: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
  },
  background: {
    primary: 'var(--color-background)',
    secondary: 'var(--color-background-secondary)',
    tertiary: 'var(--color-background-tertiary)',
  },
  text: {
    primary: 'var(--color-text)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
  },
  border: {
    default: 'var(--color-border)',
    focus: 'var(--color-border-focus)',
  },
  status: {
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    info: 'var(--color-info)',
  },
} as const;

export type ColorToken = typeof colors;
