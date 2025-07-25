/**
 * DAMP Smart Drinkware - Playwright Global Setup
 * Runs once before all tests
 */

const { chromium } = require('@playwright/test');

module.exports = async (config) => {
  console.log('🎭 Starting Playwright global setup...');
  
  // Environment setup
  const isCI = process.env.CI === 'true';
  const baseURL = config.projects[0].use.baseURL;
  
  try {
    // Launch browser for setup
    const browser = await chromium.launch({
      headless: isCI
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Wait for application to be ready
    console.log(`🌐 Checking application availability at ${baseURL}...`);
    
    let retries = 0;
    const maxRetries = 30;
    
    while (retries < maxRetries) {
      try {
        const response = await page.goto(baseURL, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        if (response && response.ok()) {
          console.log('✅ Application is ready for testing');
          break;
        }
        throw new Error(`Server responded with status ${response?.status()}`);
      } catch (error) {
        retries++;
        console.log(`⏳ Waiting for application... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (retries === maxRetries) {
          throw new Error(`Application not available after ${maxRetries} attempts: ${error.message}`);
        }
      }
    }
    
    // Additional setup tasks
    await setupTestData(page);
    await validateCriticalFeatures(page);
    
    // Cleanup
    await browser.close();
    
    console.log('✅ Playwright global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Playwright global setup failed:', error.message);
    throw error;
  }
};

/**
 * Setup test data if needed
 */
async function setupTestData(page) {
  console.log('📊 Setting up test data...');
  
  // Clear any existing test data
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Set up test environment flags
  await page.evaluate(() => {
    localStorage.setItem('test-mode', 'true');
    localStorage.setItem('analytics-disabled', 'true');
  });
  
  console.log('✅ Test data setup completed');
}

/**
 * Validate critical application features
 */
async function validateCriticalFeatures(page) {
  console.log('🔍 Validating critical features...');
  
  try {
    // Check if main navigation is present
    await page.waitForSelector('nav, header', { timeout: 5000 });
    
    // Check if main content is loaded
    await page.waitForSelector('main, .hero-section', { timeout: 5000 });
    
    // Verify JavaScript is working
    const jsWorking = await page.evaluate(() => {
      return typeof window !== 'undefined' && document.readyState === 'complete';
    });
    
    if (!jsWorking) {
      throw new Error('JavaScript environment not properly initialized');
    }
    
    console.log('✅ Critical features validation passed');
    
  } catch (error) {
    console.warn('⚠️ Feature validation warning:', error.message);
    // Don't fail setup for validation warnings
  }
} 