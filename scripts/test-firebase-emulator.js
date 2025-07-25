#!/usr/bin/env node

/**
 * DAMP Smart Drinkware - Firebase Connection Test (Emulator Version)
 * 
 * This script tests the Firebase emulator connection and basic functionality
 * to ensure everything is set up correctly.
 */

const admin = require('firebase-admin');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Initialize Firebase Admin for emulator
function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      // Initialize for emulator environment
      admin.initializeApp({
        projectId: 'damp-smart-drinkware'
      });
      
      // Connect to Firestore emulator
      const db = admin.firestore();
      db.settings({
        host: 'localhost:8080',
        ssl: false
      });
    }
    log('✅ Firebase Admin initialized for emulator', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to initialize Firebase Admin for emulator:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Test Firestore connection
async function testFirestoreConnection() {
  log('🔄 Testing Firestore emulator connection...', 'blue');
  
  try {
    const db = admin.firestore();
    
    // Try to read the global stats document
    const statsRef = db.doc('stats/global');
    const statsSnap = await statsRef.get();
    
    if (statsSnap.exists) {
      const data = statsSnap.data();
      log('✅ Firestore emulator connection successful', 'green');
      log(`📊 Global stats found: ${data.preOrders} pre-orders, ${data.totalVotes} votes`, 'cyan');
      return true;
    } else {
      log('⚠️ Firestore connected but no global stats found', 'yellow');
      log('   Run: node scripts/firebase-init-emulator.js to initialize data', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Firestore emulator connection failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Test voting collections
async function testVotingCollections() {
  log('🔄 Testing voting collections...', 'blue');
  
  try {
    const db = admin.firestore();
    
    // Test customer voting
    const customerVotingRef = db.doc('voting/products');
    const customerVotingSnap = await customerVotingRef.get();
    
    // Test public voting
    const publicVotingRef = db.doc('voting/public');
    const publicVotingSnap = await publicVotingRef.get();
    
    if (customerVotingSnap.exists && publicVotingSnap.exists) {
      const customerData = customerVotingSnap.data();
      const publicData = publicVotingSnap.data();
      
      log('✅ Voting collections found', 'green');
      log(`🗳️ Customer votes: ${customerData.totalVotes}`, 'cyan');
      log(`🌍 Public votes: ${publicData.totalVotes}`, 'cyan');
      return true;
    } else {
      log('⚠️ Voting collections not found', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Voting collections test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Test newsletter subscribers collection
async function testNewsletterCollection() {
  log('🔄 Testing newsletter subscribers collection...', 'blue');
  
  try {
    const db = admin.firestore();
    
    // Try to read newsletter subscribers
    const subscribersRef = db.collection('newsletter_subscribers');
    const subscribersSnap = await subscribersRef.limit(5).get();
    
    log('✅ Newsletter collection accessible', 'green');
    log(`📧 Sample subscribers found: ${subscribersSnap.size}`, 'cyan');
    
    // Log some sample emails (for testing only)
    subscribersSnap.docs.forEach(doc => {
      const data = doc.data();
      log(`   - ${data.email} (${data.source})`, 'cyan');
    });
    
    return true;
  } catch (error) {
    log('❌ Newsletter collection test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Test products collection
async function testProductsCollection() {
  log('🔄 Testing products collection...', 'blue');
  
  try {
    const db = admin.firestore();
    
    const productsRef = db.collection('products');
    const productsSnap = await productsRef.get();
    
    if (productsSnap.size > 0) {
      log('✅ Products collection found', 'green');
      log(`🛍️ Products available: ${productsSnap.size}`, 'cyan');
      
      // List product names
      const productNames = productsSnap.docs.map(doc => doc.data().name);
      log(`   Products: ${productNames.join(', ')}`, 'cyan');
      return true;
    } else {
      log('⚠️ Products collection is empty', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Products collection test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Test if emulator is running
async function testEmulatorStatus() {
  log('🔄 Testing emulator status...', 'blue');
  
  try {
    const response = await fetch('http://localhost:4000');
    if (response.ok) {
      log('✅ Firebase emulator UI accessible', 'green');
      log('   Firebase UI: http://localhost:4000', 'cyan');
      return true;
    } else {
      log('⚠️ Firebase emulator UI not responding', 'yellow');
      return false;
    }
  } catch (error) {
    log('⚠️ Firebase emulator UI not accessible', 'yellow');
    log('   Make sure to run: firebase emulators:start', 'yellow');
    return false;
  }
}

// Test sample data write (to verify write permissions)
async function testDataWrite() {
  log('🔄 Testing data write capabilities...', 'blue');
  
  try {
    const db = admin.firestore();
    
    // Try to write a test document
    const testRef = db.collection('test_collection').doc('test_doc');
    await testRef.set({
      message: 'Test write successful',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Try to read it back
    const testSnap = await testRef.get();
    if (testSnap.exists) {
      log('✅ Data write/read successful', 'green');
      
      // Clean up test document
      await testRef.delete();
      log('   Test document cleaned up', 'cyan');
      return true;
    } else {
      log('⚠️ Could not read test document back', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Data write test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Main test function
async function runTests() {
  log('🧪 DAMP Smart Drinkware - Firebase Emulator Test', 'cyan');
  log('===============================================', 'cyan');
  log('', 'reset');
  
  const results = [];
  
  // Initialize Firebase
  const firebaseInit = initializeFirebase();
  if (!firebaseInit) {
    log('❌ Cannot proceed without Firebase initialization', 'red');
    process.exit(1);
  }
  
  log('', 'reset');
  
  // Run all tests
  results.push({ name: 'Emulator Status', result: await testEmulatorStatus() });
  results.push({ name: 'Firestore Connection', result: await testFirestoreConnection() });
  results.push({ name: 'Data Write/Read', result: await testDataWrite() });
  results.push({ name: 'Voting Collections', result: await testVotingCollections() });
  results.push({ name: 'Newsletter Collection', result: await testNewsletterCollection() });
  results.push({ name: 'Products Collection', result: await testProductsCollection() });
  
  log('', 'reset');
  log('📋 Test Results Summary:', 'cyan');
  log('========================', 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(test => {
    if (test.result) {
      log(`✅ ${test.name}`, 'green');
      passed++;
    } else {
      log(`❌ ${test.name}`, 'red');
      failed++;
    }
  });
  
  log('', 'reset');
  log(`📊 Results: ${passed} passed, ${failed} failed`, passed === results.length ? 'green' : 'yellow');
  
  if (passed === results.length) {
    log('', 'reset');
    log('🎉 All tests passed! Your Firebase emulator setup is working correctly.', 'green');
    log('', 'reset');
    log('🚀 Your development environment is ready:', 'cyan');
    log('1. Website: http://localhost:5000', 'blue');
    log('2. Product Voting: http://localhost:5000/pages/product-voting.html', 'blue');
    log('3. Firebase UI: http://localhost:4000', 'blue');
    log('4. Test newsletter signup and product voting!', 'blue');
    log('', 'reset');
    log('💡 Next steps for production:', 'yellow');
    log('   - Set up service account credentials', 'yellow');
    log('   - Run: firebase deploy', 'yellow');
  } else {
    log('', 'reset');
    log('⚠️ Some tests failed. Please check the errors above.', 'yellow');
    log('💡 Common fixes:', 'blue');
    log('   - Make sure emulators are running: firebase emulators:start', 'blue');
    log('   - Re-run initialization: node scripts/firebase-init-emulator.js', 'blue');
  }
  
  log('', 'reset');
}

// Handle script execution
if (require.main === module) {
  runTests().then(() => {
    process.exit(0);
  }).catch(error => {
    log('❌ Test execution failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  });
}

module.exports = { runTests }; 