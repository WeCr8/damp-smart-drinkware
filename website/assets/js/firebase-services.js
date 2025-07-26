/**
 * DAMP Smart Drinkware - Firebase Services Integration
 * Enhanced with Storage, Remote Config, Analytics, and Cloud Messaging
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  projectId: "damp-smart-drinkware",
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  messagingSenderId: "309818614427",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
  measurementId: "G-YW2BN4SVPQ",
  databaseURL: "https://damp-smart-drinkware-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const remoteConfig = getRemoteConfig(app);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

// Remote Config settings
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1 hour
};

remoteConfig.defaultConfig = {
  'alert_distance_threshold': 10,
  'battery_warning_threshold': 20,
  'notification_cooldown_minutes': 15,
  'app_maintenance_mode': false,
  'support_contact_email': 'support@dampdrink.com'
};

// Cloud Messaging setup
let messagingInitialized = false;

export const initializeMessaging = async () => {
  if (messagingInitialized) return;
  
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'your-vapid-key' // Add your VAPID key
      });
      
      if (token) {
        console.log('FCM Token:', token);
        // Store token in user profile
        await storeMessagingToken(token);
      }
      
      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        
        // Show custom notification
        showNotification(payload.notification);
      });
      
      messagingInitialized = true;
    }
  } catch (error) {
    console.error('Error initializing messaging:', error);
  }
};

// Custom notification display
const showNotification = (notification) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/assets/images/logo/android-icon-192x192.png',
        tag: 'damp-notification',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });
    });
  }
};

// Store FCM token in user profile
const storeMessagingToken = async (token) => {
  if (auth.currentUser) {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        lastTokenUpdate: new Date()
      });
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }
};

// Remote Config helpers
export const getRemoteConfigValue = async (parameter) => {
  try {
    const { fetchAndActivate, getValue } = await import('firebase/remote-config');
    await fetchAndActivate(remoteConfig);
    return getValue(remoteConfig, parameter).asString();
  } catch (error) {
    console.error('Error fetching remote config:', error);
    return remoteConfig.defaultConfig[parameter];
  }
};

export const getRemoteConfigBoolean = async (parameter) => {
  try {
    const { fetchAndActivate, getValue } = await import('firebase/remote-config');
    await fetchAndActivate(remoteConfig);
    return getValue(remoteConfig, parameter).asBoolean();
  } catch (error) {
    console.error('Error fetching remote config:', error);
    return remoteConfig.defaultConfig[parameter] === 'true';
  }
};

export const getRemoteConfigNumber = async (parameter) => {
  try {
    const { fetchAndActivate, getValue } = await import('firebase/remote-config');
    await fetchAndActivate(remoteConfig);
    return getValue(remoteConfig, parameter).asNumber();
  } catch (error) {
    console.error('Error fetching remote config:', error);
    return parseInt(remoteConfig.defaultConfig[parameter]) || 0;
  }
};

// Analytics helpers
export const logEvent = (eventName, parameters = {}) => {
  try {
    const { logEvent: firebaseLogEvent } = analytics;
    firebaseLogEvent(analytics, eventName, parameters);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

export const logPageView = (pageName) => {
  logEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};

export const logUserAction = (action, details = {}) => {
  logEvent('user_action', {
    action_type: action,
    ...details
  });
};

// Storage helpers
export const uploadFile = async (file, path) => {
  try {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadProfileImage = async (file, userId) => {
  const path = `users/${userId}/profile/${file.name}`;
  return await uploadFile(file, path);
};

// Development environment setup
if (window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('Emulators already connected or not running');
  }
}

// Initialize services on load
document.addEventListener('DOMContentLoaded', () => {
  initializeMessaging();
  logPageView(document.title);
});

export default app; 