# DAMP Global Store Architecture

**Enterprise-Level Global State Management for Web & Mobile Applications**

Built with Google Engineering Standards for production-ready cross-platform applications.

## 🌟 **Overview**

The DAMP Global Store is a comprehensive state management solution that seamlessly integrates Firebase authentication, Stripe payments, and real-time data synchronization across web and mobile platforms. Designed with enterprise-level patterns and security practices.

### **Key Features**

✅ **Cross-Platform Compatibility** - Works seamlessly on Web and Mobile  
✅ **Firebase Integration** - Complete authentication with email verification  
✅ **Stripe Integration** - Secure payment processing and subscriptions  
✅ **Real-Time Sync** - Automatic state synchronization across devices  
✅ **Enterprise Security** - Input validation, XSS protection, and rate limiting  
✅ **Professional Logging** - Structured logging with analytics integration  
✅ **Error Recovery** - Automatic retry logic and graceful error handling  
✅ **Performance Monitoring** - Built-in performance tracking and optimization  

---

## 🚀 **Quick Start**

### **1. Installation**

```bash
# Install required dependencies
npm install firebase @stripe/stripe-js
```

### **2. Configuration**

```javascript
import { initializeDAMPStore } from './store/damp-store-config.js';

// Initialize the global store
const store = await initializeDAMPStore({
    firebase: {
        apiKey: "your-firebase-api-key",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        // ... other Firebase config
    },
    stripe: {
        publishableKey: "pk_test_your_stripe_key"
    },
    environment: 'development' // or 'production'
});
```

### **3. Basic Usage**

```javascript
import { getDAMPStore, STATE_KEYS, ACTIONS } from './store/damp-store-config.js';

const store = getDAMPStore();

// Subscribe to authentication state
store.subscribe(STATE_KEYS.AUTH.STATE, (authState) => {
    console.log('Auth state changed:', authState);
});

// Dispatch authentication action
await store.dispatch({
    type: ACTIONS.AUTH.SIGN_UP,
    payload: {
        email: 'user@example.com',
        password: 'securePassword123',
        displayName: 'John Doe'
    }
});
```

---

## 🏗️ **Architecture Overview**

### **Core Components**

```
🏪 DAMP Global Store
├── 🔐 Authentication Module (Firebase)
├── 💳 Payment Module (Stripe)
├── 🔄 Sync Module (Cross-Platform)
├── 📊 Analytics Module
├── 🛡️ Security Validator
├── 📝 Logger System
└── ⚠️ Error Handler
```

### **Module Structure**

```
store/
├── core/
│   └── store-architecture.js     # Core store implementation
├── modules/
│   ├── firebase-module.js        # Firebase integration
│   ├── stripe-module.js          # Stripe integration
│   ├── auth-module.js            # Authentication management
│   ├── payment-module.js         # Payment processing
│   └── sync-module.js            # Cross-platform sync
├── utils/
│   ├── logger.js                 # Professional logging
│   ├── error-handler.js          # Error management
│   └── security-validator.js     # Security validation
├── damp-store-config.js          # Main configuration
└── README.md                     # This documentation
```

---

## 🔐 **Authentication System**

### **Complete Firebase Authentication**

```javascript
import { getDAMPStore, ACTIONS, STATE_KEYS } from './store/damp-store-config.js';

const store = getDAMPStore();

// 📧 Email/Password Sign Up
await store.dispatch({
    type: ACTIONS.AUTH.SIGN_UP,
    payload: {
        email: 'user@example.com',
        password: 'securePassword123',
        displayName: 'John Doe',
        profile: {
            firstName: 'John',
            lastName: 'Doe',
            preferences: { theme: 'dark' }
        }
    }
});

// 🔑 Email/Password Sign In
await store.dispatch({
    type: ACTIONS.AUTH.SIGN_IN,
    payload: {
        email: 'user@example.com',
        password: 'securePassword123'
    }
});

// 🔍 Google Sign In
await store.dispatch({
    type: ACTIONS.AUTH.SIGN_IN_GOOGLE
});

// 📱 Facebook Sign In
await store.dispatch({
    type: ACTIONS.AUTH.SIGN_IN_FACEBOOK
});

// ✉️ Send Email Verification
await store.dispatch({
    type: ACTIONS.AUTH.VERIFY_EMAIL
});

// 🔄 Password Reset
await store.dispatch({
    type: ACTIONS.AUTH.RESET_PASSWORD,
    payload: { email: 'user@example.com' }
});

// 👤 Update Profile
await store.dispatch({
    type: ACTIONS.AUTH.UPDATE_PROFILE,
    payload: {
        displayName: 'Jane Doe',
        photoURL: 'https://example.com/photo.jpg'
    }
});

// 🚪 Sign Out
await store.dispatch({
    type: ACTIONS.AUTH.SIGN_OUT
});
```

### **Authentication State Management**

```javascript
// Subscribe to authentication changes
const unsubscribe = store.subscribe(STATE_KEYS.AUTH.STATE, (authState) => {
    switch (authState) {
        case 'authenticated':
            console.log('User is signed in');
            // Redirect to dashboard
            break;
        case 'unauthenticated':
            console.log('User is signed out');
            // Redirect to login
            break;
        case 'loading':
            console.log('Authentication in progress');
            // Show loading spinner
            break;
        case 'error':
            console.log('Authentication error occurred');
            // Show error message
            break;
    }
});

// Get current user
const currentUser = store.getState(STATE_KEYS.AUTH.USER);
console.log('Current user:', currentUser);

// Check authentication status
const isAuthenticated = store.auth.isAuthenticated();
const isEmailVerified = store.auth.isEmailVerified();
```

---

## 💳 **Payment Processing**

### **Stripe Integration**

```javascript
// 💰 One-Time Payment
const paymentResult = await store.dispatch({
    type: ACTIONS.PAYMENTS.CREATE_PAYMENT_INTENT,
    payload: {
        amount: 2999, // $29.99 in cents
        currency: 'usd',
        metadata: {
            productId: 'damp_silicone_bottom',
            userId: store.getState(STATE_KEYS.AUTH.USER)?.uid
        }
    }
});

// Confirm payment with payment method
await store.dispatch({
    type: ACTIONS.PAYMENTS.CONFIRM_PAYMENT,
    payload: {
        clientSecret: paymentResult.clientSecret,
        paymentMethodData: {
            type: 'card',
            billing_details: {
                name: 'John Doe',
                email: 'user@example.com'
            }
        }
    }
});

// 🔄 Subscription Management
await store.dispatch({
    type: ACTIONS.PAYMENTS.CREATE_SUBSCRIPTION,
    payload: {
        priceId: 'price_1234567890',
        successUrl: 'https://yourdomain.com/success',
        cancelUrl: 'https://yourdomain.com/cancel'
    }
});

// Cancel subscription
await store.dispatch({
    type: ACTIONS.PAYMENTS.CANCEL_SUBSCRIPTION,
    payload: {
        subscriptionId: 'sub_1234567890',
        cancelAtPeriodEnd: true
    }
});
```

### **Payment UI Components**

```javascript
// Create Stripe Elements
const cardElement = store.stripe.createCardElement({
    style: {
        base: {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif'
        }
    }
});

// Mount to DOM
cardElement.mount('#card-element');

// Create Payment Element (unified UI)
const paymentElement = store.stripe.createPaymentElement({
    layout: 'tabs',
    paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
});

paymentElement.mount('#payment-element');
```

---

## 🔄 **Cross-Platform Synchronization**

### **Real-Time State Sync**

```javascript
// 🌐 Cross-Platform State (automatically syncs between web and mobile)
await store.setState(STATE_KEYS.USER.PREFERENCES, {
    theme: 'dark',
    notifications: {
        deviceAlerts: true,
        emailUpdates: false,
        pushNotifications: true
    },
    units: {
        temperature: 'fahrenheit',
        volume: 'imperial'
    }
});

// 📱 Device Management
await store.dispatch({
    type: ACTIONS.DEVICES.CONNECT,
    payload: {
        deviceId: 'damp_device_001',
        deviceType: 'silicone_bottom',
        connectionType: 'bluetooth'
    }
});

// 📍 Location Zones
await store.dispatch({
    type: ACTIONS.DEVICES.SET_LOCATION_ZONE,
    payload: {
        deviceId: 'damp_device_001',
        zones: [
            { 
                name: 'Home Office', 
                latitude: 40.7128, 
                longitude: -74.0060, 
                radius: 50 
            },
            { 
                name: 'Kitchen', 
                latitude: 40.7130, 
                longitude: -74.0062, 
                radius: 30 
            }
        ]
    }
});

// Listen for sync events
store.on('sync:received', (event) => {
    console.log('Received sync update from another device:', event);
});
```

---

## 🛡️ **Security & Validation**

### **Input Validation**

```javascript
import { SecurityValidator } from './store/utils/security-validator.js';

const validator = new SecurityValidator();

// Email validation
const emailResult = validator.validateEmail('user@example.com');
if (!emailResult.isValid) {
    console.log('Email errors:', emailResult.errors);
}

// Password strength validation
const passwordResult = validator.validatePassword('myPassword123!', {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true
});

// XSS protection
const xssResult = validator.validateXSS(userInput);
if (!xssResult.isValid) {
    console.log('Potential XSS detected:', xssResult.errors);
}

// Payment data validation
const paymentResult = validator.validatePaymentData({
    amount: 2999,
    currency: 'usd',
    metadata: { productId: 'damp_001' }
});
```

### **Rate Limiting**

```javascript
// Check rate limits
const isAllowed = validator.checkRateLimit('user_123', 'login_attempt');
if (!isAllowed) {
    console.log('Rate limit exceeded');
}
```

---

## 📝 **Professional Logging**

### **Structured Logging**

```javascript
import { Logger } from './store/utils/logger.js';

const logger = new Logger('MyComponent');

// Different log levels
logger.trace('Detailed debugging information');
logger.debug('Debug information for development');
logger.info('General application information');
logger.warn('Warning about potential issues');
logger.error('Error that occurred', errorObject);
logger.fatal('Critical system error', fatalError);

// Child loggers with context
const childLogger = logger.child('UserAuth', {
    userId: '12345',
    sessionId: 'abc-def-ghi'
});

childLogger.info('User signed in');
```

### **Analytics Integration**

```javascript
// Automatically sends ERROR and FATAL logs to:
// - Google Analytics
// - Firebase Analytics
// - Custom error reporting services

// Development mode stores logs in localStorage
// Production mode sends to analytics services
```

---

## ⚠️ **Error Handling & Recovery**

### **Automatic Error Recovery**

```javascript
import { ErrorHandler } from './store/utils/error-handler.js';

const errorHandler = new ErrorHandler();

// Handle errors with automatic recovery
const result = errorHandler.handleError('NETWORK_ERROR', error, {
    userId: '12345',
    operation: 'fetch_user_data'
});

console.log('Error handled:', result.handled);
console.log('Recovery attempted:', result.recovered);
console.log('User message:', result.userMessage);

// Automatic retry with exponential backoff
const data = await errorHandler.withRetry(async () => {
    return await fetch('/api/data');
}, {
    maxAttempts: 3,
    baseDelay: 1000,
    exponential: true
});
```

### **Custom Recovery Strategies**

```javascript
// Add custom recovery for specific errors
errorHandler.addRecoveryStrategy('AUTH_TOKEN_EXPIRED', (errorEntry) => {
    // Automatically refresh authentication token
    return { success: true, action: 'token_refreshed' };
});

errorHandler.addRecoveryStrategy('PAYMENT_FAILED', (errorEntry) => {
    // Suggest alternative payment method
    return { success: true, action: 'alternative_payment_suggested' };
});
```

---

## 📊 **Analytics & Monitoring**

### **Store Metrics**

```javascript
// Get comprehensive store metrics
const metrics = store.getMetrics();
console.log('Store metrics:', {
    isInitialized: metrics.isInitialized,
    platform: metrics.platform,
    stateKeys: metrics.stateKeys,
    subscriptionCount: metrics.subscriptionCount,
    uptime: metrics.uptime,
    memoryUsage: metrics.memoryUsage
});

// Error statistics
const errorStats = errorHandler.getErrorStats();
console.log('Error statistics:', {
    total: errorStats.total,
    lastHour: errorStats.lastHour,
    byType: errorStats.byType,
    mostCommon: errorStats.mostCommon
});

// Validation statistics
const validationStats = validator.getValidationStats();
console.log('Validation statistics:', validationStats);
```

### **Performance Monitoring**

```javascript
// Automatic performance tracking
store.on('metrics:updated', (metrics) => {
    console.log('Store performance update:', metrics);
    
    // Send to analytics
    if (window.gtag) {
        gtag('event', 'store_performance', {
            uptime: metrics.uptime,
            memory_usage: metrics.memoryUsage?.used,
            subscription_count: metrics.subscriptionCount
        });
    }
});
```

---

## 🧪 **Testing**

### **Unit Testing Example**

```javascript
import { DAMPStore } from './store/core/store-architecture.js';
import { AuthModule } from './store/modules/auth-module.js';

describe('DAMP Store Authentication', () => {
    let store;
    
    beforeEach(async () => {
        store = DAMPStore.getInstance();
        await store.initialize({
            firebase: mockFirebaseConfig,
            stripe: mockStripeConfig,
            environment: 'test'
        });
    });
    
    test('should authenticate user successfully', async () => {
        const authResult = await store.dispatch({
            type: 'AUTH_SIGN_IN',
            payload: {
                email: 'test@example.com',
                password: 'testPassword123'
            }
        });
        
        expect(authResult.uid).toBeDefined();
        expect(store.getState('auth/state')).toBe('authenticated');
    });
    
    afterEach(() => {
        store.destroy();
    });
});
```

---

## 🚀 **Production Deployment**

### **Environment Configuration**

```javascript
// Production configuration
const productionConfig = {
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        // ... other production Firebase config
    },
    stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY // pk_live_...
    },
    environment: 'production',
    storeOptions: {
        enableAnalytics: true,
        enableErrorReporting: true,
        enablePersistence: true
    }
};

const store = await initializeDAMPStore(productionConfig);
```

### **Security Best Practices**

1. **API Keys**: Store in environment variables, never in code
2. **HTTPS Only**: All Firebase and Stripe calls use HTTPS
3. **Input Validation**: All user inputs are validated and sanitized
4. **Rate Limiting**: Automatic rate limiting prevents abuse
5. **Error Handling**: Errors are logged but sensitive data is redacted
6. **Cross-Site Scripting (XSS)**: Built-in XSS protection
7. **SQL Injection**: Input validation prevents SQL injection

### **Performance Optimization**

1. **Lazy Loading**: Modules are loaded only when needed
2. **Memory Management**: Automatic cleanup of old data
3. **Caching**: Smart caching with expiration
4. **Batching**: Multiple operations are batched for efficiency
5. **Compression**: Data is compressed for network efficiency

---

## 🔧 **Advanced Usage**

### **Custom Middleware**

```javascript
// Add custom middleware for logging all actions
store.addMiddleware(async (type, data) => {
    if (type === 'DISPATCH') {
        console.log('Action dispatched:', data.type);
        
        // Add custom logic here
        if (data.type === 'SENSITIVE_ACTION') {
            // Additional security checks
            await performSecurityCheck(data);
        }
    }
    
    return data;
});
```

### **State Persistence**

```javascript
// Automatically persists critical state to localStorage
// Restores state on app restart

// Manual state backup
const stateBackup = {
    userPreferences: store.getState(STATE_KEYS.USER.PREFERENCES),
    deviceSettings: store.getState(STATE_KEYS.DEVICES.CONNECTED)
};

localStorage.setItem('dampStateBackup', JSON.stringify(stateBackup));
```

### **Real-Time Database Integration**

```javascript
// Automatic sync with Firebase Realtime Database
// Changes in the database automatically update the store
// Store changes automatically sync to the database

store.on('state:changed', (event) => {
    if (event.key.startsWith('user/')) {
        // Sync user data to Firebase
        console.log('Syncing user data to Firebase:', event);
    }
});
```

---

## 📱 **Mobile App Integration**

### **React Native Setup**

```javascript
// mobile-app/store/mobile-store-config.js
import { initializeDAMPStore } from '../web/store/damp-store-config.js';

// Same store, different platform
const mobileStore = await initializeDAMPStore({
    firebase: firebaseConfig,
    stripe: stripeConfig,
    environment: 'mobile',
    platform: 'react-native'
});

// State automatically syncs between web and mobile
export default mobileStore;
```

### **Platform-Specific Features**

```javascript
// Mobile-specific device features
await store.dispatch({
    type: ACTIONS.DEVICES.ENABLE_PUSH_NOTIFICATIONS,
    payload: {
        types: ['device_alerts', 'low_battery', 'zone_exit']
    }
});

// Web-specific features
await store.dispatch({
    type: ACTIONS.WEB.ENABLE_DESKTOP_NOTIFICATIONS,
    payload: {
        permission: 'granted'
    }
});
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Store Not Initialized**
   ```javascript
   // Error: Store not initialized
   // Solution: Call initialize() before using the store
   await initializeDAMPStore(config);
   ```

2. **Firebase Configuration Error**
   ```javascript
   // Error: Firebase configuration invalid
   // Solution: Check all required Firebase config values
   const config = {
       apiKey: "your-api-key", // Required
       authDomain: "your-domain", // Required
       projectId: "your-project" // Required
   };
   ```

3. **Stripe Key Issues**
   ```javascript
   // Error: Invalid Stripe key
   // Solution: Use correct publishable key format
   publishableKey: "pk_test_..." // Test
   publishableKey: "pk_live_..." // Production
   ```

### **Debug Mode**

```javascript
// Enable debug logging
localStorage.setItem('dampDebug', 'true');

// Or add ?debug=true to URL
// https://yourapp.com?debug=true

// View stored logs (development only)
import { getStoredLogs } from './store/utils/logger.js';
console.log('Stored logs:', getStoredLogs());
```

---

## 📚 **API Reference**

### **Store Methods**

| Method | Description | Example |
|--------|-------------|---------|
| `initialize(config)` | Initialize the store | `await store.initialize(config)` |
| `getState(key)` | Get state value | `store.getState('auth/user')` |
| `setState(key, value)` | Set state value | `await store.setState('user/theme', 'dark')` |
| `subscribe(key, callback)` | Subscribe to changes | `store.subscribe('auth/state', callback)` |
| `dispatch(action)` | Dispatch action | `await store.dispatch(action)` |
| `getMetrics()` | Get store metrics | `store.getMetrics()` |

### **Authentication Methods**

| Method | Description | Parameters |
|--------|-------------|------------|
| `signUp(userData)` | Create new user | `{ email, password, displayName, profile }` |
| `signIn(email, password)` | Sign in user | `email: string, password: string` |
| `signInWithGoogle()` | Google sign in | None |
| `signInWithFacebook()` | Facebook sign in | None |
| `signOut()` | Sign out user | None |
| `updateProfile(updates)` | Update profile | `{ displayName?, photoURL?, ... }` |

### **Payment Methods**

| Method | Description | Parameters |
|--------|-------------|------------|
| `createPaymentIntent(data)` | Create payment | `{ amount, currency, metadata }` |
| `confirmPayment(secret, method)` | Confirm payment | `clientSecret, paymentMethodData` |
| `createSubscription(data)` | Create subscription | `{ priceId, successUrl, cancelUrl }` |
| `cancelSubscription(id)` | Cancel subscription | `subscriptionId: string` |

---

## 🤝 **Contributing**

### **Development Setup**

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `config-template.env` to `config.env`
4. Add your Firebase and Stripe credentials
5. Run tests: `npm test`
6. Start development server: `npm run dev`

### **Code Standards**

- Follow Google JavaScript Style Guide
- Use TypeScript for type safety
- Write comprehensive unit tests
- Document all public methods
- Use semantic commit messages

---

## 📄 **License**

Copyright 2025 WeCr8 Solutions LLC. All rights reserved.

---

## 🆘 **Support**

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports
- **Questions**: Stack Overflow with `damp-store` tag
- **Email**: support@wecr8.info

---

**Built with ❤️ by WeCr8 Solutions LLC**  
*Production-ready global state management for the next generation of applications.* 