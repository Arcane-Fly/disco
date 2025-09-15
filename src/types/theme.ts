/**
 * Centralized Theme System
 * DRY Principle: Consolidates theme definitions scattered across components
 * 
 * Previously found scattered in:
 * - src/components/UltimateMCPDashboard.tsx
 * - src/components/ui/Button.tsx
 * - src/components/ui/Card.tsx
 * - src/components/ui/Input.tsx
 * - Individual component style objects
 */

// Base color palette
export const colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Secondary colors
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff', 
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  },

  // Status colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7', 
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', 
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // Dark theme colors
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};

// Spacing system
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  40: '10rem',   // 160px
  48: '12rem',   // 192px
  56: '14rem',   // 224px
  64: '16rem'    // 256px
};

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px  
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem'       // 128px
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  }
};

// Border radius system
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

// Shadow system
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

// Animation system
export const animations = {
  transition: {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    default: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms'
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Light theme configuration
export const lightTheme = {
  colors: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],
    secondary: colors.secondary[500], 
    secondaryHover: colors.secondary[600],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    
    // Background colors
    background: colors.gray[50],
    surface: '#ffffff',
    surfaceHover: colors.gray[50],
    overlay: 'rgba(0, 0, 0, 0.6)',
    
    // Text colors
    textPrimary: colors.gray[900],
    textSecondary: colors.gray[600],
    textTertiary: colors.gray[400],
    textInverse: '#ffffff',
    
    // Border colors
    border: colors.gray[200],
    borderHover: colors.gray[300],
    borderFocus: colors.primary[300],
    
    // Component specific
    cardBackground: '#ffffff',
    cardBorder: colors.gray[200],
    inputBackground: '#ffffff',
    inputBorder: colors.gray[300],
    buttonPrimary: colors.primary[500],
    buttonSecondary: colors.gray[100]
  },
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    surface: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
  }
};

// Dark theme configuration
export const darkTheme = {
  colors: {
    primary: colors.primary[400],
    primaryHover: colors.primary[300],
    primaryActive: colors.primary[500],
    secondary: colors.secondary[400],
    secondaryHover: colors.secondary[300],
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.error[400],
    
    // Background colors
    background: '#0f1419',
    surface: '#1a1f2e',
    surfaceHover: '#252a3a',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    // Text colors
    textPrimary: colors.gray[100],
    textSecondary: colors.gray[300],
    textTertiary: colors.gray[500],
    textInverse: colors.gray[900],
    
    // Border colors
    border: colors.gray[700],
    borderHover: colors.gray[600],
    borderFocus: colors.primary[400],
    
    // Component specific
    cardBackground: '#1a1f2e',
    cardBorder: colors.gray[700],
    inputBackground: '#252a3a',
    inputBorder: colors.gray[600],
    buttonPrimary: colors.primary[500],
    buttonSecondary: colors.gray[700]
  },
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    surface: 'linear-gradient(145deg, #1a1f2e 0%, #252a3a 100%)'
  }
};

// Theme type definition
export type Theme = typeof lightTheme;

// Complete theme configuration
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animations,
  light: lightTheme,
  dark: darkTheme
};

// Theme utilities
export const getTheme = (isDark: boolean): Theme['light'] | Theme['dark'] => {
  return isDark ? darkTheme : lightTheme;
};

// CSS custom properties generator
export const generateCSSCustomProperties = (currentTheme: Theme['light'] | Theme['dark']) => {
  const cssVars: Record<string, string> = {};
  
  // Generate color variables
  Object.entries(currentTheme.colors).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value;
  });
  
  // Generate gradient variables
  Object.entries(currentTheme.gradients).forEach(([key, value]) => {
    cssVars[`--gradient-${key}`] = value;
  });
  
  // Generate spacing variables
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });
  
  // Generate typography variables
  Object.entries(typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });
  
  return cssVars;
};