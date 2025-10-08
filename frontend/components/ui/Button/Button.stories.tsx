import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports loading states and icons.
 */
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
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables interaction',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button - Main call-to-action
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

/**
 * Secondary button - Less prominent actions
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

/**
 * Outline button - Tertiary actions
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

/**
 * Ghost button - Minimal styling
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/**
 * Destructive button - Dangerous or destructive actions
 */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

/**
 * Small button
 */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

/**
 * Medium button (default)
 */
export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

/**
 * Large button
 */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

/**
 * Extra large button
 */
export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large Button',
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Click me',
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

/**
 * Button with left icon
 */
export const WithLeftIcon: Story = {
  args: {
    children: 'Download',
    leftIcon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12Z"
          fill="currentColor"
        />
        <path d="M0 14H16V16H0V14Z" fill="currentColor" />
      </svg>
    ),
  },
};

/**
 * Button with right icon
 */
export const WithRightIcon: Story = {
  args: {
    children: 'Continue',
    rightIcon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 0L13 5L11.6 6.4L9 3.8V16H7V3.8L4.4 6.4L3 5L8 0Z"
          fill="currentColor"
          transform="rotate(90 8 8)"
        />
      </svg>
    ),
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  args: {
    children: 'Default',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </div>
      <div className="flex gap-4">
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  ),
};
