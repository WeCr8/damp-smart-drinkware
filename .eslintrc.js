/**
 * DAMP Smart Drinkware - Enterprise ESLint Configuration
 * Google Engineering Standards Implementation
 * 
 * This configuration enforces:
 * - Code quality and consistency
 * - Security best practices
 * - Performance optimizations
 * - Accessibility compliance
 * - Modern JavaScript standards
 */

module.exports = {
  root: true,
  
  // Environment configuration
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
    serviceworker: true
  },
  
  // Global variables
  globals: {
    // DAMP specific globals
    DAMP: 'readonly',
    DAMP_CONFIG: 'readonly',
    dampDebug: 'readonly',
    
    // Google Analytics & tracking
    gtag: 'readonly',
    dataLayer: 'readonly',
    
    // Performance monitoring
    PerformanceObserver: 'readonly',
    IntersectionObserver: 'readonly',
    
    // PWA globals
    workbox: 'readonly',
    
    // Testing globals
    __DEV__: 'readonly',
    __TEST__: 'readonly',
    __PROD__: 'readonly'
  },
  
  // Parser configuration
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    allowImportExportEverywhere: true,
    ecmaFeatures: {
      jsx: false,
      impliedStrict: true
    },
    babelOptions: {
      presets: ['@babel/preset-env']
    }
  },
  
  // Extended configurations
  extends: [
    'eslint:recommended',
    '@eslint/js/recommended',
    'plugin:security/recommended',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:jsdoc/recommended',
    'plugin:optimize-regex/recommended',
    'prettier' // Must be last to override conflicting rules
  ],
  
  // Plugins
  plugins: [
    'security',
    'sonarjs',
    'unicorn',
    'import',
    'promise',
    'jsdoc',
    'optimize-regex',
    'no-loops',
    'no-use-extend-native',
    'html',
    'json',
    'markdown'
  ],
  
  // Rule configuration
  rules: {
    // === GOOGLE ENGINEERING STANDARDS ===
    
    // Code Quality
    'complexity': ['error', { max: 10 }],
    'max-depth': ['error', 4],
    'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-params': ['error', 4],
    'max-statements': ['error', 20],
    'no-magic-numbers': ['error', { 
      ignore: [-1, 0, 1, 2, 100, 1000],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true
    }],
    
    // Error Prevention
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-void': 'error',
    'no-with': 'error',
    
    // Modern JavaScript
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'prefer-spread': 'error',
    'prefer-rest-params': 'error',
    'prefer-destructuring': ['error', {
      array: true,
      object: true
    }],
    'object-shorthand': 'error',
    'no-var': 'error',
    
    // === SECURITY RULES ===
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    
    // === PERFORMANCE RULES ===
    'no-loops/no-loops': 'warn', // Encourage functional programming
    'optimize-regex/optimize-regex': 'error',
    
    // === ACCESSIBILITY RULES ===
    // Custom rules for DOM manipulation
    'no-use-extend-native/no-use-extend-native': 'error',
    
    // === IMPORT/EXPORT RULES ===
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],
    'import/no-unresolved': ['error', {
      ignore: ['^@/', '^@api/', '^@components/', '^@tests/']
    }],
    'import/no-dynamic-require': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'error',
    'import/newline-after-import': 'error',
    'import/no-anonymous-default-export': 'error',
    
    // === PROMISE RULES ===
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-nesting': 'error',
    'promise/no-promise-in-callback': 'error',
    'promise/no-callback-in-promise': 'error',
    'promise/avoid-new': 'warn',
    'promise/prefer-await-to-then': 'error',
    
    // === JSDOC RULES ===
    'jsdoc/require-description': 'error',
    'jsdoc/require-description-complete-sentence': 'error',
    'jsdoc/require-example': ['error', {
      exemptedBy: ['private', 'internal']
    }],
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    
    // === SONARJS RULES ===
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/prefer-object-literal': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',
    
    // === UNICORN RULES (Modern JS patterns) ===
    'unicorn/filename-case': ['error', {
      case: 'kebabCase'
    }],
    'unicorn/no-array-instanceof': 'error',
    'unicorn/no-new-buffer': 'error',
    'unicorn/no-unsafe-regex': 'error',
    'unicorn/prefer-add-event-listener': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-modern-dom-apis': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-query-selector': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-ternary': 'error',
    'unicorn/prefer-type-error': 'error',
    
    // Disable some overly strict unicorn rules
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prefer-module': 'off'
  },
  
  // Environment-specific overrides
  overrides: [
    // Service Worker files
    {
      files: ['sw.js', '**/sw.js', '**/*-sw.js'],
      env: {
        serviceworker: true,
        browser: false
      },
      globals: {
        workbox: 'readonly',
        clients: 'readonly',
        registration: 'readonly'
      }
    },
    
    // Test files
    {
      files: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/tests/**/*.js',
        '**/__tests__/**/*.js'
      ],
      env: {
        jest: true,
        node: true
      },
      globals: {
        expect: 'readonly',
        test: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      },
      rules: {
        // Relax some rules for tests
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'no-magic-numbers': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'jsdoc/require-jsdoc': 'off'
      }
    },
    
    // Configuration files
    {
      files: [
        '*.config.js',
        '*.config.mjs',
        '**/config/*.js',
        '.eslintrc.js',
        'babel.config.js',
        'webpack.config.js',
        'vite.config.js'
      ],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'no-magic-numbers': 'off',
        'import/no-extraneous-dependencies': 'off'
      }
    },
    
    // Backend API files
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      extends: ['plugin:node/recommended'],
      rules: {
        'no-console': 'off', // Allow console.log in backend
        'node/no-unpublished-require': 'off'
      }
    },
    
    // HTML files (for script tags)
    {
      files: ['**/*.html'],
      processor: 'html/html'
    },
    
    // JSON files
    {
      files: ['**/*.json'],
      extends: ['plugin:json/recommended']
    },
    
    // Markdown files
    {
      files: ['**/*.md'],
      processor: 'markdown/markdown'
    }
  ],
  
  // Settings
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './website/assets/js'],
          ['@api', './backend/api'],
          ['@components', './website/assets/js/components'],
          ['@tests', './tests']
        ],
        extensions: ['.js', '.json']
      }
    },
    
    jsdoc: {
      mode: 'jsdoc',
      tagNamePreference: {
        returns: 'return',
        yields: 'yield'
      }
    }
  },
  
  // Ignore patterns (additional to .eslintignore)
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.nyc_output/',
    '*.min.js',
    'vendor/',
    'public/assets/js/vendor/',
    '.eslintrc.js' // Don't lint this file itself
  ]
}; 