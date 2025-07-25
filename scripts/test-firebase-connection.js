#!/usr/bin/env node

/**
 * DAMP Smart Drinkware - Firebase Connection Test
 * 
 * This script tests the Firebase connection and basic functionality
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

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: 'damp-smart-drinkware'
      });
    }
    log('✅ Firebase Admin initialized', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to initialize Firebase Admin:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Test Firestore connection
async function testFirestoreConnection() {
  log('🔄 Testing Firestore connection...', 'blue');
  
  try {
    const db = admin.firestore();
    
    // Try to read the global stats document
    const statsRef = db.doc('stats/global');
    const statsSnap = await statsRef.get();
    
    if (statsSnap.exists) {
      const data = statsSnap.data();
      log('✅ Firestore connection successful', 'green');
      log(`📊 Global stats found: ${data.preOrders} pre-orders, ${data.totalVotes} votes`, 'cyan');
      return true;
    } else {
      log('⚠️ Firestore connected but no global stats found', 'yellow');
      log('   Run: node scripts/firebase-init.js to initialize data', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Firestore connection failed:', 'red');
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
    return true;
  } catch (error) {
    log('❌ Newsletter collection test failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

// Test admin user
async function testAdminUser() {
  log('🔄 Testing admin user...', 'blue');
  
  try {
    const adminEmail = 'admin@dampdrink.com';
    
    // Try to get admin user from Auth
    const adminUser = await admin.auth().getUserByEmail(adminEmail);
    
    // Try to get admin user document from Firestore
    const db = admin.firestore();
    const adminUserRef = db.doc(`users/${adminUser.uid}`);
    const adminUserSnap = await adminUserRef.get();
    
    if (adminUserSnap.exists && adminUserSnap.data().role === 'admin') {
      log('✅ Admin user found and configured', 'green');
      log(`👤 Admin: ${adminEmail}`, 'cyan');
      return true;
    } else {
      log('⚠️ Admin user exists but not properly configured', 'yellow');
      return false;
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      log('⚠️ Admin user not found', 'yellow');
      log('   Run: node scripts/firebase-init.js to create admin user', 'yellow');
    } else {
      log('❌ Admin user test failed:', 'red');
      log(error.message, 'red');
    }
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

// Main test function
async function runTests() {
  log('🧪 DAMP Smart Drinkware - Firebase Connection Test', 'cyan');
  log('================================================', 'cyan');
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
  results.push({ name: 'Firestore Connection', result: await testFirestoreConnection() });
  results.push({ name: 'Voting Collections', result: await testVotingCollections() });
  results.push({ name: 'Newsletter Collection', result: await testNewsletterCollection() });
  results.push({ name: 'Admin User', result: await testAdminUser() });
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
    log('🎉 All tests passed! Your Firebase setup is working correctly.', 'green');
    log('', 'reset');
    log('🚀 Next steps:', 'cyan');
    log('1. Start Firebase emulators: firebase emulators:start', 'blue');
    log('2. Open your website: http://localhost:5000', 'blue');
    log('3. Test newsletter signup and product voting', 'blue');
    log('4. Check Firebase UI: http://localhost:4000', 'blue');
  } else {
    log('', 'reset');
    log('⚠️ Some tests failed. Please check the errors above.', 'yellow');
    log('💡 Try running: node scripts/firebase-init.js', 'blue');
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