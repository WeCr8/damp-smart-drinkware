/**
 * DAMP Smart Drinkware - Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

// Import Firebase Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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
firebase.initializeApp(firebaseConfig);

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title || 'DAMP Alert';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new notification',
    icon: '/assets/images/logo/android-icon-192x192.png',
    badge: '/assets/images/logo/android-icon-96x96.png',
    tag: 'damp-notification',
    data: payload.data,
    actions: [
      {
        action: 'view_device',
        title: 'View Device',
        icon: '/assets/images/icons/device-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/images/icons/dismiss-icon.png'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const action = event.action;

  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'view_device') {
    // Open the device page
    event.waitUntil(
      clients.openWindow('/devices')
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the main app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal
  // You can send analytics here if needed
}); 