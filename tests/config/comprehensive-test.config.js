/**
 * DAMP Smart Drinkware - Comprehensive Test Configuration
 * Google Engineering Standards - Enterprise Test Setup
 */

const { defineConfig } = require('@playwright/test');
const baseConfig = require('./playwright.config.js');

module.exports = defineConfig({
  ...baseConfig,
  
  // Comprehensive test directory
  testDir: '../e2e/comprehensive',
  
  // Extended timeout for comprehensive tests
  timeout: 60000,
  expect: {
    timeout: 15000
  },
  
  // Enhanced test execution
  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,
  retries: process.env.CI ? 3 : 1,
  
  // Comprehensive reporting
  reporter: [
    ['html', { 
      outputFolder: '../../website/reports/comprehensive-test-report',
      open: 'never'
    }],
    ['junit', { 
      outputFile: '../../website/test-results/comprehensive-results.xml' 
    }],
    ['json', { 
      outputFile: '../../website/test-results/comprehensive-results.json' 
    }],
    ['line'], // Console output
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Enhanced browser configuration
  projects: [
    // Desktop browsers with different configurations
    {
      name: 'chromium-desktop',
      use: { 
        ...baseConfig.use,
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      },
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...baseConfig.use,
        browserName: 'firefox',
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...baseConfig.use,
        browserName: 'webkit',
        viewport: { width: 1280, height: 720 }
      },
    },
    
    // Mobile devices
    {
      name: 'mobile-chrome',
      use: {
        ...baseConfig.use,
        ...require('@playwright/test').devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...baseConfig.use,
        ...require('@playwright/test').devices['iPhone 12'],
      },
    },
    
    // Tablet
    {
      name: 'tablet-chrome',
      use: {
        ...baseConfig.use,
        ...require('@playwright/test').devices['iPad Pro'],
      },
    },
    
    // Performance testing project
    {
      name: 'performance-audit',
      use: {
        ...baseConfig.use,
        viewport: { width: 1280, height: 720 },
        // Additional performance-specific settings
        deviceScaleFactor: 1,
      },
    }
  ],
  
  // Global test setup for comprehensive tests
  globalSetup: require.resolve('./comprehensive-global-setup.js'),
  
  // Test match patterns for comprehensive tests
  testMatch: [
    '../e2e/comprehensive/**/*.spec.js',
    '../e2e/comprehensive/**/*.test.js'
  ]
});
