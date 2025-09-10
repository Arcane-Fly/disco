/**
 * Modern Card Component - Phase 1 Implementation
 * Based on shadcn/ui patterns with enhanced accessibility
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const cardVariants = {
  default: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  outlined: {
    background: '#ffffff',
    border: '2px solid #e2e8f0',
    boxShadow: 'none'
  },
  elevated: {
    background: '#ffffff',
    border: 'none',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
  }
};

const cardPadding = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px'
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  children,
  ...props
}, ref) => {
  const variantStyles = cardVariants[variant];
  
  return (
    <motion.div
      ref={ref}
      style={{
        ...variantStyles,
        padding: cardPadding[padding],
        borderRadius: '8px',
        transition: 'all 0.2s ease'
      }}
      whileHover={{ y: -2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;