// ESLint flat config for Next.js frontend
// Implements No-Regex-by-Default policy.
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import regexpPlugin from 'eslint-plugin-regexp';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '**/*.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        
        // Node.js globals
        process: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        
        // Jest/Testing globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin,
      'regexp': regexpPlugin,
    },
    rules: {
      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'off',
      
      // TypeScript rules - relaxed for frontend
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      
      // General rules
      'no-console': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
      
      // No-Regex-by-Default Policy
      'no-new-wrappers': 'error',
      'no-eval': 'error',
      'regexp/no-super-linear-backtracking': 'warn', // Warn initially, upgrade to error after fixing
      'regexp/no-useless-quantifier': 'warn',
      'regexp/no-empty-alternative': 'warn',
      'regexp/no-dupe-characters-character-class': 'error',
      'regexp/optimal-quantifier-concatenation': 'warn',
      'regexp/no-legacy-features': 'error',
      
      'no-restricted-syntax': [
        'warn',
        {
          selector: "NewExpression[callee.name='RegExp']",
          message: 'Regex is discouraged. Use a parser or approved helper. If truly needed, document exception in CONTRIBUTING.md.'
        }
      ],
      
      'no-restricted-properties': [
        'warn',
        {
          object: 'String',
          property: 'match',
          message: 'Use typed parsing, URL, JSON, DOM APIs instead of regex match.'
        },
        {
          object: 'String',
          property: 'search',
          message: 'Avoid regex search; use includes/startsWith/endsWith.'
        }
      ],
    },
  },
];
