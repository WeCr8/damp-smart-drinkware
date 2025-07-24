# DAMP Smart Drinkware Mobile App

## Overview
Mobile application for DAMP Smart Drinkware system. This app allows users to:
- Connect and manage DAMP devices
- Receive drink abandonment alerts
- Track hydration patterns
- Manage device settings
- View temperature data
- Pre-order new products

## Tech Stack
**Recommended:** React Native with Expo
**Alternative:** Flutter

## Firebase Configuration
The app is connected to the `damp-smart-drinkware` Firebase project with the following services:
- **Authentication** - User accounts and security
- **Firestore** - Real-time database for devices and user data
- **Analytics** - User behavior tracking
- **Cloud Functions** - Backend logic
- **Storage** - User profile images and device photos
- **Cloud Messaging** - Push notifications for drink alerts

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development - Mac only)

### Quick Start with Expo

1. **Initialize Expo project:**
   ```bash
   cd mobile-app
   npx create-expo-app DampSmartDrinkware --template typescript
   ```

2. **Install Firebase dependencies:**
   ```bash
   npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
   ```

3. **Install additional dependencies:**
   ```bash
   npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
   npm install react-native-screens react-native-safe-area-context
   npm install @expo/vector-icons expo-device expo-notifications
   ```

4. **Configure Firebase:**
   - Copy `config/firebase-config.js` to your project
   - Update iOS/Android app IDs when created
   - Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

### Project Structure
```
mobile-app/
├── config/
│   ├── firebase-config.js     # Firebase configuration
│   ├── google-services.json   # Android Firebase config (when created)
│   └── GoogleService-Info.plist # iOS Firebase config (when created)
├── src/
│   ├── components/            # Reusable UI components
│   ├── screens/              # App screens
│   ├── services/             # Firebase and API services
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   └── types/                # TypeScript type definitions
├── assets/                   # Images, fonts, etc.
└── README.md
```

## Core Features to Implement

### 1. Authentication
- [x] Email/password login
- [x] User registration
- [x] Password reset
- [ ] Social login (Google, Apple)
- [ ] Biometric authentication

### 2. Device Management
- [ ] BLE device discovery
- [ ] Device pairing
- [ ] Device status monitoring
- [ ] Battery level tracking
- [ ] Connection troubleshooting

### 3. Notifications
- [ ] Drink abandonment alerts
- [ ] Low battery warnings
- [ ] Temperature alerts
- [ ] Hydration reminders

### 4. Analytics Dashboard
- [ ] Daily hydration tracking
- [ ] Device usage statistics
- [ ] Temperature history
- [ ] Personal insights

### 5. E-commerce Integration
- [ ] Product catalog
- [ ] Pre-order functionality  
- [ ] Order tracking
- [ ] Payment processing

## Firebase Services Integration

### Authentication
```javascript
import { authService } from '../config/firebase-config';

// Sign in user
const handleSignIn = async (email, password) => {
  try {
    const user = await authService.signIn(email, password);
    // Navigate to main app
  } catch (error) {
    // Handle error
  }
};
```

### Device Data
```javascript
import { deviceService } from '../config/firebase-config';

// Get user devices
const loadDevices = async () => {
  try {
    const devices = await deviceService.getUserDevices();
    setDevices(devices);
  } catch (error) {
    // Handle error
  }
};
```

### Real-time Updates
```javascript
// Listen to device status changes
useEffect(() => {
  const unsubscribe = deviceService.onDeviceChanges((snapshot) => {
    const devices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setDevices(devices);
  });
  
  return unsubscribe;
}, []);
```

## BLE Integration
For Bluetooth Low Energy communication with DAMP devices:

```bash
npm install react-native-ble-plx
```

### Device Connection Flow
1. Scan for BLE devices
2. Filter for DAMP devices (specific service UUID)
3. Connect to selected device
4. Exchange authentication tokens
5. Subscribe to device notifications
6. Store device in Firebase

## Push Notifications Setup

### Configure Firebase Cloud Messaging
1. Enable FCM in Firebase Console
2. Configure APNs certificates (iOS)
3. Add notification handling code

```javascript
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

## Testing Strategy

### Unit Tests
- Firebase service functions
- Utility functions
- Component logic

### Integration Tests  
- Authentication flow
- Device pairing process
- Notification handling

### End-to-End Tests
- Complete user workflows
- Multi-device scenarios
- Offline functionality

## Deployment

### Development
```bash
expo start
```

### Production Build
```bash
# iOS
expo build:ios

# Android  
expo build:android
```

### App Store Deployment
1. Configure app metadata
2. Generate production builds
3. Submit to Apple App Store / Google Play Store

## Environment Variables
Create `.env` file:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=damp-smart-drinkware
EXPO_PUBLIC_API_URL=https://your-api.com
```

## Next Steps
1. [ ] Create iOS and Android Firebase apps
2. [ ] Set up React Native project structure
3. [ ] Implement authentication screens
4. [ ] Design device management UI
5. [ ] Integrate BLE functionality
6. [ ] Set up push notifications
7. [ ] Implement analytics tracking
8. [ ] Add e-commerce features
9. [ ] Conduct thorough testing
10. [ ] Deploy to app stores

## Support
For questions or issues:
- Email: zach@wecr8.info
- Firebase Console: [damp-smart-drinkware](https://console.firebase.google.com/project/damp-smart-drinkware)
- GitHub Issues: [Create Issue](https://github.com/WeCr8/damp-smart-drinkware/issues) 