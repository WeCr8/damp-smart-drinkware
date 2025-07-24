import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import * as express from 'express';
import Stripe from 'stripe';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Initialize CORS
const corsHandler = cors({ origin: true });

// Initialize Stripe (you'll need to add your secret key to Firebase Functions config)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Express app for API endpoints
const app = express();
app.use(corsHandler);
app.use(express.json());

// ==================== AUTHENTICATION TRIGGERS ====================

/**
 * Trigger when a new user is created
 * Creates user profile in Firestore
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'user',
      preferences: {
        notifications: {
          drinkAlerts: true,
          batteryWarnings: true,
          temperatureAlerts: true,
          marketingEmails: false,
        },
        units: {
          temperature: 'fahrenheit',
          volume: 'oz',
        },
      },
      stats: {
        devicesConnected: 0,
        totalDrinks: 0,
        streakDays: 0,
      },
    };

    await db.collection('users').doc(user.uid).set(userDoc);
    
    functions.logger.info(`User profile created for ${user.email}`);
  } catch (error) {
    functions.logger.error('Error creating user profile:', error);
  }
});

/**
 * Trigger when user is deleted
 * Clean up user data
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user document
    await db.collection('users').doc(user.uid).delete();
    
    // Delete user's devices
    const devicesSnapshot = await db.collection('devices')
      .where('ownerId', '==', user.uid)
      .get();
    
    const batch = db.batch();
    devicesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    functions.logger.info(`User data cleaned up for ${user.email}`);
  } catch (error) {
    functions.logger.error('Error cleaning up user data:', error);
  }
});

// ==================== DEVICE MANAGEMENT ====================

/**
 * Cloud Function to handle device pairing
 */
export const pairDevice = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { deviceId, deviceName, deviceType, bluetoothAddress } = data;

  if (!deviceId || !deviceName || !deviceType) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required device information');
  }

  try {
    const deviceDoc = {
      deviceId: deviceId,
      name: deviceName,
      type: deviceType,
      bluetoothAddress: bluetoothAddress,
      ownerId: context.auth.uid,
      pairedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      status: 'connected',
      batteryLevel: 100,
      firmwareVersion: '1.0.0',
      settings: {
        alertDistance: 10, // meters
        temperatureAlerts: true,
        vibrationEnabled: true,
      },
    };

    const docRef = await db.collection('devices').add(deviceDoc);
    
    // Update user stats
    await db.collection('users').doc(context.auth.uid).update({
      'stats.devicesConnected': admin.firestore.FieldValue.increment(1),
    });

    return { success: true, deviceDocId: docRef.id };
  } catch (error) {
    functions.logger.error('Error pairing device:', error);
    throw new functions.https.HttpsError('internal', 'Failed to pair device');
  }
});

/**
 * Cloud Function to handle device status updates
 */
export const updateDeviceStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { deviceDocId, status, batteryLevel, temperature, lastSeen } = data;

  try {
    const updateData: any = {
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel;
    if (temperature !== undefined) updateData['currentData.temperature'] = temperature;

    await db.collection('devices').doc(deviceDocId).update(updateData);

    // Send low battery notification if needed
    if (batteryLevel !== undefined && batteryLevel < 20) {
      await sendLowBatteryNotification(context.auth.uid, deviceDocId, batteryLevel);
    }

    return { success: true };
  } catch (error) {
    functions.logger.error('Error updating device status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update device status');
  }
});

// ==================== NOTIFICATIONS ====================

/**
 * Send drink abandonment alert
 */
export const sendDrinkAlert = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { deviceDocId, location } = data;

  try {
    // Get user's FCM token
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken) {
      const message = {
        token: fcmToken,
        notification: {
          title: '🥤 Don\'t forget your drink!',
          body: 'You\'re moving away from your DAMP device. Don\'t leave your drink behind!',
        },
        data: {
          type: 'drink_alert',
          deviceId: deviceDocId,
          location: location || '',
        },
      };

      await admin.messaging().send(message);
    }

    // Log the alert
    await db.collection('alerts').add({
      userId: context.auth.uid,
      deviceId: deviceDocId,
      type: 'drink_abandonment',
      location: location,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false,
    });

    return { success: true };
  } catch (error) {
    functions.logger.error('Error sending drink alert:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send drink alert');
  }
});

/**
 * Send low battery notification
 */
async function sendLowBatteryNotification(userId: string, deviceId: string, batteryLevel: number) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (fcmToken) {
      const message = {
        token: fcmToken,
        notification: {
          title: '🔋 Low Battery Alert',
          body: `Your DAMP device battery is at ${batteryLevel}%. Please charge soon.`,
        },
        data: {
          type: 'low_battery',
          deviceId: deviceId,
          batteryLevel: batteryLevel.toString(),
        },
      };

      await admin.messaging().send(message);
    }
  } catch (error) {
    functions.logger.error('Error sending low battery notification:', error);
  }
}

// ==================== E-COMMERCE ====================

/**
 * Create Stripe checkout session for pre-orders
 */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { priceId, quantity = 1, successUrl, cancelUrl } = data;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: context.auth?.token.email,
      metadata: {
        userId: context.auth?.uid || '',
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    functions.logger.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
  }
});

/**
 * Handle successful payments
 */
export const handlePaymentSuccess = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    res.status(400).send('Webhook secret not configured');
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Create order record
      await db.collection('orders').add({
        stripeSessionId: session.id,
        userId: session.metadata?.userId || null,
        customerEmail: session.customer_email,
        amount: session.amount_total,
        currency: session.currency,
        status: 'paid',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Payment successful for session ${session.id}`);
    }

    res.status(200).send('Webhook handled');
  } catch (error) {
    functions.logger.error('Webhook error:', error);
    res.status(400).send('Webhook error');
  }
});

// ==================== ANALYTICS ====================

/**
 * Aggregate daily analytics
 */
export const aggregateDailyAnalytics = functions.pubsub
  .schedule('0 1 * * *') // Run daily at 1 AM UTC
  .onRun(async (context) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Get all devices that were active yesterday
      const devicesSnapshot = await db.collection('devices')
        .where('lastSeen', '>=', yesterday)
        .get();

      const analytics = {
        date: yesterday.toISOString().split('T')[0],
        activeDevices: devicesSnapshot.size,
        totalAlerts: 0,
        averageBatteryLevel: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Calculate additional metrics
      let totalBattery = 0;
      devicesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalBattery += data.batteryLevel || 0;
      });
      
      analytics.averageBatteryLevel = devicesSnapshot.size > 0 
        ? Math.round(totalBattery / devicesSnapshot.size) 
        : 0;

      // Get alerts count for yesterday
      const alertsSnapshot = await db.collection('alerts')
        .where('timestamp', '>=', yesterday)
        .get();
      
      analytics.totalAlerts = alertsSnapshot.size;

      // Save analytics
      await db.collection('daily_analytics').add(analytics);
      
      functions.logger.info(`Daily analytics aggregated: ${JSON.stringify(analytics)}`);
    } catch (error) {
      functions.logger.error('Error aggregating daily analytics:', error);
    }
  });

// ==================== API ENDPOINTS ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get user dashboard data
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user devices
    const devicesSnapshot = await db.collection('devices')
      .where('ownerId', '==', userId)
      .get();
    
    const devices = devicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get recent alerts
    const alertsSnapshot = await db.collection('alerts')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const alerts = alertsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({
      devices,
      alerts,
      stats: {
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.status === 'connected').length,
        recentAlerts: alerts.length,
      },
    });
  } catch (error) {
    functions.logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== STRIPE INTEGRATION ====================

// Subscription configuration matching our website config
const SUBSCRIPTION_PRODUCTS = {
  'price_1ReWLYCcrIDahSGRUnhZ9GpV': {
    tier: 'damp_plus',
    name: 'DAMP+',
    maxDevices: 3,
    maxSafeZones: 5
  },
  'price_1ReWMUCcrIDahSGRJgVqS4ns': {
    tier: 'damp_family', 
    name: 'DAMP Family',
    maxDevices: 10,
    maxSafeZones: -1 // Unlimited
  }
};

/**
 * Create Stripe Checkout Session
 * Used by subscription page to initiate payments
 */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { priceId, successUrl, cancelUrl } = data;

    // Validate price ID
    if (!SUBSCRIPTION_PRODUCTS[priceId]) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid price ID');
    }

    const product = SUBSCRIPTION_PRODUCTS[priceId];
    const userId = context.auth.uid;

    // Get user email from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userRecord.email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        tier: product.tier,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: product.tier,
        },
      },
    });

    functions.logger.info(`Created checkout session for user ${userId}: ${session.id}`);
    
    return { 
      sessionId: session.id,
      url: session.url 
    };
  } catch (error) {
    functions.logger.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
  }
});

/**
 * Handle Stripe Webhook Events
 * Processes subscription status changes
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    functions.logger.info(`Received Stripe webhook: ${event.type}`);
  } catch (err) {
    functions.logger.error('Webhook signature verification failed:', err);
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        functions.logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    functions.logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper function to handle completed checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription as string;
  
  if (!userId) {
    functions.logger.error('No user ID in checkout session');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;
  const product = SUBSCRIPTION_PRODUCTS[priceId];

  if (!product) {
    functions.logger.error(`Unknown price ID: ${priceId}`);
    return;
  }

  // Update user subscription in Firestore
  await db.collection('users').doc(userId).update({
    'subscription.tier': product.tier,
    'subscription.status': 'active',
    'subscription.priceId': priceId,
    'subscription.stripeSubscriptionId': subscriptionId,
    'subscription.stripeCustomerId': subscription.customer,
    'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
    'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Updated subscription for user ${userId} to ${product.tier}`);
}

// Helper function to handle subscription changes
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const priceId = subscription.items.data[0].price.id;
  const product = SUBSCRIPTION_PRODUCTS[priceId];

  if (!userId || !product) {
    functions.logger.error('Missing user ID or unknown product in subscription');
    return;
  }

  await db.collection('users').doc(userId).update({
    'subscription.status': subscription.status,
    'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
    'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Helper function to handle subscription cancellation
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    functions.logger.error('No user ID in canceled subscription');
    return;
  }

  await db.collection('users').doc(userId).update({
    'subscription.tier': 'free',
    'subscription.status': 'canceled',
    'subscription.canceledAt': admin.firestore.FieldValue.serverTimestamp(),
    'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info(`Canceled subscription for user ${userId}`);
}

// Helper function to handle successful payments
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  functions.logger.info(`Payment succeeded for subscription: ${invoice.subscription}`);
  // Add any additional logic for successful payments
}

// Helper function to handle failed payments
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  functions.logger.error(`Payment failed for subscription: ${invoice.subscription}`);
  // Add logic to handle failed payments (email notifications, etc.)
}

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app); 