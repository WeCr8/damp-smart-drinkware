/**
 * DAMP Smart Drinkware - Enterprise Jest Configuration
 * Google Engineering Standards Testing Implementation
 */

module.exports = {
  // Test environment configuration
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'https://dampdrink.com',
    userAgent: 'DAMP-Test-Agent/1.0'
  },

  // Root directories
  rootDir: '../../',
  roots: [
    '<rootDir>/website/assets/js',
    '<rootDir>/backend/api',
    '<rootDir>/tests'
  ],

  // Module paths and aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/website/assets/js/$1',
    '^@api/(.*)$': '<rootDir>/backend/api/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@components/(.*)$': '<rootDir>/website/assets/js/components/$1'
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/website/assets/js/**/__tests__/**/*.js'
  ],

  // Coverage configuration - Google standards (90%+ coverage)
  collectCoverage: true,
  collectCoverageFrom: [
    'website/assets/js/**/*.js',
    'backend/api/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/build/**',
    '!**/dist/**',
    '!**/*.config.js',
    '!**/*.test.js',
    '!**/tests/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // Critical files require higher coverage
    './website/assets/js/error-management/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './backend/api/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json-summary'
  ],

  coverageDirectory: '<rootDir>/coverage',

  // Setup and teardown
  setupFilesAfterEnv: [
    '<rootDir>/tests/config/jest.setup.js'
  ],

  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/tests/config/css-transform.js',
    '^.+\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/tests/config/file-transform.js'
  },

  // Module file extensions
  moduleFileExtensions: [
    'js',
    'json',
    'css'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/website/assets/js/vendor/',
    '<rootDir>/tests/e2e/'
  ],

  // Globals for tests
  globals: {
    'window.DAMP_CONFIG': {
      VITE_APP_ENVIRONMENT: 'test',
      VITE_ENABLE_ANALYTICS: 'false',
      VITE_ENABLE_DEBUG_MODE: 'true'
    },
    '__DEV__': true,
    '__TEST__': true
  },

  // Performance and timeout
  testTimeout: 10000,
  slowTestThreshold: 5,

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: '<rootDir>/test-results',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false
      }
    ]
  ],

  // Verbose output for CI
  verbose: process.env.CI === 'true',

  // Watch mode configuration (for development)
  watchman: true,
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/build/',
    '<rootDir>/dist/'
  ],

  // Error handling
  errorOnDeprecated: true,
  bail: process.env.CI === 'true' ? 1 : 0,

  // Parallel execution
  maxWorkers: process.env.CI === 'true' ? 2 : '50%',

  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Additional configuration for enterprise features
  snapshotSerializers: [
    '<rootDir>/tests/config/snapshot-serializer.js'
  ],

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/config/global-setup.js',
  globalTeardown: '<rootDir>/tests/config/global-teardown.js',

  // Test results processor
  testResultsProcessor: '<rootDir>/tests/config/results-processor.js'
}; 