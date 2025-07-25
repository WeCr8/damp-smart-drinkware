/**
 * DAMP Smart Drinkware - Global Authentication Service
 * 
 * Unified authentication system for website, mobile app, and e-commerce
 * Handles user profiles, preferences, and seamless cross-platform experience
 */

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser
} from 'firebase/auth';

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';

class DAMPAuthService {
  constructor(auth, firestore, analytics) {
    this.auth = auth;
    this.db = firestore;
    this.analytics = analytics;
    this.currentUser = null;
    this.authStateListeners = [];
    
    // Initialize auth state listener
    this.initializeAuthState();
    
    // Providers
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');
    
    this.facebookProvider = new FacebookAuthProvider();
    this.facebookProvider.addScope('email');
  }

  /**
   * Initialize authentication state monitoring
   */
  initializeAuthState() {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        // User is signed in
        await this.handleUserSignIn(user);
        this.trackAnalytics('user_sign_in', { method: 'state_change' });
      } else {
        // User is signed out
        this.handleUserSignOut();
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(callback => callback(user));
    });
  }

  /**
   * Handle user sign in - create/update profile
   */
  async handleUserSignIn(user) {
    try {
      const userRef = doc(this.db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user profile
        await this.createUserProfile(user);
      } else {
        // Update last sign in
        await updateDoc(userRef, {
          lastSignIn: serverTimestamp(),
          isOnline: true
        });
      }
      
      // Update global stats
      await this.updateGlobalStats('userSignIn');
      
    } catch (error) {
      console.error('Error handling user sign in:', error);
    }
  }

  /**
   * Handle user sign out
   */
  async handleUserSignOut() {
    if (this.currentUser) {
      try {
        // Update user status to offline
        const userRef = doc(this.db, 'users', this.currentUser.uid);
        await updateDoc(userRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating user status on sign out:', error);
      }
    }
  }

  /**
   * Create user profile in Firestore
   */
  async createUserProfile(user, additionalData = {}) {
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
      lastSignIn: serverTimestamp(),
      isOnline: true,
      
      // DAMP-specific profile data
      profile: {
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        phone: additionalData.phone || '',
        dateOfBirth: additionalData.dateOfBirth || null,
        gender: additionalData.gender || '',
        location: {
          country: additionalData.country || '',
          state: additionalData.state || '',
          city: additionalData.city || '',
          zipCode: additionalData.zipCode || ''
        }
      },
      
      // Preferences
      preferences: {
        newsletter: true,
        productUpdates: true,
        launchAlerts: true,
        marketingEmails: false,
        weeklyDigest: true,
        appNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: 'auto'
      },
      
      // DAMP ecosystem data
      damp: {
        devices: [],
        totalDevices: 0,
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: serverTimestamp(),
          endDate: null
        },
        votingHistory: [],
        totalVotes: 0,
        favoriteProducts: [],
        wishlist: [],
        safeZones: [],
        achievements: [],
        referralCode: this.generateReferralCode(user.uid)
      },
      
      // E-commerce data
      orders: {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        favoriteCategories: [],
        averageOrderValue: 0
      },
      
      // Analytics and engagement
      analytics: {
        firstVisit: serverTimestamp(),
        totalSessions: 1,
        lastActivity: serverTimestamp(),
        deviceInfo: this.getDeviceInfo(),
        acquisitionSource: additionalData.source || 'direct'
      },
      
      // Account settings
      account: {
        role: 'user', // user, premium, admin
        status: 'active', // active, inactive, suspended
        verificationLevel: user.emailVerified ? 'email' : 'none', // none, email, phone, both
        twoFactorEnabled: false,
        loginAttempts: 0,
        lastPasswordChange: serverTimestamp()
      }
    };
    
    const userRef = doc(this.db, 'users', user.uid);
    await setDoc(userRef, userProfile);
    
    // Track user registration
    this.trackAnalytics('user_registration', {
      method: additionalData.signInMethod || 'email',
      source: additionalData.source || 'direct'
    });
    
    return userProfile;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email, password, additionalData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update display name if provided
      if (additionalData.displayName) {
        await updateProfile(user, {
          displayName: additionalData.displayName
        });
      }
      
      // Create user profile
      await this.createUserProfile(user, {
        ...additionalData,
        signInMethod: 'email'
      });
      
      // Send email verification
      await this.sendEmailVerification();
      
      return {
        success: true,
        user: user,
        message: 'Account created successfully! Please check your email for verification.'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      this.trackAnalytics('user_sign_in', { method: 'email' });
      
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in successfully!'
      };
      
    } catch (error) {
      // Track failed login attempt
      await this.trackFailedLogin(email, error.code);
      
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;
      
      this.trackAnalytics('user_sign_in', { method: 'google' });
      
      return {
        success: true,
        user: user,
        message: 'Signed in with Google successfully!'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Sign in with Facebook
   */
  async signInWithFacebook() {
    try {
      const result = await signInWithPopup(this.auth, this.facebookProvider);
      const user = result.user;
      
      this.trackAnalytics('user_sign_in', { method: 'facebook' });
      
      return {
        success: true,
        user: user,
        message: 'Signed in with Facebook successfully!'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await firebaseSignOut(this.auth);
      
      this.trackAnalytics('user_sign_out');
      
      return {
        success: true,
        message: 'Signed out successfully!'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.code,
        message: 'Error signing out. Please try again.'
      };
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(uid = null) {
    const userId = uid || this.currentUser?.uid;
    if (!userId) return null;
    
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
      
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    try {
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      
      // Update Firestore profile
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      
      // Update Firebase Auth profile if display name or photo changed
      const authUpdates = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.photoURL) authUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(this.currentUser, authUpdates);
      }
      
      this.trackAnalytics('user_profile_update');
      
      return { success: true, message: 'Profile updated successfully!' };
      
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Error updating profile. Please try again.' };
    }
  }

  /**
   * Link newsletter subscription to user account
   */
  async linkNewsletterSubscription(email, preferences = {}) {
    if (!this.currentUser) return;
    
    try {
      // Update user preferences
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      await updateDoc(userRef, {
        'preferences.newsletter': true,
        'preferences.productUpdates': preferences.productUpdates !== false,
        'preferences.launchAlerts': preferences.launchAlerts !== false,
        'preferences.marketingEmails': preferences.marketingEmails === true,
        'preferences.weeklyDigest': preferences.weeklyDigest !== false,
        newsletterLinkedAt: serverTimestamp()
      });
      
      // Find and update newsletter subscription
      const newsletterQuery = query(
        collection(this.db, 'newsletter_subscribers'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(newsletterQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        await updateDoc(doc.ref, {
          userId: this.currentUser.uid,
          linkedAt: serverTimestamp(),
          status: 'linked'
        });
      }
      
      this.trackAnalytics('newsletter_account_link');
      
    } catch (error) {
      console.error('Error linking newsletter subscription:', error);
    }
  }

  /**
   * Add device to user account
   */
  async addDevice(deviceData) {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    try {
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      const userProfile = await this.getUserProfile();
      
      const device = {
        id: deviceData.id || this.generateDeviceId(),
        name: deviceData.name || 'My DAMP Device',
        type: deviceData.type || 'handle',
        model: deviceData.model || 'v1.0',
        serialNumber: deviceData.serialNumber || null,
        purchaseDate: deviceData.purchaseDate || serverTimestamp(),
        activatedAt: serverTimestamp(),
        status: 'active',
        batteryLevel: 100,
        lastSeen: serverTimestamp(),
        safeZones: [],
        settings: {
          notifications: true,
          autoTracking: true,
          findMyDevice: true,
          batteryAlerts: true
        }
      };
      
      const updatedDevices = [...(userProfile?.damp?.devices || []), device];
      
      await updateDoc(userRef, {
        'damp.devices': updatedDevices,
        'damp.totalDevices': updatedDevices.length,
        deviceAddedAt: serverTimestamp()
      });
      
      this.trackAnalytics('device_added', { device_type: device.type });
      
      return { success: true, device, message: 'Device added successfully!' };
      
    } catch (error) {
      console.error('Error adding device:', error);
      return { success: false, message: 'Error adding device. Please try again.' };
    }
  }

  /**
   * Submit vote and link to user account
   */
  async submitUserVote(productId, voteData = {}) {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    try {
      // Add vote to user's voting history
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      const userProfile = await this.getUserProfile();
      
      const vote = {
        productId,
        votedAt: serverTimestamp(),
        ip: voteData.ip || null,
        userAgent: navigator.userAgent,
        ...voteData
      };
      
      const votingHistory = [...(userProfile?.damp?.votingHistory || []), vote];
      
      await updateDoc(userRef, {
        'damp.votingHistory': votingHistory,
        'damp.totalVotes': votingHistory.length,
        lastVoteAt: serverTimestamp()
      });
      
      this.trackAnalytics('user_vote_submitted', { product_id: productId });
      
      return { success: true, message: 'Vote submitted successfully!' };
      
    } catch (error) {
      console.error('Error submitting user vote:', error);
      return { success: false, message: 'Error submitting vote. Please try again.' };
    }
  }

  /**
   * Get user's order history
   */
  async getUserOrders() {
    if (!this.currentUser) return [];
    
    try {
      const ordersQuery = query(
        collection(this.db, 'orders'),
        where('userId', '==', this.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      const orders = [];
      
      querySnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      return orders.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification() {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    try {
      await sendEmailVerification(this.currentUser);
      return { success: true, message: 'Verification email sent!' };
    } catch (error) {
      return { success: false, message: 'Error sending verification email.' };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Update password
   */
  async updateUserPassword(newPassword) {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    try {
      await updatePassword(this.currentUser, newPassword);
      
      // Update last password change in profile
      const userRef = doc(this.db, 'users', this.currentUser.uid);
      await updateDoc(userRef, {
        'account.lastPasswordChange': serverTimestamp()
      });
      
      return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
      return { success: false, message: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount() {
    if (!this.currentUser) {
      throw new Error('No user signed in');
    }
    
    try {
      const userId = this.currentUser.uid;
      
      // Delete user profile from Firestore
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        'account.status': 'deleted',
        deletedAt: serverTimestamp()
      });
      
      // Delete Firebase Auth account
      await deleteUser(this.currentUser);
      
      this.trackAnalytics('user_account_deleted');
      
      return { success: true, message: 'Account deleted successfully.' };
    } catch (error) {
      return { success: false, message: 'Error deleting account. Please try again.' };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Utility functions
   */
  generateReferralCode(uid) {
    return `DAMP${uid.slice(-6).toUpperCase()}`;
  }
  
  generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
  
  async trackFailedLogin(email, errorCode) {
    try {
      // Track failed login attempts for security
      const failedLoginRef = doc(collection(this.db, 'security_logs'));
      await setDoc(failedLoginRef, {
        type: 'failed_login',
        email: email,
        errorCode: errorCode,
        timestamp: serverTimestamp(),
        ip: await this.getClientIP(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error tracking failed login:', error);
    }
  }
  
  async getClientIP() {
    // This would typically use a service to get the client's IP
    // For privacy reasons, we'll just return a placeholder
    return 'unknown';
  }
  
  async updateGlobalStats(action) {
    try {
      const statsRef = doc(this.db, 'stats', 'global');
      
      switch (action) {
        case 'userSignIn':
          await updateDoc(statsRef, {
            totalSignIns: increment(1),
            lastActivity: serverTimestamp()
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error updating global stats:', error);
    }
  }
  
  trackAnalytics(eventName, parameters = {}) {
    if (this.analytics && typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
    
    // Firebase Analytics
    if (this.analytics && window.firebaseServices?.analyticsService) {
      window.firebaseServices.analyticsService.logEvent(eventName, parameters);
    }
  }
  
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/requires-recent-login': 'Please sign in again to perform this action.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

// Export the class
export default DAMPAuthService; 