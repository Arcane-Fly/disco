/**
 * Modern Card Component - Phase 1 Implementation
 * Based on shadcn/ui patterns with enhanced accessibility
 * DRY Refactored: Uses centralized theme system
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { theme, getTheme } from '../../types/theme';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  darkMode?: boolean;
}

// Design tokens using centralized theme system
const getCardVariants = (isDark: boolean = false) => {
  const currentTheme = getTheme(isDark);
  
  return {
    default: {
      background: currentTheme.colors.cardBackground,
      border: `1px solid ${currentTheme.colors.cardBorder}`,
      boxShadow: theme.shadows.sm
    },
    outlined: {
      background: currentTheme.colors.cardBackground,
      border: `2px solid ${currentTheme.colors.borderHover}`,
      boxShadow: 'none'
    },
    elevated: {
      background: currentTheme.colors.cardBackground,
      border: 'none',
      boxShadow: theme.shadows.xl
    }
  };
};

const cardPadding = {
  none: theme.spacing[0],
  sm: theme.spacing[3],
  md: theme.spacing[4],
  lg: theme.spacing[6]
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  darkMode = false,
  children,
  ...props
}, ref) => {
  const variants = getCardVariants(darkMode);
  const variantStyles = variants[variant];
  
  return (
    <motion.div
      ref={ref}
      style={{
        ...variantStyles,
        padding: cardPadding[padding],
        borderRadius: theme.borderRadius.lg,
        transition: theme.animations.transition.all,
        color: getTheme(darkMode).colors.textPrimary
      }}
      whileHover={{ y: -2, boxShadow: theme.shadows.lg }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;