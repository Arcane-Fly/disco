/**
 * Storybook Stories for WorkflowBuilder Component
 * 
 * Demonstrates the workflow builder in various states and configurations
 */

import type { Meta, StoryObj } from '@storybook/react';
import { WorkflowBuilder } from './WorkflowBuilder';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import { AuthProvider } from '../../contexts/AuthContext';

const meta = {
  title: 'Components/WorkflowBuilder',
  component: WorkflowBuilder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Advanced workflow builder with drag-and-drop node creation, real-time collaboration, and visual data flow.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <WebSocketProvider>
          <div style={{ height: '100vh', width: '100vw' }}>
            <Story />
          </div>
        </WebSocketProvider>
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof WorkflowBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default workflow builder with empty canvas
 */
export const Default: Story = {
  args: {},
};

/**
 * Workflow builder with dark theme
 * Shows how the component adapts to dark mode with proper color tokens
 */
export const DarkTheme: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div data-theme="dark">
        <Story />
      </div>
    ),
  ],
};

/**
 * Workflow builder with light theme
 * Demonstrates light mode styling with proper contrast
 */
export const LightTheme: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'light' },
  },
  decorators: [
    (Story) => (
      <div data-theme="light">
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile viewport demonstration
 */
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet viewport demonstration
 */
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
