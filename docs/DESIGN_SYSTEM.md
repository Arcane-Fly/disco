# Design System Documentation

**Last Updated**: 2025-10-07  
**Status**: ✅ Active  
**Storybook**: Run `yarn storybook` to view component library

---

## Overview

The Disco Design System provides a centralized collection of design tokens, type definitions, and UI components that ensure consistency across the application.

### Key Principles

1. **Consistency**: All components use standardized tokens for colors, spacing, and typography
2. **Type Safety**: Shared TypeScript types prevent errors and improve developer experience
3. **Documentation**: Every component is documented in Storybook with live examples
4. **Accessibility**: WCAG AA compliance maintained across all components
5. **DRY Principle**: Reusable patterns reduce code duplication

---

## Structure

```
frontend/
├── design-system/
│   ├── tokens/           # Design tokens (colors, spacing, typography)
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── types/            # Shared TypeScript types
│   │   ├── component.ts  # Component prop types
│   │   ├── common.ts     # Common types (EntityId, Timestamp, etc.)
│   │   └── index.ts
│   └── index.ts          # Main export
├── components/           # UI components with stories
│   └── ui/
│       ├── Button/
│       │   ├── Button.tsx
│       │   ├── Button.stories.tsx
│       │   └── index.ts
│       └── ...
└── .storybook/           # Storybook configuration
    ├── main.ts
    └── preview.ts
```

---

## Design Tokens

Design tokens are the visual design atoms of the design system. They store values like colors, spacing, and typography that can be reused across components.

### Colors

All colors are defined as CSS custom properties and exposed through the `colors` token object:

```typescript
import { colors } from '@/design-system';

// Brand colors
colors.brand.primary    // var(--color-primary)
colors.brand.secondary  // var(--color-secondary)
colors.brand.accent     // var(--color-accent)

// Background colors
colors.background.primary   // var(--color-background)
colors.background.secondary // var(--color-background-secondary)
colors.background.tertiary  // var(--color-background-tertiary)

// Text colors
colors.text.primary   // var(--color-text)
colors.text.secondary // var(--color-text-secondary)
colors.text.muted     // var(--color-text-muted)

// Border colors
colors.border.default // var(--color-border)
colors.border.focus   // var(--color-border-focus)

// Status colors
colors.status.success // var(--color-success)
colors.status.warning // var(--color-warning)
colors.status.error   // var(--color-error)
colors.status.info    // var(--color-info)
```

### Spacing

Consistent spacing ensures visual harmony:

```typescript
import { spacing } from '@/design-system';

spacing.xs   // 0.25rem (4px)
spacing.sm   // 0.5rem (8px)
spacing.md   // 1rem (16px)
spacing.lg   // 1.5rem (24px)
spacing.xl   // 2rem (32px)
spacing['2xl'] // 3rem (48px)
spacing['3xl'] // 4rem (64px)
spacing['4xl'] // 6rem (96px)
```

### Typography

Typography tokens for consistent text styling:

```typescript
import { typography } from '@/design-system';

// Font families
typography.fontFamily.sans // System sans-serif
typography.fontFamily.mono // Monospace

// Font sizes
typography.fontSize.xs   // 0.75rem (12px)
typography.fontSize.sm   // 0.875rem (14px)
typography.fontSize.base // 1rem (16px)
typography.fontSize.lg   // 1.125rem (18px)
typography.fontSize.xl   // 1.25rem (20px)
typography.fontSize['2xl'] // 1.5rem (24px)
typography.fontSize['3xl'] // 1.875rem (30px)
typography.fontSize['4xl'] // 2.25rem (36px)

// Font weights
typography.fontWeight.normal   // 400
typography.fontWeight.medium   // 500
typography.fontWeight.semibold // 600
typography.fontWeight.bold     // 700

// Line heights
typography.lineHeight.tight   // 1.25
typography.lineHeight.normal  // 1.5
typography.lineHeight.relaxed // 1.75
```

---

## Type Definitions

The design system provides shared TypeScript types to ensure consistency and type safety.

### Component Types

Base types that all components should extend:

```typescript
import { 
  BaseComponentProps, 
  ComponentSize, 
  ComponentVariant,
  InteractiveProps,
  LoadingState,
  DisabledState 
} from '@/design-system';

// Base props for all components
interface MyComponentProps extends BaseComponentProps {
  // Your component-specific props
}

// For interactive components (buttons, links, etc.)
interface MyInteractiveProps extends InteractiveProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
}
```

### Common Types

Standard types for common patterns:

```typescript
import { 
  EntityId,
  Timestamp,
  ISODateString,
  URLString,
  EmailAddress,
  Status,
  ApiResponse,
  PaginatedResponse 
} from '@/design-system';

// Entity identifiers (always use EntityId, not 'string')
const userId: EntityId = 'user_123';

// Timestamps (Unix timestamp in milliseconds)
const createdAt: Timestamp = Date.now();

// ISO date strings
const isoDate: ISODateString = new Date().toISOString();

// API responses
interface UserResponse extends ApiResponse<User> {
  // Includes: success, data, error, message
}

// Paginated responses
interface UsersResponse extends PaginatedResponse<User> {
  // Includes: success, data, error, message, meta (pagination)
}
```

---

## Using Storybook

Storybook is an interactive component library where you can view, test, and document components in isolation.

### Starting Storybook

```bash
# Development mode (with hot reload)
yarn storybook

# Build static Storybook for deployment
yarn build-storybook
```

Storybook will open at [http://localhost:6006](http://localhost:6006)

### Creating Stories

Every component should have a corresponding `.stories.tsx` file:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

---

## Component Guidelines

### Naming Conventions

- **Components**: PascalCase (e.g., `Button`, `Card`, `Modal`)
- **Props interfaces**: `{ComponentName}Props` (e.g., `ButtonProps`)
- **Variants**: lowercase strings (e.g., `'primary'`, `'secondary'`)
- **Sizes**: lowercase strings (e.g., `'sm'`, `'md'`, `'lg'`)

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { cn } from '@/utils/cn';
import { BaseComponentProps, ComponentSize } from '@/design-system';

// 2. Props interface
interface MyComponentProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary';
  size?: ComponentSize;
}

// 3. Component with forwardRef (if needed)
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('base-styles', variantStyles[variant], className)}
        {...props}
      />
    );
  }
);

// 4. Display name
MyComponent.displayName = 'MyComponent';

// 5. Export
export { MyComponent, type MyComponentProps };
```

### Accessibility

All components must maintain WCAG AA compliance:

- ✅ Keyboard navigation support
- ✅ ARIA labels and attributes
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Focus indicators
- ✅ Screen reader compatibility

---

## Best Practices

### 1. Use Design Tokens

❌ **Don't:**
```typescript
<div style={{ color: '#4dcce5', padding: '16px' }}>
```

✅ **Do:**
```typescript
import { colors, spacing } from '@/design-system';

<div style={{ color: colors.brand.primary, padding: spacing.md }}>
```

### 2. Use Type Definitions

❌ **Don't:**
```typescript
interface User {
  id: string;
  createdAt: number;
}
```

✅ **Do:**
```typescript
import { EntityId, Timestamp } from '@/design-system';

interface User {
  id: EntityId;
  createdAt: Timestamp;
}
```

### 3. Extend Base Component Props

❌ **Don't:**
```typescript
interface ButtonProps {
  onClick?: () => void;
  className?: string;
  // ... repeat common props
}
```

✅ **Do:**
```typescript
import { InteractiveProps } from '@/design-system';

interface ButtonProps extends InteractiveProps {
  variant?: 'primary' | 'secondary';
}
```

### 4. Document with Storybook

Every component should have:
- ✅ At least one story per variant/state
- ✅ JSDoc comments for props
- ✅ Usage examples
- ✅ ArgTypes for interactive controls

---

## Migration Guide

### Adopting Design Tokens

1. **Identify hardcoded values** in your components
2. **Replace with tokens** from `@/design-system`
3. **Test in both light and dark themes**
4. **Update Storybook stories** if needed

Example:

```typescript
// Before
const Button = () => (
  <button style={{ 
    backgroundColor: '#4dcce5',
    padding: '8px 16px',
    fontSize: '14px' 
  }}>
    Click me
  </button>
);

// After
import { colors, spacing, typography } from '@/design-system';

const Button = () => (
  <button style={{ 
    backgroundColor: colors.brand.primary,
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.sm 
  }}>
    Click me
  </button>
);
```

### Adopting Type Definitions

1. **Import shared types** instead of defining locally
2. **Extend base types** for component props
3. **Use EntityId** instead of generic `string` for IDs
4. **Use Timestamp** instead of `number` for timestamps

---

## Resources

### Internal Documentation

- [Component Examples](/frontend/components/ui) - Browse existing components
- [Storybook](http://localhost:6006) - Interactive component library
- [Tailwind Config](/frontend/tailwind.config.js) - Utility class configuration

### External Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [TypeScript Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)

---

## Maintenance

### When to Update

- **Adding new colors**: Update `frontend/design-system/tokens/colors.ts`
- **Adding new spacing**: Update `frontend/design-system/tokens/spacing.ts`
- **Adding new types**: Update appropriate file in `frontend/design-system/types/`
- **Creating new components**: Always create a `.stories.tsx` file

### Review Schedule

- Monthly: Review token usage and identify inconsistencies
- Quarterly: Audit accessibility compliance
- Per PR: Verify new components have Storybook stories

---

## Contact & Support

**For Questions**:
- Review this documentation
- Check Storybook for component examples
- Consult existing component implementations

**For Additions**:
- Add new tokens to appropriate files in `frontend/design-system/tokens/`
- Add new types to appropriate files in `frontend/design-system/types/`
- Create Storybook stories for all new components

---

**Status**: ✅ Active and maintained  
**Last Review**: 2025-10-07  
**Next Review**: 2025-11-07 (1 month)
