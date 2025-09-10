/**
 * Modern Input Component - Phase 1 Implementation
 */

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outlined';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      style={{
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s'
      }}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;