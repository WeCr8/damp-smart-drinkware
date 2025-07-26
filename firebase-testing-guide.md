# DAMP Smart Drinkware - Firebase Testing Guide

## 🔔 Push Notifications Testing

### 1. Web Push Notifications

#### Setup Steps:
1. **Add Service Worker Registration** to your main HTML file:
```html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => console.log('SW registered:', registration))
    .catch(error => console.log('SW registration failed:', error));
}
</script>
```

2. **Test via Firebase Console:**
   - Go to https://console.firebase.google.com/project/damp-smart-drinkware/messaging
   - Click "Send your first message"
   - Fill in:
     - **Notification title**: "DAMP Alert Test"
     - **Notification text**: "Don't forget your drink!"
     - **Target**: "User segment" → "All users"
   - Click "Review" → "Publish"

3. **Test Custom Data Messages:**
```javascript
// Test payload for device alerts
{
  "notification": {
    "title": "🥤 Device Alert",
    "body": "Your DAMP device detected movement away from your drink"
  },
  "data": {
    "alert_type": "drink_abandonment",
    "device_id": "damp_handle_001",
    "distance": "15"
  }
}
```

#### Testing Scenarios:
- ✅ **Low Battery Alert**: Test with 15% battery level
- ✅ **Drink Abandonment**: Test when user moves >10m from device  
- ✅ **Connection Lost**: Test when Bluetooth disconnects
- ✅ **Device Pairing**: Test successful pairing notifications

### 2. Mobile Push Notifications

#### Required Dependencies:
```bash
npm install @react-native-firebase/messaging
npx react-native link @react-native-firebase/messaging
```

#### Test Commands:
```bash
# Test FCM token generation
npx react-native run-android --variant=debug
# Check logs for: "FCM Token: [your-token]"

# Send test notification via curl:
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "DAMP Test",
      "body": "Testing mobile notifications"
    }
  }'
```

---

## 📊 Analytics Testing

### 1. Verify Analytics Setup

#### Test in Browser Console:
```javascript
// Import analytics functions
import { trackProductView, trackDevicePairing } from './assets/js/damp-analytics-events.js';

// Test product view tracking
trackProductView('damp-handle-universal', 'DAMP Handle Universal', 'test');

// Test device pairing
trackDevicePairing('handle', 'bluetooth', true);

// Check Firebase Analytics in console
// Go to: https://console.firebase.google.com/project/damp-smart-drinkware/analytics
```

#### View Real-time Analytics:
1. Go to Firebase Console → Analytics → Realtime
2. Keep it open while testing events
3. Events should appear within 1-2 minutes

### 2. Business Metrics Testing

#### E-commerce Events:
```javascript
// Test pre-order funnel
trackPreOrderInitiated('damp-handle-universal', 'DAMP Handle Universal', 49.99);
trackPreOrderCompleted('order_123', 'damp-handle-universal', 'DAMP Handle Universal', 49.99);

// Test newsletter signups
trackNewsletterSignup('homepage', 'damp-handle-universal');

// Test voting
trackVoting('damp-handle-universal', 'public');
```

#### User Journey Tracking:
```javascript
// Track complete user journey
trackFunnelStep('awareness', 'damp-handle-universal');
trackFunnelStep('interest', 'damp-handle-universal');  
trackFunnelStep('intent', 'damp-handle-universal');
trackFunnelStep('purchase', 'damp-handle-universal');
```

---

## 📁 Storage Testing

### 1. Upload Product Images

#### Test via Browser Console:
```javascript
// Import storage functions
import { uploadProductImage } from './assets/js/damp-storage-manager.js';

// Test with file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await uploadProductImage(file, 'damp-handle-universal', 'gallery');
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
};
fileInput.click();
```

### 2. Test User Profile Images

#### Authentication Required:
```javascript
// First, ensure user is signed in
import { auth } from './assets/js/firebase-services.js';

if (auth.currentUser) {
  const userId = auth.currentUser.uid;
  
  // Test profile image upload
  const result = await uploadUserProfileImage(selectedFile, userId);
  console.log('Profile image uploaded:', result.url);
} else {
  console.log('User must be signed in to upload profile images');
}
```

### 3. Batch Upload Testing

#### Test Multiple Files:
```javascript
import { dampStorage } from './assets/js/damp-storage-manager.js';

// Test batch upload
const files = [file1, file2, file3]; // Array of File objects
const results = await dampStorage.uploadMultipleFiles(
  files, 
  'products/damp-handle-universal/gallery',
  { prefix: 'gallery' }
);
console.log('Batch upload results:', results);
```

---

## ⚙️ Remote Config Testing

### 1. Test Configuration Values

#### Browser Testing:
```javascript
// Import remote config functions
import { getRemoteConfigValue, getRemoteConfigBoolean, getRemoteConfigNumber } from './assets/js/firebase-services.js';

// Test configuration retrieval
const alertDistance = await getRemoteConfigNumber('alert_distance_threshold');
console.log('Alert distance:', alertDistance, 'meters');

const supportEmail = await getRemoteConfigValue('support_contact_email');
console.log('Support email:', supportEmail);

const maintenanceMode = await getRemoteConfigBoolean('app_maintenance_mode');
console.log('Maintenance mode:', maintenanceMode);
```

### 2. Update Remote Config Values

#### Firebase Console Steps:
1. Go to https://console.firebase.google.com/project/damp-smart-drinkware/config
2. Click "Add parameter" or edit existing ones
3. Test different values:
   - `alert_distance_threshold`: Try 5, 10, 15
   - `battery_warning_threshold`: Try 10, 20, 30
   - `app_maintenance_mode`: Toggle true/false
4. Click "Publish changes"

#### Test Configuration Updates:
```javascript
// Force fetch latest config (normally cached for 1 hour)
import { remoteConfig } from './assets/js/firebase-services.js';
import { fetchAndActivate } from 'firebase/remote-config';

await fetchAndActivate(remoteConfig);
console.log('Remote config updated');

// Test new values
const newAlertDistance = await getRemoteConfigNumber('alert_distance_threshold');
console.log('Updated alert distance:', newAlertDistance);
```

---

## 🔧 Development Tools & Debugging

### 1. Firebase Emulator Testing

#### Start Emulators:
```bash
firebase emulators:start
```

#### Access Emulator UI:
- **Emulator Suite**: http://localhost:4000
- **Firestore**: http://localhost:4000/firestore
- **Storage**: http://localhost:4000/storage
- **Functions**: http://localhost:4000/functions

### 2. Debug Analytics Events

#### Analytics Debug View:
1. Install Google Analytics Debugger Chrome extension
2. Enable debug mode in console:
```javascript
gtag('config', 'G-YW2BN4SVPQ', {
  debug_mode: true
});
```
3. View events in real-time at: Analytics → DebugView

### 3. Storage Debug

#### Check Storage Rules:
```bash
firebase firestore:rules:get
firebase storage:rules:get
```

#### Test Storage Permissions:
```javascript
// Test unauthorized access (should fail)
try {
  await uploadUserProfileImage(file, 'different-user-id');
  console.log('ERROR: Unauthorized access allowed!');
} catch (error) {
  console.log('GOOD: Unauthorized access blocked:', error.message);
}
```

---

## 🚀 Production Testing Checklist

### Pre-Launch Tests:
- [ ] **Push notifications** work on web and mobile
- [ ] **Analytics events** are firing correctly
- [ ] **Storage uploads** work with proper security
- [ ] **Remote config** updates are applied
- [ ] **Authentication** integrates with all services
- [ ] **Error handling** works for all failure scenarios

### Load Testing:
- [ ] **Concurrent uploads**: Test 10+ simultaneous file uploads
- [ ] **Analytics volume**: Send 100+ events rapidly
- [ ] **Push notification delivery**: Test to 100+ devices
- [ ] **Storage quotas**: Monitor usage approaching limits

### Security Testing:
- [ ] **Unauthorized access** is properly blocked
- [ ] **File size limits** are enforced
- [ ] **Content type validation** works
- [ ] **User isolation** prevents cross-user access

---

## 📈 Monitoring & Alerts

### Firebase Console Monitoring:
1. **Analytics**: https://console.firebase.google.com/project/damp-smart-drinkware/analytics
2. **Cloud Messaging**: https://console.firebase.google.com/project/damp-smart-drinkware/messaging  
3. **Storage**: https://console.firebase.google.com/project/damp-smart-drinkware/storage
4. **Remote Config**: https://console.firebase.google.com/project/damp-smart-drinkware/config

### Set Up Alerts:
- **Storage quota** approaching 80%
- **Analytics errors** increasing
- **Push notification failures** above 5%
- **Function timeouts** or errors

This guide ensures your Firebase services are working correctly before production deployment! 🎯 