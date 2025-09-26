/**
 * Modern Input Component - Phase 1 Implementation
 * DRY Refactored: Uses centralized theme system
 */

import React, { forwardRef, useState } from 'react';
import { theme, getTheme } from '../../../types/theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  label?: string;
  helperText?: string;
  darkMode?: boolean;
}

// Design tokens using centralized theme system
const getInputVariants = (isDark: boolean = false, isFocused: boolean = false, hasError: boolean = false) => {
  const currentTheme = getTheme(isDark);
  
  return {
    default: {
      background: currentTheme.colors.inputBackground,
      border: `1px solid ${hasError ? currentTheme.colors.error : isFocused ? currentTheme.colors.borderFocus : currentTheme.colors.inputBorder}`,
      color: currentTheme.colors.textPrimary,
      '&:hover': {
        borderColor: hasError ? currentTheme.colors.error : currentTheme.colors.borderHover
      }
    },
    outlined: {
      background: 'transparent',
      border: `2px solid ${hasError ? currentTheme.colors.error : isFocused ? currentTheme.colors.borderFocus : currentTheme.colors.inputBorder}`,
      color: currentTheme.colors.textPrimary
    }
  };
};

const getInputSizes = () => ({
  sm: {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    fontSize: theme.typography.fontSize.sm,
    height: '32px'
  },
  md: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    height: '40px'
  },
  lg: {
    padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
    fontSize: theme.typography.fontSize.lg,
    height: '48px'
  }
});

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  error = false,
  label,
  helperText,
  darkMode = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const currentTheme = getTheme(darkMode);
  const variants = getInputVariants(darkMode, isFocused, error);
  const sizes = getInputSizes();
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  const inputStyle = {
    ...sizeStyles,
    background: variantStyles.background,
    border: variantStyles.border,
    color: variantStyles.color,
    borderRadius: theme.borderRadius.md,
    fontFamily: 'inherit',
    outline: 'none',
    transition: theme.animations.transition.all,
    width: '100%',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    '::placeholder': {
      color: currentTheme.colors.textTertiary
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label 
          style={{
            display: 'block',
            marginBottom: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: error ? currentTheme.colors.error : currentTheme.colors.textPrimary
          }}
        >
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        style={inputStyle}
        disabled={disabled}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        aria-invalid={error}
        aria-describedby={helperText ? `${props.id}-help` : undefined}
        {...props}
      />
      
      {helperText && (
        <p
          id={`${props.id}-help`}
          style={{
            marginTop: theme.spacing[1],
            fontSize: theme.typography.fontSize.xs,
            color: error ? currentTheme.colors.error : currentTheme.colors.textSecondary
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;