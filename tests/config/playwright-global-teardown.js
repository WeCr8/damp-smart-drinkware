/**
 * DAMP Smart Drinkware - Playwright Global Teardown
 * Runs once after all tests complete
 */

module.exports = async (config) => {
  console.log('🎭 Starting Playwright global teardown...');
  
  try {
    // Cleanup test data
    await cleanupTestData();
    
    // Generate test summary
    await generateTestSummary();
    
    console.log('✅ Playwright global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Playwright global teardown failed:', error.message);
    // Don't throw error to avoid masking test results
  }
};

/**
 * Cleanup any test data or resources
 */
async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  // Here you could cleanup:
  // - Test databases
  // - Test files
  // - External services
  // - API keys or tokens
  
  console.log('✅ Test data cleanup completed');
}

/**
 * Generate test execution summary
 */
async function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  const summary = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    ci: process.env.CI === 'true',
    baseUrl: process.env.E2E_BASE_URL || 'http://localhost:3003'
  };
  
  console.log('📋 Test Execution Summary:', JSON.stringify(summary, null, 2));
  console.log('✅ Test summary generated');
} 