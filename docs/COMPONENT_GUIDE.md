# Component Development Guide

Guidelines for developing and documenting UI components.

## Table of Contents

- [Component Structure](#component-structure)
- [Styling Guidelines](#styling-guidelines)
- [Accessibility](#accessibility)
- [Component Catalog](#component-catalog)
- [Examples](#examples)

## Component Structure

### Directory Structure

```
src/components/ui/
├── ComponentName/
│   ├── ComponentName.tsx      # Component implementation
│   ├── ComponentName.test.tsx # Component tests
│   ├── index.ts              # Barrel export
│   └── README.md             # Component documentation
```

### Component Template

```typescript
import React from 'react';
import { clsx } from 'clsx';

export interface ComponentNameProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Visual variant */
  variant?: 'primary' | 'secondary';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * ComponentName - Brief description
 * 
 * Detailed description of what the component does and when to use it.
 * 
 * @example
 * ```tsx
 * <ComponentName variant="primary" size="md">
 *   Content
 * </ComponentName>
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
}) => {
  const baseClasses = 'component-base-styles';
  const variantClasses = {
    primary: 'variant-primary-styles',
    secondary: 'variant-secondary-styles',
  };
  const sizeClasses = {
    sm: 'size-sm-styles',
    md: 'size-md-styles',
    lg: 'size-lg-styles',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};
```

## Styling Guidelines

### Using Tailwind CSS

- Use Tailwind utility classes for styling
- Use `clsx` for conditional classes
- Define design tokens in `tailwind.config.js`
- Follow the design system color palette

### Color Tokens

```typescript
// Use semantic color names
'bg-primary'         // Primary background
'text-primary'       // Primary text
'border-subtle'      // Subtle border
'success'            // Success state
'error'              // Error state
'warning'            // Warning state
'info'               // Info state
```

### Responsive Design

```typescript
// Mobile-first approach
className="text-sm md:text-base lg:text-lg"
```

### Dark Mode

```typescript
// Always provide dark mode variants
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

## Accessibility

### ARIA Attributes

Always include appropriate ARIA attributes:

```typescript
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  aria-disabled={disabled}
  role="button"
>
  Close
</button>
```

### Keyboard Navigation

Ensure components are keyboard accessible:

```typescript
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
  Interactive element
</div>
```

### Focus Management

```typescript
<button
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  Focusable Button
</button>
```

### Screen Reader Support

```typescript
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

## Component Catalog

### Loading States

#### Skeleton
```typescript
import { Skeleton, SkeletonText, SkeletonCard } from '@/components/ui';

// Basic skeleton
<Skeleton width={200} height={20} />

// Text skeleton
<SkeletonText lines={3} />

// Card skeleton
<SkeletonCard />
```

### Empty States

#### EmptyState
```typescript
import { EmptyState } from '@/components/ui';

<EmptyState
  title="No data available"
  description="Get started by creating your first item."
  icon={<InboxIcon />}
  action={{
    label: "Create Item",
    onClick: handleCreate
  }}
/>
```

### Error States

#### ErrorState
```typescript
import { ErrorState } from '@/components/ui';

<ErrorState
  title="Something went wrong"
  message="Failed to load data. Please try again."
  error={error}
  retry={handleRetry}
  showDetails={isDevelopment}
/>
```

### Notifications

#### Toast
```typescript
import { useToast } from '@/components/ui';

const { success, error, warning, info } = useToast();

// Show success toast
success('Success!', 'Your changes have been saved.');

// Show error toast
error('Error!', 'Failed to save changes.');

// Show warning toast
warning('Warning!', 'This action cannot be undone.');

// Show info toast
info('Info', 'New updates are available.');
```

## Examples

### Form with Loading State

```typescript
import { useState } from 'react';
import { Button, Input, ErrorState, SkeletonCard } from '@/components/ui';
import { useToast } from '@/components/ui';

function UserForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { success, error: showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await saveUser(formData);
      success('Success!', 'User saved successfully.');
    } catch (err) {
      setError(err as Error);
      showError('Error!', 'Failed to save user.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonCard />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load user data"
        error={error}
        retry={() => window.location.reload()}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Name" required />
      <Input label="Email" type="email" required />
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

### List with Empty State

```typescript
import { EmptyState, SkeletonText } from '@/components/ui';

function ItemList({ items, loading }: ItemListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonText key={i} lines={2} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No items found"
        description="Start by adding your first item."
        icon={<InboxIcon className="w-16 h-16" />}
        action={{
          label: "Add Item",
          onClick: handleAddItem
        }}
      />
    );
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

## Best Practices

1. **Composition over Configuration**: Break components into smaller, composable pieces
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Default Props**: Provide sensible defaults for optional props
4. **Documentation**: Include JSDoc comments with examples
5. **Accessibility**: Always consider keyboard navigation and screen readers
6. **Testing**: Write tests for component behavior
7. **Performance**: Use React.memo for expensive components
8. **Error Boundaries**: Wrap components in error boundaries
9. **Loading States**: Always show feedback during async operations
10. **Consistency**: Follow established patterns in the codebase

## Testing Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName>Content</ComponentName>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick}>Click me</ComponentName>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<ComponentName className="custom-class">Content</ComponentName>);
    expect(screen.getByText('Content')).toHaveClass('custom-class');
  });

  it('renders disabled state', () => {
    render(<ComponentName disabled>Content</ComponentName>);
    expect(screen.getByText('Content')).toHaveAttribute('aria-disabled', 'true');
  });
});
```

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
