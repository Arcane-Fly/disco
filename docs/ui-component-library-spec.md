# Modern UI Component Library Specification

## Overview

This specification outlines the development of a comprehensive, accessible, and modern UI component library for the Disco MCP platform. Built with React 19, TypeScript, and Tailwind CSS, this library will provide the foundation for the revolutionary user experience enhancements.

## Design System Foundation

### Design Tokens

```typescript
// Design tokens for consistent theming
export const designTokens = {
  colors: {
    // Semantic colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#64748b',
      600: '#475569',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      900: '#7f1d1d',
    },
    
    // Functional colors
    background: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      tertiary: 'var(--text-tertiary)',
      inverse: 'var(--text-inverse)',
    },
    border: {
      primary: 'var(--border-primary)',
      secondary: 'var(--border-secondary)',
      focus: 'var(--border-focus)',
    },
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
```

### Theme System

```typescript
// Advanced theming system with dark mode support
interface Theme {
  name: string;
  colors: ThemeColors;
  mode: 'light' | 'dark' | 'auto';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
}

interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    disabled: string;
  };
  accent: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

// Theme provider with advanced features
export const ThemeProvider: React.FC<{
  theme: Theme;
  children: React.ReactNode;
}> = ({ theme, children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([category, colors]) => {
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(
          `--color-${category}-${key}`,
          value
        );
      });
    });
    
    // Apply theme class
    document.documentElement.className = `theme-${theme.name}`;
    
    // Handle reduced motion preference
    if (theme.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    }
  }, [theme]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Core Components

### Button Component System

```typescript
// Comprehensive button component with variants
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    rounded = false,
    disabled,
    children,
    className,
    ...props
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none relative overflow-hidden',
    ];

    const variantClasses = {
      primary: [
        'bg-primary-600 hover:bg-primary-700 text-white',
        'border border-transparent',
        'focus:ring-primary-500',
        'active:bg-primary-800',
      ],
      secondary: [
        'bg-secondary-100 hover:bg-secondary-200 text-secondary-900',
        'border border-secondary-300',
        'focus:ring-secondary-500',
        'dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-secondary-100',
      ],
      tertiary: [
        'bg-transparent hover:bg-secondary-100 text-secondary-700',
        'border border-secondary-300',
        'focus:ring-secondary-500',
        'dark:hover:bg-secondary-800 dark:text-secondary-300',
      ],
      danger: [
        'bg-error-600 hover:bg-error-700 text-white',
        'border border-transparent',
        'focus:ring-error-500',
        'active:bg-error-800',
      ],
      ghost: [
        'bg-transparent hover:bg-secondary-100 text-secondary-700',
        'border border-transparent',
        'focus:ring-secondary-500',
        'dark:hover:bg-secondary-800 dark:text-secondary-300',
      ],
      link: [
        'bg-transparent hover:underline text-primary-600',
        'border border-transparent p-0',
        'focus:ring-primary-500',
        'dark:text-primary-400',
      ],
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs rounded-md',
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
      xl: 'px-8 py-4 text-lg rounded-xl',
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      {
        'w-full': fullWidth,
        'rounded-full': rounded,
        'cursor-not-allowed': disabled || loading,
      },
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Spinner
            size={size === 'xs' || size === 'sm' ? 'sm' : 'md'}
            className="mr-2"
          />
        )}
        
        {Icon && iconPosition === 'left' && !loading && (
          <Icon className={cn('flex-shrink-0', {
            'mr-1': size === 'xs',
            'mr-2': size !== 'xs',
            'w-3 h-3': size === 'xs',
            'w-4 h-4': size === 'sm' || size === 'md',
            'w-5 h-5': size === 'lg' || size === 'xl',
          })} />
        )}
        
        {children}
        
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className={cn('flex-shrink-0', {
            'ml-1': size === 'xs',
            'ml-2': size !== 'xs',
            'w-3 h-3': size === 'xs',
            'w-4 h-4': size === 'sm' || size === 'md',
            'w-5 h-5': size === 'lg' || size === 'xl',
          })} />
        )}
        
        {/* Ripple effect */}
        <RippleEffect />
      </button>
    );
  }
);
```

### Input Component System

```typescript
// Advanced input component with validation
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  addon?: React.ReactNode;
  addonPosition?: 'left' | 'right';
  clearable?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    description,
    error,
    success,
    size = 'md',
    variant = 'default',
    icon: Icon,
    iconPosition = 'left',
    addon,
    addonPosition = 'right',
    clearable = false,
    maxLength,
    showCharacterCount = false,
    className,
    id,
    ...props
  }, ref) => {
    const [value, setValue] = useState(props.value || '');
    const [focused, setFocused] = useState(false);
    const inputId = id || useId();

    const baseClasses = [
      'block w-full border transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed',
      'placeholder:text-secondary-400',
    ];

    const variantClasses = {
      default: [
        'bg-white border-secondary-300 rounded-lg',
        'focus:border-primary-500 focus:ring-primary-500/20',
        'dark:bg-secondary-900 dark:border-secondary-700',
      ],
      filled: [
        'bg-secondary-50 border-transparent rounded-lg',
        'focus:bg-white focus:border-primary-500 focus:ring-primary-500/20',
        'dark:bg-secondary-800 dark:focus:bg-secondary-900',
      ],
      flushed: [
        'bg-transparent border-0 border-b-2 border-secondary-300 rounded-none',
        'focus:border-primary-500 focus:ring-0',
        'dark:border-secondary-700',
      ],
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const hasIcon = !!Icon;
    const hasAddon = !!addon;

    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      {
        'border-error-300 focus:border-error-500 focus:ring-error-500/20': hasError,
        'border-success-300 focus:border-success-500 focus:ring-success-500/20': hasSuccess,
        'pl-10': hasIcon && iconPosition === 'left' && size === 'md',
        'pl-12': hasIcon && iconPosition === 'left' && size === 'lg',
        'pl-8': hasIcon && iconPosition === 'left' && size === 'sm',
        'pr-10': (hasIcon && iconPosition === 'right') || clearable,
        'rounded-l-none': hasAddon && addonPosition === 'left',
        'rounded-r-none': hasAddon && addonPosition === 'right',
      },
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
          >
            {label}
          </label>
        )}
        
        {description && (
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
            {description}
          </p>
        )}

        <div className="relative flex">
          {hasAddon && addonPosition === 'left' && (
            <div className="flex items-center px-3 bg-secondary-50 border border-r-0 border-secondary-300 rounded-l-lg dark:bg-secondary-800 dark:border-secondary-700">
              {addon}
            </div>
          )}

          <div className="relative flex-1">
            {hasIcon && iconPosition === 'left' && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon className={cn('text-secondary-400', {
                  'w-4 h-4': size === 'sm',
                  'w-5 h-5': size === 'md',
                  'w-6 h-6': size === 'lg',
                })} />
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              className={inputClasses}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => {
                setValue(e.target.value);
                props.onChange?.(e);
              }}
              maxLength={maxLength}
              {...props}
            />

            {hasIcon && iconPosition === 'right' && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Icon className={cn('text-secondary-400', {
                  'w-4 h-4': size === 'sm',
                  'w-5 h-5': size === 'md',
                  'w-6 h-6': size === 'lg',
                })} />
              </div>
            )}

            {clearable && value && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => {
                  setValue('');
                  props.onChange?.({ target: { value: '' } } as any);
                }}
              >
                <XMarkIcon className="w-4 h-4 text-secondary-400 hover:text-secondary-600" />
              </button>
            )}
          </div>

          {hasAddon && addonPosition === 'right' && (
            <div className="flex items-center px-3 bg-secondary-50 border border-l-0 border-secondary-300 rounded-r-lg dark:bg-secondary-800 dark:border-secondary-700">
              {addon}
            </div>
          )}
        </div>

        {(showCharacterCount && maxLength) && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-secondary-500">
              {value.length}/{maxLength}
            </span>
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400">
            {error}
          </p>
        )}

        {success && !error && (
          <p className="mt-1 text-sm text-success-600 dark:text-success-400">
            {success}
          </p>
        )}
      </div>
    );
  }
);
```

### Modal Component System

```typescript
// Advanced modal with accessibility and animations
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
  showCloseButton?: boolean;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscapeKey = true,
  showCloseButton = true,
  title,
  description,
  footer,
  className,
}) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscapeKey || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscapeKey, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      
      // Focus the modal after a brief delay to allow for animations
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else if (previousFocus.current) {
      previousFocus.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Mount/unmount handling
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setMounted(false);
    }
  };

  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'transition-opacity duration-300 ease-out',
        {
          'opacity-100': isOpen,
          'opacity-0': !isOpen,
        }
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-white dark:bg-secondary-900 rounded-xl shadow-xl',
          'transform transition-all duration-300 ease-out',
          sizeClasses[size],
          {
            'scale-100 translate-y-0': isOpen,
            'scale-95 translate-y-4': !isOpen,
          },
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-secondary-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-secondary-500 dark:text-secondary-400"
                >
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary-200 dark:border-secondary-700">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
```

## Advanced Components

### Drag and Drop Components

```typescript
// Drag and drop utilities using @dnd-kit
interface DraggableProps {
  id: string;
  children: React.ReactNode;
  data?: Record<string, any>;
  disabled?: boolean;
  className?: string;
}

export const Draggable: React.FC<DraggableProps> = ({
  id,
  children,
  data,
  disabled = false,
  className,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useDraggable({
    id,
    data,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        {
          'opacity-50': isDragging,
          'cursor-not-allowed': disabled,
        },
        className
      )}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  accepts?: string[];
  disabled?: boolean;
  className?: string;
}

export const Droppable: React.FC<DroppableProps> = ({
  id,
  children,
  accepts,
  disabled = false,
  className,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { accepts },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-colors duration-200',
        {
          'bg-primary-50 border-2 border-dashed border-primary-300': isOver,
          'opacity-50': disabled,
        },
        className
      )}
    >
      {children}
    </div>
  );
};
```

### Data Table Component

```typescript
// Advanced data table with sorting, filtering, and pagination
interface Column<T> {
  key: keyof T;
  title: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sorting?: {
    field: keyof T;
    order: 'asc' | 'desc';
    onChange: (field: keyof T, order: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onChange: (filters: Record<string, any>) => void;
  };
  selection?: {
    selectedKeys: string[];
    onChange: (selectedKeys: string[]) => void;
  };
  className?: string;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  className,
}: DataTableProps<T>) => {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleSort = (field: keyof T) => {
    if (!sorting) return;
    
    const newOrder = sorting.field === field && sorting.order === 'asc' ? 'desc' : 'asc';
    sorting.onChange(field, newOrder);
  };

  const handleFilter = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    filtering?.onChange(newFilters);
  };

  return (
    <div className={cn('overflow-hidden border border-secondary-200 rounded-lg', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-secondary-200">
          {/* Header */}
          <thead className="bg-secondary-50 dark:bg-secondary-800">
            <tr>
              {selection && (
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-secondary-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        selection.onChange(data.map((_, index) => index.toString()));
                      } else {
                        selection.onChange([]);
                      }
                    }}
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="text-secondary-400 hover:text-secondary-600"
                      >
                        <ChevronUpDownIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {column.filterable && (
                    <div className="mt-2">
                      <Input
                        size="sm"
                        placeholder={`Filter ${column.title}`}
                        onChange={(e) => handleFilter(column.key as string, e.target.value)}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-secondary-900 divide-y divide-secondary-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12 text-center">
                  <Spinner size="lg" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12 text-center text-secondary-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr key={index} className="hover:bg-secondary-50 dark:hover:bg-secondary-800">
                  {selection && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-secondary-300"
                        checked={selection.selectedKeys.includes(index.toString())}
                        onChange={(e) => {
                          const key = index.toString();
                          if (e.target.checked) {
                            selection.onChange([...selection.selectedKeys, key]);
                          } else {
                            selection.onChange(selection.selectedKeys.filter(k => k !== key));
                          }
                        }}
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 dark:text-white">
                      {column.render ? column.render(record[column.key], record) : record[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white dark:bg-secondary-900 px-4 py-3 border-t border-secondary-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-secondary-700 dark:text-secondary-300">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.current - 1) * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.current === 1}
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              >
                Previous
              </Button>
              
              <span className="text-sm text-secondary-700 dark:text-secondary-300">
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Accessibility Features

### Focus Management

```typescript
// Advanced focus management utilities
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef]);
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: string[],
  onSelect: (item: string) => void
) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(items[activeIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setActiveIndex(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, activeIndex, onSelect]);

  return { activeIndex, setActiveIndex };
};
```

### Screen Reader Support

```typescript
// Screen reader announcements
export const useAnnouncer = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return { announce };
};

// Live region component
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
}> = ({ children, politeness = 'polite', atomic = true }) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
};
```

## Testing Strategy

### Component Testing

```typescript
// Comprehensive component testing
describe('Button Component', () => {
  test('renders with correct variant styles', () => {
    render(<Button variant="primary">Test Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-primary-600');
  });

  test('handles loading state correctly', () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });

  test('supports keyboard navigation', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test Button</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });

  test('meets accessibility standards', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### Visual Regression Testing

```typescript
// Visual testing with Playwright
test.describe('Component Visual Tests', () => {
  test('Button variants render correctly', async ({ page }) => {
    await page.goto('/storybook/button');
    
    // Test all variants
    const variants = ['primary', 'secondary', 'tertiary', 'danger', 'ghost'];
    
    for (const variant of variants) {
      await page.locator(`[data-variant="${variant}"]`).screenshot({
        path: `button-${variant}.png`,
      });
    }
  });

  test('Dark mode renders correctly', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/storybook/button');
    
    await page.screenshot({ path: 'button-dark-mode.png' });
  });
});
```

This comprehensive UI component library specification provides the foundation for building a modern, accessible, and powerful user interface system that will enable the revolutionary UX improvements planned for the Disco MCP platform.