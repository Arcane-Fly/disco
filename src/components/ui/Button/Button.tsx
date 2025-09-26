/**
 * Modern Button Component - Phase 1 Implementation
 * Based on shadcn/ui patterns with enhanced accessibility and animations
 * DRY Refactored: Uses centralized theme system
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { theme, getTheme } from '../../../types/theme';

// Button variant definitions following design system
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  darkMode?: boolean;
}

// Design tokens using centralized theme system
const getButtonVariants = (isDark: boolean = false) => {
  const currentTheme = getTheme(isDark);
  
  return {
    default: {
      background: currentTheme.gradients.primary,
      color: currentTheme.colors.textInverse,
      border: '1px solid transparent',
      '&:hover': {
        background: currentTheme.gradients.primary,
        boxShadow: theme.shadows.lg,
        filter: 'brightness(110%)'
      },
      '&:focus': {
        outline: 'none',
        ring: `2px solid ${currentTheme.colors.primaryHover}`,
        ringOffset: '2px'
      }
    },
    destructive: {
      background: currentTheme.gradients.error,
      color: currentTheme.colors.textInverse,
      border: '1px solid transparent',
      '&:hover': {
        background: currentTheme.gradients.error,
        filter: 'brightness(110%)'
      }
    },
    outline: {
      background: 'transparent',
      color: currentTheme.colors.textPrimary,
      border: `1px solid ${currentTheme.colors.border}`,
      '&:hover': {
        background: currentTheme.colors.surfaceHover,
        color: currentTheme.colors.textPrimary
      }
    },
    secondary: {
      background: currentTheme.colors.buttonSecondary,
      color: currentTheme.colors.textPrimary,
      border: `1px solid ${currentTheme.colors.border}`,
      '&:hover': {
        background: currentTheme.colors.surfaceHover
      }
    },
    ghost: {
      background: 'transparent',
      color: currentTheme.colors.textSecondary,
      border: '1px solid transparent',
      '&:hover': {
        background: currentTheme.colors.surfaceHover,
        color: currentTheme.colors.textPrimary
      }
    },
    link: {
      background: 'transparent',
      color: currentTheme.colors.primary,
      border: 'none',
      textDecoration: 'underline underline-offset-4',
      '&:hover': {
        color: currentTheme.colors.primaryHover
      }
    }
  };
};

const getSizeStyles = () => ({
  default: {
    height: '40px',
    padding: `0 ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.sm,
    borderRadius: theme.borderRadius.md
  },
  sm: {
    height: '32px',
    padding: `0 ${theme.spacing[3]}`,
    fontSize: theme.typography.fontSize.xs,
    borderRadius: theme.borderRadius.sm
  },
  lg: {
    height: '48px',
    padding: `0 ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSize.base,
    borderRadius: theme.borderRadius.lg
  },
  icon: {
    height: '40px',
    width: '40px',
    padding: '0',
    borderRadius: theme.borderRadius.md
  }
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'default',
  size = 'default',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  darkMode = false,
  disabled,
  children,
  className = '',
  ...props
}, ref) => {
  const variants = getButtonVariants(darkMode);
  const sizes = getSizeStyles();
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  const buttonStyle = {
    ...sizeStyles,
    background: variantStyles.background,
    color: variantStyles.color,
    border: variantStyles.border,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: 'inherit',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid currentColor',
        borderTop: '2px solid transparent',
        borderRadius: '50%'
      }}
    />
  );

  return (
    <motion.button
      ref={ref}
      style={buttonStyle}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30
      }}
      aria-label={typeof children === 'string' ? children : undefined}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect overlay */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
          borderRadius: 'inherit',
          opacity: 0,
          pointerEvents: 'none'
        }}
        whileTap={{ opacity: 1, scale: 2 }}
        transition={{ duration: 0.3 }}
      />

      {loading && <LoadingSpinner />}
      {!loading && leftIcon && leftIcon}
      
      <span style={{ 
        position: 'relative',
        zIndex: 1,
        opacity: loading ? 0.7 : 1
      }}>
        {children}
      </span>
      
      {!loading && rightIcon && rightIcon}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;