# Storybook Setup Guide

**Date**: 2025-10-07  
**Status**: ✅ Complete  
**Version**: Storybook 8.6.14 + React + Vite

---

## Overview

Storybook has been successfully configured for the Disco MCP Server project. This setup provides an interactive component library where developers can view, test, and document UI components in isolation.

---

## What Was Installed

### Core Dependencies

```json
{
  "@storybook/react": "^8.6.14",
  "@storybook/react-vite": "^8.6.14",
  "@storybook/addon-essentials": "^8.6.14",
  "@storybook/addon-interactions": "^8.6.14",
  "@storybook/addon-links": "^9.1.10",
  "@storybook/blocks": "^8.6.14",
  "@storybook/test": "^8.6.14",
  "storybook": "^9.1.10",
  "vite": "^6.2.3"
}
```

### Configuration Files

1. **`.storybook/main.ts`** - Main Storybook configuration
   - Stories location: `frontend/components/**/*.stories.@(js|jsx|mjs|ts|tsx)`
   - Addons: links, essentials, interactions
   - Framework: React + Vite
   - Path aliases configured for imports

2. **`.storybook/preview.ts`** - Preview configuration
   - Global styles imported from `frontend/styles/globals.css`
   - Theme switcher (light/dark)
   - Background options
   - Control matchers for color and date

---

## Design System Structure

### Directory Layout

```
frontend/
├── design-system/
│   ├── tokens/
│   │   ├── colors.ts      # Color tokens
│   │   ├── spacing.ts     # Spacing tokens
│   │   ├── typography.ts  # Typography tokens
│   │   └── index.ts       # Token exports
│   ├── types/
│   │   ├── component.ts   # Component type definitions
│   │   ├── common.ts      # Common type definitions
│   │   └── index.ts       # Type exports
│   ├── index.ts           # Main design system export
│   └── README.md          # Design system documentation
└── components/
    └── ui/
        └── Button/
            ├── Button.tsx          # Component implementation
            ├── Button.stories.tsx  # Storybook stories
            └── index.ts            # Component export
```

### Design Tokens

**Colors** (`frontend/design-system/tokens/colors.ts`):
- Brand colors (primary, secondary, accent)
- Background colors (primary, secondary, tertiary)
- Text colors (primary, secondary, muted)
- Border colors (default, focus)
- Status colors (success, warning, error, info)

**Spacing** (`frontend/design-system/tokens/spacing.ts`):
- Consistent spacing scale from xs (4px) to 4xl (96px)

**Typography** (`frontend/design-system/tokens/typography.ts`):
- Font families (sans, mono)
- Font sizes (xs to 4xl)
- Font weights (normal, medium, semibold, bold)
- Line heights (tight, normal, relaxed)

### Type Definitions

**Component Types** (`frontend/design-system/types/component.ts`):
- `BaseComponentProps` - Base props for all components
- `ComponentSize` - Standard size variants
- `ComponentVariant` - Standard color variants
- `InteractiveProps` - Props for interactive elements
- `LoadingState` - Loading state interface
- `DisabledState` - Disabled state interface

**Common Types** (`frontend/design-system/types/common.ts`):
- `EntityId` - Type for entity identifiers (always use instead of generic `string`)
- `Timestamp` - Unix timestamp in milliseconds
- `ISODateString` - ISO 8601 date strings
- `URLString` - URL strings
- `EmailAddress` - Email addresses
- `Status` - Generic status type
- `ApiResponse<T>` - API response wrapper
- `PaginatedResponse<T>` - Paginated API response

---

## Usage

### Starting Storybook

```bash
# Development mode with hot reload
yarn storybook

# Build static Storybook for deployment
yarn build-storybook
```

Storybook will be available at [http://localhost:6006](http://localhost:6006)

### Importing Design Tokens

```typescript
import { colors, spacing, typography } from '@/design-system';

// Use in components
const MyComponent = () => (
  <div style={{
    color: colors.text.primary,
    padding: spacing.md,
    fontSize: typography.fontSize.base
  }}>
    Content
  </div>
);
```

### Using Type Definitions

```typescript
import { EntityId, ComponentSize, BaseComponentProps } from '@/design-system';

// Define entity types
interface User {
  id: EntityId;  // Instead of string
  name: string;
  createdAt: Timestamp;  // Instead of number
}

// Extend base component props
interface MyComponentProps extends BaseComponentProps {
  size?: ComponentSize;
  variant?: 'primary' | 'secondary';
}
```

### Creating Stories

```typescript
// MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'UI/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'My Component',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};
```

---

## Example Component: Button

A complete Button component with Storybook stories has been created as a reference:

**Location**: `frontend/components/ui/Button/`

**Stories Include**:
- All variants (primary, secondary, outline, ghost, destructive)
- All sizes (sm, md, lg, xl)
- Loading state
- Disabled state
- With icons (left and right)
- Showcase of all variants

**View in Storybook**: Navigate to `UI > Button` after starting Storybook

---

## Package.json Scripts

The following scripts have been added:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## Benefits

### 1. Component Documentation
- Live, interactive component examples
- Automatically generated documentation from TypeScript types
- Visual regression testing support

### 2. Design System Consistency
- Centralized design tokens ensure visual consistency
- Shared type definitions prevent errors
- Reusable patterns reduce code duplication

### 3. Developer Experience
- Isolated component development
- Hot reload for instant feedback
- Type safety with TypeScript
- Accessibility testing with addons

### 4. Team Collaboration
- Designers can review components without running the full app
- Product managers can preview features early
- QA can test components in all states

---

## Integration with Existing Project

Storybook is fully integrated with:

- ✅ **Nx**: Uses existing Nx configuration
- ✅ **TypeScript**: Strict type checking enabled
- ✅ **Tailwind CSS**: All utility classes available
- ✅ **Next.js**: Compatible with existing Next.js setup
- ✅ **ESLint**: Follows project linting rules
- ✅ **Build System**: Doesn't interfere with production builds

---

## Next Steps

### 1. Create Stories for Existing Components

Recommended order:
1. ✅ Button (already complete)
2. Card (`frontend/components/ui/Card/`)
3. Analytics (`frontend/components/ui/Analytics/`)
4. ThemeToggle (`frontend/components/ui/ThemeToggle/`)
5. ErrorBoundary (`frontend/components/ui/ErrorBoundary/`)
6. Skeleton (`frontend/components/ui/Skeleton/`)

### 2. Adopt Design Tokens

- Replace hardcoded colors with `colors` tokens
- Replace magic numbers with `spacing` tokens
- Use `typography` tokens for text styling

### 3. Use Type Definitions

- Replace generic `string` with `EntityId` for IDs
- Replace `number` with `Timestamp` for timestamps
- Extend `BaseComponentProps` for all components

### 4. Document Best Practices

- Add component usage guidelines
- Create style guide documentation
- Document naming conventions

---

## Resources

### Documentation

- [Storybook Docs](https://storybook.js.org/docs) - Official Storybook documentation
- [Design System Guide](/docs/DESIGN_SYSTEM.md) - Complete design system documentation
- [Component Examples](/frontend/components/ui) - Existing component implementations

### Tools

- Storybook Dev Server: `http://localhost:6006`
- Interactive Controls: Test component props in real-time
- Docs Tab: Auto-generated documentation from TypeScript

### References

- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Design token format
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/) - Design tokens spec
- [Storybook Best Practices](https://storybook.js.org/docs/writing-stories/best-practices)

---

## Troubleshooting

### Storybook Won't Start

```bash
# Clear caches
rm -rf node_modules/.cache
yarn cache clean

# Reinstall dependencies
yarn install --immutable

# Try again
yarn storybook
```

### TypeScript Errors

```bash
# Ensure types are installed
yarn add -D @types/react @types/node

# Check tsconfig.json includes Storybook paths
```

### Stories Not Showing

- Check file extension: Must be `.stories.tsx` or `.stories.ts`
- Check location: Must be in `frontend/components/**/*.stories.tsx`
- Restart Storybook dev server

---

## Maintenance

### Regular Tasks

- **Weekly**: Create stories for new components
- **Monthly**: Review and update design tokens
- **Quarterly**: Audit component accessibility

### Version Updates

```bash
# Update Storybook and related packages
yarn upgrade-interactive --latest
```

---

**Status**: ✅ Setup Complete  
**Documentation**: `/docs/DESIGN_SYSTEM.md`  
**Example Component**: `/frontend/components/ui/Button/`  
**Ready for**: Component development and documentation
