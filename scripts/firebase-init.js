#!/usr/bin/env node

/**
 * DAMP Smart Drinkware - Firebase Database Initialization Script
 * 
 * This script initializes your Firestore database with all required collections,
 * documents, and sample data needed for the DAMP Smart Drinkware platform.
 * 
 * Usage:
 *   node scripts/firebase-init.js
 *   
 * Requirements:
 *   - Firebase Admin SDK
 *   - Firebase project configured
 *   - Appropriate permissions
 */

const admin = require('firebase-admin');
const path = require('path');

// Color console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    // Try to use service account key if available
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
    
    try {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'damp-smart-drinkware'
      });
      log('✅ Firebase Admin initialized with service account', 'green');
    } catch (error) {
      // Fallback to default credentials (works in Firebase environment)
      admin.initializeApp({
        projectId: 'damp-smart-drinkware'
      });
      log('✅ Firebase Admin initialized with default credentials', 'green');
    }
    
  } catch (error) {
    log('❌ Failed to initialize Firebase Admin:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Get Firestore instance
const db = admin.firestore();

// Database initialization functions
async function initializeGlobalStats() {
  log('📊 Initializing global stats...', 'blue');
  
  const statsRef = db.doc('stats/global');
  const statsData = {
    preOrders: 5247,
    rating: 4.9,
    countries: 50,
    totalVotes: 2847,
    newsletterSubscribers: 12000,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    salesData: {
      handle: 1250,
      siliconeBottom: 1800,
      cupSleeve: 950,
      babyBottle: 1000
    },
    metadata: {
      initialized: true,
      initializedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    }
  };
  
  await statsRef.set(statsData);
  log('✅ Global stats initialized', 'green');
}

async function initializeVotingCollections() {
  log('🗳️ Initializing voting collections...', 'blue');
  
  // Customer voting data
  const customerVotingRef = db.doc('voting/products');
  const customerVotingData = {
    type: 'authenticated',
    title: 'Customer Product Preferences',
    description: 'Authenticated votes from DAMP users and customers',
    products: {
      handle: {
        name: 'DAMP Handle',
        description: 'Universal clip-on handle for any drinkware',
        votes: 1245,
        percentage: 43.7
      },
      siliconeBottom: {
        name: 'Silicone Bottom',
        description: 'Non-slip smart base for bottles and tumblers',
        votes: 823,
        percentage: 28.9
      },
      cupSleeve: {
        name: 'Cup Sleeve',
        description: 'Adjustable smart sleeve with thermal insulation',
        votes: 512,
        percentage: 18.0
      },
      babyBottle: {
        name: 'Baby Bottle',
        description: 'Smart baby bottle with feeding tracking',
        votes: 267,
        percentage: 9.4
      }
    },
    totalVotes: 2847,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
    metadata: {
      initialized: true,
      initializedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };
  
  // Public voting data
  const publicVotingRef = db.doc('voting/public');
  const publicVotingData = {
    type: 'public',
    title: 'Community Product Demand',
    description: 'Open public voting for broader market insights',
    products: {
      handle: {
        name: 'DAMP Handle',
        description: 'Universal clip-on handle for any drinkware',
        votes: 2891,
        percentage: 41.2
      },
      siliconeBottom: {
        name: 'Silicone Bottom',
        description: 'Non-slip smart base for bottles and tumblers',
        votes: 1654,
        percentage: 23.6
      },
      cupSleeve: {
        name: 'Cup Sleeve',
        description: 'Adjustable smart sleeve with thermal insulation',
        votes: 1432,
        percentage: 20.4
      },
      babyBottle: {
        name: 'Baby Bottle',
        description: 'Smart baby bottle with feeding tracking',
        votes: 1042,
        percentage: 14.8
      }
    },
    totalVotes: 7019,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
    metadata: {
      initialized: true,
      initializedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };
  
  await Promise.all([
    customerVotingRef.set(customerVotingData),
    publicVotingRef.set(publicVotingData)
  ]);
  
  log('✅ Voting collections initialized', 'green');
}

async function createAdminUser() {
  log('👤 Creating admin user...', 'blue');
  
  try {
    // Create admin user in Firebase Auth
    const adminEmail = 'admin@dampdrink.com';
    const adminPassword = 'DampAdmin123!'; // Change this in production!
    
    let adminUser;
    try {
      adminUser = await admin.auth().createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'DAMP Administrator',
        emailVerified: true
      });
      log(`✅ Admin user created: ${adminEmail}`, 'green');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        adminUser = await admin.auth().getUserByEmail(adminEmail);
        log(`ℹ️ Admin user already exists: ${adminEmail}`, 'yellow');
      } else {
        throw error;
      }
    }
    
    // Create admin user document in Firestore
    const adminUserRef = db.doc(`users/${adminUser.uid}`);
    const adminUserData = {
      uid: adminUser.uid,
      email: adminEmail,
      displayName: 'DAMP Administrator',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        devicesConnected: 0,
        safeZonesCreated: 0,
        votesSubmitted: 0
      },
      permissions: {
        canManageVoting: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canExportData: true,
        canManageContent: true
      },
      metadata: {
        isInitialAdmin: true,
        initializedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };
    
    await adminUserRef.set(adminUserData);
    log('✅ Admin user document created in Firestore', 'green');
    log(`🔑 Admin credentials: ${adminEmail} / ${adminPassword}`, 'yellow');
    log('⚠️ IMPORTANT: Change the admin password immediately!', 'red');
    
  } catch (error) {
    log('❌ Failed to create admin user:', 'red');
    log(error.message, 'red');
  }
}

async function initializeSampleNewsletterSubscribers() {
  log('📧 Creating sample newsletter subscribers...', 'blue');
  
  const sampleSubscribers = [
    {
      email: 'beta.tester@example.com',
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'homepage_newsletter',
      status: 'active',
      preferences: {
        productUpdates: true,
        launchAlerts: true,
        marketingEmails: true,
        weeklyDigest: false
      },
      metadata: {
        userAgent: 'Sample User Agent',
        referrer: 'direct',
        timestamp: Date.now(),
        location: null
      },
      engagement: {
        subscriptionScore: 100,
        lastEngagement: admin.firestore.FieldValue.serverTimestamp(),
        engagementHistory: []
      },
      tags: ['beta_tester', 'early_adopter']
    },
    {
      email: 'product.enthusiast@example.com',
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: 'product_voting',
      status: 'active',
      preferences: {
        productUpdates: true,
        launchAlerts: true,
        marketingEmails: false,
        weeklyDigest: true
      },
      metadata: {
        userAgent: 'Sample User Agent',
        referrer: 'product-voting.html',
        timestamp: Date.now(),
        location: null
      },
      engagement: {
        subscriptionScore: 95,
        lastEngagement: admin.firestore.FieldValue.serverTimestamp(),
        engagementHistory: []
      },
      tags: ['voter', 'engaged_user', 'voted_handle'],
      votedProduct: 'handle'
    }
  ];
  
  const batch = db.batch();
  
  sampleSubscribers.forEach((subscriber, index) => {
    const subscriberRef = db.collection('newsletter_subscribers').doc();
    batch.set(subscriberRef, subscriber);
  });
  
  await batch.commit();
  log(`✅ Created ${sampleSubscribers.length} sample newsletter subscribers`, 'green');
}

async function initializeProductsCollection() {
  log('🛍️ Initializing products collection...', 'blue');
  
  const products = [
    {
      id: 'handle',
      name: 'DAMP Handle v1.0',
      shortName: 'Handle',
      description: 'Universal attachment for any drinkware',
      longDescription: 'Transform any cup into a smart device with our universal clip-on handle. Perfect for Stanley, Yeti, and most travel mugs.',
      price: 49.99,
      currency: 'USD',
      category: 'accessories',
      tags: ['universal', 'clip-on', 'smart', 'handle'],
      images: {
        primary: '/assets/images/products/damp-handle/damp-handle.png',
        gallery: []
      },
      specifications: {
        batteryLife: '6 months',
        connectivity: 'BLE 5.0',
        waterRating: 'IP67',
        compatibility: 'Universal',
        weight: '45g',
        dimensions: '8cm x 3cm x 2cm'
      },
      status: 'preorder',
      featured: true,
      votes: 1245,
      popularity: 95,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'siliconeBottom',
      name: 'Silicone Bottom v1.0',
      shortName: 'Silicone Bottom',
      description: 'Non-slip silicone base',
      longDescription: 'Non-slip silicone base that makes any cup smart. Dishwasher safe and durable.',
      price: 29.99,
      currency: 'USD',
      category: 'accessories',
      tags: ['silicone', 'non-slip', 'base', 'dishwasher-safe'],
      images: {
        primary: '/assets/images/products/silicone-bottom/silicone-bottom.png',
        gallery: []
      },
      specifications: {
        batteryLife: '6 months',
        connectivity: 'BLE 5.0',
        waterRating: 'IP67',
        compatibility: 'Most bottles and tumblers',
        weight: '35g',
        dimensions: '7cm diameter x 1.5cm height'
      },
      status: 'preorder',
      featured: true,
      votes: 823,
      popularity: 88,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'cupSleeve',
      name: 'Cup Sleeve v1.0',
      shortName: 'Cup Sleeve',
      description: 'Adjustable fit for most cups',
      longDescription: 'Adjustable sleeve with thermal insulation. Great for coffee cups and standard mugs.',
      price: 39.99,
      currency: 'USD',
      category: 'accessories',
      tags: ['sleeve', 'adjustable', 'thermal', 'insulation'],
      images: {
        primary: '/assets/images/products/cup-sleeve/cup-sleeve.png',
        gallery: []
      },
      specifications: {
        batteryLife: '6 months',
        connectivity: 'BLE 5.0',
        waterRating: 'IP67',
        compatibility: 'Coffee cups and standard mugs',
        weight: '55g',
        dimensions: 'Expandable 6-10cm diameter'
      },
      status: 'preorder',
      featured: true,
      votes: 512,
      popularity: 76,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'babyBottle',
      name: 'Baby Bottle v1.0',
      shortName: 'Baby Bottle',
      description: 'BPA-free smart bottle',
      longDescription: 'Smart baby bottle with feeding tracking and temperature monitoring for parents.',
      price: 79.99,
      currency: 'USD',
      category: 'baby',
      tags: ['baby', 'bottle', 'BPA-free', 'tracking', 'temperature'],
      images: {
        primary: '/assets/images/products/baby-bottle/baby-bottle.png',
        gallery: []
      },
      specifications: {
        batteryLife: '4 months',
        connectivity: 'BLE 5.0',
        waterRating: 'IP67',
        compatibility: 'Standalone product',
        weight: '180g',
        dimensions: '20cm height x 7cm diameter',
        capacity: '250ml'
      },
      status: 'preorder',
      featured: true,
      votes: 267,
      popularity: 65,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  const batch = db.batch();
  
  products.forEach(product => {
    const productRef = db.collection('products').doc(product.id);
    batch.set(productRef, product);
  });
  
  await batch.commit();
  log(`✅ Created ${products.length} products in collection`, 'green');
}

async function createCollectionIndexes() {
  log('📇 Collection indexes will be created automatically when needed', 'yellow');
  log('ℹ️ Deploy firestore.indexes.json using: firebase deploy --only firestore:indexes', 'blue');
}

// Main initialization function
async function initializeDatabase() {
  log('🚀 Starting DAMP Smart Drinkware database initialization...', 'cyan');
  log('', 'reset');
  
  try {
    // Initialize Firebase
    initializeFirebase();
    log('', 'reset');
    
    // Run all initialization functions
    await initializeGlobalStats();
    await initializeVotingCollections();
    await createAdminUser();
    await initializeSampleNewsletterSubscribers();
    await initializeProductsCollection();
    await createCollectionIndexes();
    
    log('', 'reset');
    log('🎉 Database initialization completed successfully!', 'green');
    log('', 'reset');
    log('📋 Next steps:', 'cyan');
    log('1. Update firestore security rules: firebase deploy --only firestore:rules', 'blue');
    log('2. Deploy database indexes: firebase deploy --only firestore:indexes', 'blue');
    log('3. Start Firebase emulators: firebase emulators:start', 'blue');
    log('4. Test your application: http://localhost:5000', 'blue');
    log('5. Check Firebase console: https://console.firebase.google.com/', 'blue');
    log('', 'reset');
    log('⚠️ Don\'t forget to change the admin password!', 'red');
    log('', 'reset');
    
  } catch (error) {
    log('❌ Database initialization failed:', 'red');
    log(error.message, 'red');
    if (error.stack) {
      log(error.stack, 'red');
    }
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  initializeDatabase().then(() => {
    process.exit(0);
  }).catch(error => {
    log('❌ Fatal error:', 'red');
    log(error.message, 'red');
    process.exit(1);
  });
}

module.exports = {
  initializeDatabase,
  initializeGlobalStats,
  initializeVotingCollections,
  createAdminUser,
  initializeSampleNewsletterSubscribers,
  initializeProductsCollection
}; 