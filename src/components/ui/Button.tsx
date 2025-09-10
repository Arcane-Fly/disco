/**
 * Modern Button Component - Phase 1 Implementation
 * Based on shadcn/ui patterns with enhanced accessibility and animations
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Button variant definitions following design system
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Design tokens following modern design system principles
const buttonVariants = {
  default: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#ffffff',
    border: '1px solid transparent',
    '&:hover': {
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
    '&:focus': {
      outline: 'none',
      ring: '2px solid #60a5fa',
      ringOffset: '2px'
    }
  },
  destructive: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    border: '1px solid transparent',
    '&:hover': {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    }
  },
  outline: {
    background: 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    '&:hover': {
      background: '#f9fafb',
      color: '#111827'
    }
  },
  secondary: {
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid transparent',
    '&:hover': {
      background: '#e5e7eb'
    }
  },
  ghost: {
    background: 'transparent',
    color: '#374151',
    border: '1px solid transparent',
    '&:hover': {
      background: '#f3f4f6'
    }
  },
  link: {
    background: 'transparent',
    color: '#3b82f6',
    border: 'none',
    textDecoration: 'underline',
    '&:hover': {
      color: '#1d4ed8'
    }
  }
};

const buttonSizes = {
  default: {
    height: '40px',
    padding: '0 16px',
    fontSize: '14px',
    borderRadius: '6px'
  },
  sm: {
    height: '32px',
    padding: '0 12px',
    fontSize: '13px',
    borderRadius: '4px'
  },
  lg: {
    height: '48px',
    padding: '0 24px',
    fontSize: '16px',
    borderRadius: '8px'
  },
  icon: {
    height: '40px',
    width: '40px',
    padding: '0',
    borderRadius: '6px'
  }
};

/**
 * Modern Button component with enhanced animations and accessibility
 * Features:
 * - Multiple variants following design system
 * - Smooth micro-interactions
 * - Loading states with spinner
 * - Icon support
 * - Full accessibility compliance
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'default',
  size = 'default',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}, ref) => {
  const variantStyles = buttonVariants[variant];
  const sizeStyles = buttonSizes[size];

  const buttonStyle = {
    ...sizeStyles,
    background: variantStyles.background,
    color: variantStyles.color,
    border: variantStyles.border,
    fontWeight: 500,
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