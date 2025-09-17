import React from 'react';
import { useTheme } from '../../contexts/ui/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTheme(value)}
          className="relative"
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="w-4 h-4" />
          {theme === value && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full" />
          )}
        </Button>
      ))}
    </div>
  );
}

export function CompactThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getNextTheme = () => {
    switch (theme) {
      case 'light': return 'dark';
      case 'dark': return 'system';
      case 'system': return 'light';
      default: return 'light';
    }
  };

  const getCurrentIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Sun;
    }
  };

  const Icon = getCurrentIcon();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(getNextTheme())}
      className="relative"
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <Icon className="w-4 h-4" />
    </Button>
  );
}