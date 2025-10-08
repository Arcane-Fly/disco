import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
    '../src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'brand-cyan': '#6ee7ff',
        'brand-purple': '#9b6bff',
        
        // Backgrounds
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          interactive: 'var(--bg-interactive)',
          elevated: 'var(--bg-elevated)',
        },
        
        // Text
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        
        // Borders
        border: {
          subtle: 'var(--border-subtle)',
          moderate: 'var(--border-moderate)',
          strong: 'var(--border-strong)',
        },
        
        // Semantic colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // Legacy compatibility
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
        },
        destructive: {
          DEFAULT: 'var(--error)',
        },
      },
      boxShadow: {
        'elev-0': 'var(--shadow-0)',
        'elev-1': 'var(--shadow-1)',
        'elev-2': 'var(--shadow-2)',
        'elev-3': 'var(--shadow-3)',
        'elev-4': 'var(--shadow-4)',
        'glow-cyan': 'var(--glow-cyan)',
        'glow-purple': 'var(--glow-purple)',
        'glow-mixed': 'var(--glow-mixed)',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-ambient': 'var(--gradient-ambient)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },
      zIndex: {
        'base': 'var(--z-base)',
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      backdropSaturate: {
        '120': '1.2',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%, 20%, 40%, 60%, 80%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
          },
          '40%': {
            transform: 'translateY(-30px)',
            animationTimingFunction: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
          },
          '60%': {
            transform: 'translateY(-15px)',
            animationTimingFunction: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
          },
          '80%': {
            transform: 'translateY(-2px)',
            animationTimingFunction: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
}

export default config