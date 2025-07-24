module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'react-native',
    '@typescript-eslint',
  ],
  rules: {
    // General
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': 'off', // Using TypeScript's version
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    
    // React
    'react/prop-types': 'off', // Not needed with TypeScript
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/display-name': 'off',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // React Native
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off', // Too restrictive
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
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'build/',
    '*.config.js',
    'babel.config.js',
    'metro.config.js',
    'tests/e2e/**/*.js',
  ],
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};