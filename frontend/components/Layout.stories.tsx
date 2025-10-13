/**
 * Storybook Stories for Layout Component
 * 
 * Demonstrates the main application layout with navigation, content area, and footer
 */

import type { Meta, StoryObj } from '@storybook/react';
import Layout from './Layout';
import { AuthProvider } from '../contexts/AuthContext';

const meta = {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main application layout wrapper with navigation header and footer. Uses app-shell pattern with proper semantic HTML.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default layout with sample content
 */
export const Default: Story = {
  args: {
    children: (
      <div className="container mx-auto py-8">
        <div className="card p-6">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Page Content</h1>
          <p className="text-text-secondary mb-4">
            This is the main content area. The layout includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            <li>Navigation header with theme toggle</li>
            <li>Main content area (this section)</li>
            <li>Footer with links and copyright</li>
          </ul>
        </div>
      </div>
    ),
  },
};

/**
 * Layout with dark theme
 */
export const DarkTheme: Story = {
  args: {
    children: (
      <div className="container mx-auto py-8">
        <div className="card p-6">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Dark Theme Layout</h1>
          <p className="text-text-secondary">
            The layout adapts to dark theme with proper color tokens and contrast ratios.
          </p>
        </div>
      </div>
    ),
  },
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
 * Layout with light theme
 */
export const LightTheme: Story = {
  args: {
    children: (
      <div className="container mx-auto py-8">
        <div className="card p-6">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Light Theme Layout</h1>
          <p className="text-text-secondary">
            The layout adapts to light theme with proper color tokens and accessibility.
          </p>
        </div>
      </div>
    ),
  },
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
 * Layout with multiple cards demonstrating elevation
 */
export const WithMultipleCards: Story = {
  args: {
    children: (
      <div className="container mx-auto py-8 space-y-6">
        <div className="card p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Card with Elevation 2</h2>
          <p className="text-text-secondary">Standard card with default elevation</p>
        </div>
        <div className="card card--elevated p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Elevated Card</h2>
          <p className="text-text-secondary">Card with higher elevation using card--elevated class</p>
        </div>
        <div className="card card--interactive p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Interactive Card</h2>
          <p className="text-text-secondary">Hover over this card to see the interactive effect</p>
        </div>
        <div className="card card--neon p-6">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Neon Card</h2>
          <p className="text-text-secondary">Card with subtle neon border effect</p>
        </div>
      </div>
    ),
  },
};

/**
 * Layout with form elements demonstrating theme consistency
 */
export const WithFormElements: Story = {
  args: {
    children: (
      <div className="container mx-auto py-8">
        <div className="card p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Form Example</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Input Field
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                className="form-input w-full px-3 py-2 border border-border-moderate rounded-lg bg-bg-tertiary text-text-primary focus:border-brand-cyan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Textarea
              </label>
              <textarea
                placeholder="Enter description..."
                rows={4}
                className="form-input w-full px-3 py-2 border border-border-moderate rounded-lg bg-bg-tertiary text-text-primary focus:border-brand-cyan resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Select
              </label>
              <select className="form-input w-full px-3 py-2 border border-border-moderate rounded-lg bg-bg-tertiary text-text-primary focus:border-brand-cyan">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    ),
  },
};

/**
 * Mobile viewport demonstration
 */
export const Mobile: Story = {
  args: {
    children: (
      <div className="container mx-auto py-8">
        <div className="card p-6">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Mobile View</h1>
          <p className="text-text-secondary">
            The layout adapts to mobile screens with responsive navigation.
          </p>
        </div>
      </div>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
