# Design System

Centralized design system for the Disco MCP Server application.

## Quick Start

```typescript
// Import design tokens
import { colors, spacing, typography } from '@/design-system';

// Use in your component
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

```typescript
// Import type definitions
import { EntityId, ComponentSize, BaseComponentProps } from '@/design-system';

// Use in your interfaces
interface User {
  id: EntityId;
  name: string;
}

interface MyComponentProps extends BaseComponentProps {
  size?: ComponentSize;
}
```

## Structure

- **`/tokens`** - Design tokens (colors, spacing, typography)
- **`/types`** - Shared TypeScript type definitions
- **`index.ts`** - Main export file

## Documentation

See [docs/DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md) for complete documentation.

## Storybook

View components in Storybook:

```bash
yarn storybook
```

Then open [http://localhost:6006](http://localhost:6006)
