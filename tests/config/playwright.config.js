/**
 * DAMP Smart Drinkware - Playwright E2E Test Configuration
 * Enterprise-grade testing setup for CI/CD pipeline
 * 
 * @see https://playwright.dev/docs/test-configuration
 */

const { defineConfig, devices } = require('@playwright/test');

// Environment configuration
const baseURL = process.env.E2E_BASE_URL || process.env.BASE_URL || 'http://localhost:3003';
const isCI = process.env.CI === 'true';
const headless = process.env.HEADLESS === 'true' || isCI;
const timeout = isCI ? 30000 : 15000;

module.exports = defineConfig({
  // Test directory
  testDir: '../e2e',
  
  // Global test configuration
  timeout: timeout,
  expect: {
    timeout: 10000
  },
  
  // Test execution configuration
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: '../../website/playwright-report' }],
    ['junit', { outputFile: '../../website/test-results/playwright-results.xml' }],
    ['json', { outputFile: '../../website/test-results/playwright-results.json' }],
    isCI ? ['github'] : ['list']
  ],
  
  // Global test configuration
  use: {
    // Base URL for tests
    baseURL,
    
    // Browser configuration
    headless,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Test artifacts
    trace: isCI ? 'retain-on-failure' : 'off',
    screenshot: isCI ? 'only-on-failure' : 'off',
    video: isCI ? 'retain-on-failure' : 'off',
    
    // Action configuration
    actionTimeout: 10000,
    navigationTimeout: 15000,
    
    // Context options
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'DAMP-E2E-Test-Agent/1.0'
    }
  },

  // Test projects for different browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers (for responsive testing)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet testing
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    }
  ],

  // Development server configuration
  webServer: isCI ? undefined : {
    command: 'cd ../../website && npm run serve:e2e',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe'
  },

  // Global setup and teardown
  globalSetup: require.resolve('./playwright-global-setup.js'),
  globalTeardown: require.resolve('./playwright-global-teardown.js'),

  // Output directories
  outputDir: '../../website/test-results/playwright-artifacts',
  
  // Test match patterns
  testMatch: [
    '../e2e/**/*.spec.js',
    '../e2e/**/*.test.js'
  ],
  
  // Test ignore patterns
  testIgnore: [
    '../e2e/**/node_modules/**',
    '../e2e/**/*.ignore.js'
  ]
}); 