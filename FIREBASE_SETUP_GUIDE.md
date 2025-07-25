# DAMP Smart Drinkware - Firebase Setup Guide

## 🔥 Complete Firebase Backend Setup

This guide will help you set up the complete Firebase backend for your DAMP Smart Drinkware project, including Firestore database, authentication, and all the services needed for email capture and product voting.

## 📋 Prerequisites

1. **Firebase Account**: Create a [Firebase account](https://firebase.google.com/)
2. **Node.js**: Install Node.js (v16 or higher)
3. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

## 🚀 Step 1: Firebase Project Setup

### 1.1 Verify Project Configuration
Your Firebase project is already configured with these settings:
- **Project ID**: `damp-smart-drinkware`
- **Project URL**: `https://damp-smart-drinkware.firebaseapp.com`
- **Config**: Located in `website/js/firebase-config.js`

### 1.2 Firebase CLI Login
```bash
firebase login
```

### 1.3 Initialize Firebase in Your Project
```bash
cd /path/to/damp-smart-drinkware
firebase init
```

**Select these options:**
- ✅ Firestore: Configure security rules and indexes files
- ✅ Functions: Configure and deploy Cloud Functions
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Storage: Configure a security rules file for Cloud Storage
- ✅ Emulators: Set up local emulators

**Configuration choices:**
- Use existing project: `damp-smart-drinkware`
- Firestore Rules: `firestore.rules`
- Firestore Indexes: `firestore.indexes.json`
- Functions language: `JavaScript`
- Hosting public directory: `website`
- Single-page app: `No`
- Set up automatic builds: `No`

## 🗄️ Step 2: Firestore Database Setup

### 2.1 Create Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `damp-smart-drinkware` project
3. Go to **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (we'll secure it later)
6. Select your preferred location (e.g., `us-central1`)

### 2.2 Initialize Database Collections
Run the database initialization script:

```bash
node scripts/firebase-init.js
```

This script will create:
- ✅ Global stats collection
- ✅ Voting collections (customer & public)
- ✅ User management collections
- ✅ Newsletter subscriber collections
- ✅ Sample admin user

## 🔐 Step 3: Authentication Setup

### 3.1 Enable Authentication Methods
1. Go to **Authentication** > **Sign-in method**
2. Enable these providers:
   - ✅ **Email/Password**
   - ✅ **Google** (optional)
   - ✅ **Anonymous** (for public voting)

### 3.2 Configure Authorized Domains
Add your domains to **Authentication** > **Settings** > **Authorized domains**:
- `localhost` (for development)
- `dampdrink.com` (your production domain)
- `damp-smart-drinkware.web.app` (Firebase hosting)

## 🛡️ Step 4: Security Rules

### 4.1 Firestore Security Rules
Replace the content of `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to voting data
    match /voting/{document=**} {
      allow read: if true;
      allow write: if request.auth != null || isValidPublicVote();
    }
    
    // Public read access to global stats
    match /stats/global {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Newsletter subscribers - protected
    match /newsletter_subscribers/{document} {
      allow read, write: if isAdmin();
      allow create: if isValidEmailSubscription();
    }
    
    // User votes - protected
    match /userVotes/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if isAdmin();
    }
    
    // Public votes - browser fingerprint based
    match /publicVotes/{sessionId} {
      allow read, write: if true; // Controlled by client-side logic
    }
    
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if isAdmin();
    }
    
    // Admin functions
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Validate email subscription
    function isValidEmailSubscription() {
      return request.resource.data.keys().hasAll(['email', 'subscribedAt', 'status']) &&
             request.resource.data.email is string &&
             request.resource.data.email.matches('.*@.*\\..*');
    }
    
    // Validate public vote
    function isValidPublicVote() {
      return request.resource.data.keys().hasAll(['productId', 'hasVoted', 'votedAt']);
    }
  }
}
```

### 4.2 Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

## 📊 Step 5: Database Indexes

Update `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "newsletter_subscribers",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "subscribedAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "newsletter_subscribers",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "source", "order": "ASCENDING"},
        {"fieldPath": "subscribedAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "userVotes",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "hasVoted", "order": "ASCENDING"},
        {"fieldPath": "votedAt", "order": "DESCENDING"}
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## 🏗️ Step 6: Cloud Functions (Optional)

### 6.1 Create Email Functions
Create `functions/src/email-functions.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

// Send welcome email when user subscribes to newsletter
exports.sendWelcomeEmail = functions.firestore
  .document('newsletter_subscribers/{subscriberId}')
  .onCreate(async (snap, context) => {
    const subscriber = snap.data();
    
    // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
    console.log(`Welcome email would be sent to: ${subscriber.email}`);
    
    // Update subscriber with welcome email sent status
    return snap.ref.update({
      welcomeEmailSent: true,
      welcomeEmailSentAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

// Update global stats when voting changes
exports.updateVotingStats = functions.firestore
  .document('voting/{votingType}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const globalStatsRef = admin.firestore().doc('stats/global');
    
    return globalStatsRef.update({
      totalVotes: newData.totalVotes || 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  });
```

### 6.2 Deploy Functions
```bash
firebase deploy --only functions
```

## 🌐 Step 7: Firebase Hosting

### 7.1 Configure Hosting
Update `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "website",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "functions": {
      "port": 5001
    },
    "storage": {
      "port": 9199
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### 7.2 Deploy to Hosting
```bash
firebase deploy --only hosting
```

## 🧪 Step 8: Testing & Development

### 8.1 Start Local Emulators
```bash
firebase emulators:start
```

This starts:
- 🔥 Firestore Emulator: http://localhost:8080
- 🔐 Auth Emulator: http://localhost:9099
- 🌐 Hosting Emulator: http://localhost:5000
- 🎛️ Firebase UI: http://localhost:4000

### 8.2 Test Your Implementation

1. **Open your website**: http://localhost:5000
2. **Test Newsletter Signup**: Fill out the newsletter form on homepage
3. **Test Product Voting**: Vote on products and check email capture
4. **Check Firebase UI**: View data at http://localhost:4000

### 8.3 Verify Data in Firestore
Check these collections were created:
- ✅ `newsletter_subscribers`
- ✅ `voting/products`
- ✅ `voting/public`
- ✅ `stats/global`
- ✅ `users`
- ✅ `userVotes`
- ✅ `publicVotes`

## 🔧 Step 9: Production Deployment

### 9.1 Update Security Rules for Production
Change from test mode to production rules:

```bash
firebase deploy --only firestore:rules
```

### 9.2 Deploy Everything
```bash
firebase deploy
```

### 9.3 Set Environment Variables
If using external email services, set these in Firebase Functions:

```bash
firebase functions:config:set email.sendgrid_key="your-sendgrid-key"
firebase functions:config:set email.from_address="noreply@dampdrink.com"
```

## 📈 Step 10: Monitoring & Analytics

### 10.1 Enable Google Analytics
1. Go to **Project Settings** > **Integrations**
2. Click **Google Analytics** > **Enable**
3. Create or link existing GA4 property

### 10.2 Set Up Performance Monitoring
```bash
npm install firebase
```

Add to your website:
```javascript
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Check Firestore security rules
   - Verify user authentication
   - Run: `firebase deploy --only firestore:rules`

2. **"Module not found" errors**
   - Run: `npm install` in functions directory
   - Check import paths in firebase-config.js

3. **Emulator connection issues**
   - Clear browser cache
   - Check if ports are available
   - Restart emulators: `firebase emulators:start --only firestore,auth`

4. **Email capture not working**
   - Check browser console for errors
   - Verify Firebase services are loaded
   - Test with emulators first

## ✅ Success Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database initialized with collections
- [ ] Authentication enabled (Email/Password)
- [ ] Security rules deployed
- [ ] Database indexes created
- [ ] Local emulators working
- [ ] Newsletter signup functional
- [ ] Product voting system working
- [ ] Email capture after voting working
- [ ] Admin user created
- [ ] Production deployment successful

## 📞 Support

If you encounter issues:
1. Check the [Firebase documentation](https://firebase.google.com/docs)
2. Review browser console errors
3. Test with Firebase emulators first
4. Check Firestore security rules

Your DAMP Smart Drinkware Firebase backend is now ready! 🎉 