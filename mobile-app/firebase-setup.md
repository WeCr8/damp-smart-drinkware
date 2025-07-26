# DAMP Mobile App - Firebase Integration Setup

## Firebase Configuration

Your Firebase project configuration:
```typescript
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
```

## Required Dependencies

First, install the required Firebase packages:

```bash
# Core Firebase packages
npm install firebase @react-native-firebase/app @react-native-firebase/messaging
npm install @react-native-async-storage/async-storage

# Optional packages for full functionality
npm install @react-native-firebase/auth @react-native-firebase/firestore
npm install @react-native-firebase/functions @react-native-firebase/storage
npm install @react-native-firebase/remote-config @react-native-firebase/analytics
```

## iOS Setup

1. Add Firebase configuration to `ios/Runner/GoogleService-Info.plist`
2. Update `ios/Runner/Info.plist` with permission strings:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take photos for profile</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select profile photos</string>
```

## Android Setup

1. Add Firebase configuration to `android/app/google-services.json`
2. Update `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## Integration Steps

### 1. Initialize Firebase Services

```typescript
import { MessagingService } from './components/firebase/FirebaseConfig';

// In your App.tsx or main component
useEffect(() => {
  MessagingService.initialize();
}, []);
```

### 2. Use Remote Config

```typescript
import { getRemoteConfigValue, getRemoteConfigBoolean } from './components/firebase/FirebaseConfig';

// Get configuration values
const alertDistance = await getRemoteConfigNumber('alert_distance_threshold');
const isPairingV2Enabled = await getRemoteConfigBoolean('feature_device_pairing_v2');
```

### 3. Upload Files

```typescript
import { uploadProfileImage } from './components/firebase/FirebaseConfig';

// Upload user profile image
const imageUrl = await uploadProfileImage(imageUri, userId);
```

### 4. Log Analytics Events

```typescript
import { logScreenView, logUserAction } from './components/firebase/FirebaseConfig';

// Track screen views
logScreenView('DeviceListScreen');

// Track user actions
logUserAction('device_paired', { deviceType: 'handle' });
```

## Push Notifications Setup

### 1. Request Permissions
The MessagingService automatically requests notification permissions on initialization.

### 2. Handle Notifications
Background and foreground notifications are handled automatically through the MessagingService.

### 3. Custom Notification Actions
You can customize notification actions by modifying the MessagingService class.

## Development vs Production

### Development (Emulators)
- Firebase emulators are automatically connected when running on localhost
- Use the Firebase Emulator Suite for local testing

### Production
- Ensure all Firebase services are properly configured in the Firebase Console
- Update the firebaseConfig object with production values
- Test push notifications on physical devices

## Security Considerations

1. **Never commit** Firebase configuration files with real API keys to version control
2. Use environment variables for sensitive configuration
3. Implement proper Firestore security rules
4. Validate all user inputs before storing in Firebase

## Troubleshooting

### Common Issues:
1. **"Module not found"** - Install missing Firebase packages
2. **"Permission denied"** - Check Firestore security rules
3. **"Network error"** - Check internet connection and Firebase project settings
4. **Notifications not working** - Verify FCM configuration and device permissions

### Debug Commands:
```typescript
// Check remote config values
console.log(await getRemoteConfigValue('support_contact_email'));

// Verify messaging token
const token = await messaging().getToken();
console.log('FCM Token:', token);
``` 