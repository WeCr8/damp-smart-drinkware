// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import importPlugin from 'eslint-plugin-import';

const compat = new FlatCompat();

export default [
  js.configs.recommended,

  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all'
  ),

  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // Enables full type-aware linting
        tsconfigRootDir: __dirname,
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
      'import': importPlugin,
    },

    rules: {
      // General
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-unused-vars': 'off', // Disabled in favor of TS version
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-var-requires': 'off',

      // Safety Rules
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'warn',

      // Import Hygiene
      'import/no-unused-modules': ['warn', { unusedExports: true }],

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off',
      'react-native/no-single-element-style-arrays': 'warn',

      // Accessibility
      'react-native/accessibility-label': 'warn',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    env: {
      'react-native/react-native': true,
      browser: true,
      es2021: true,
      node: true,
    },
  },

  // JS-specific overrides
  {
    files: ['*.js', '*.jsx'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Ignored Paths (must be a separate config in Flat ESLint)
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'build/',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
      'tests/e2e/**/*.js',
    ],
  },
];
