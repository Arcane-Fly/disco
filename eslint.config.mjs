// ESLint flat config for TypeScript (server-side)
// Focused to satisfy Railway validator lint step with minimal friction.
// Implements No-Regex-by-Default policy.

import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import regexpPlugin from 'eslint-plugin-regexp';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**',
      'frontend/**',
      '**/*.d.ts',
    ],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'regexp': regexpPlugin,
    },
    rules: {
      // Keep rules modest to avoid blocking deployments while we harden types
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      
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
