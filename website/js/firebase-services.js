// Firebase services for DAMP Smart Drinkware
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { auth, db, storage, analytics } from './firebase-config.js';
import { logEvent } from 'firebase/analytics';

// Authentication Services
export const authService = {
  // Sign up new user
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        role: 'user'
      });
      
      logEvent(analytics, 'sign_up', { method: 'email' });
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      logEvent(analytics, 'login', { method: 'email' });
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
      logEvent(analytics, 'logout');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// Device Management Services
export const deviceService = {
  // Add new device
  async addDevice(deviceData) {
    try {
      const docRef = await addDoc(collection(db, 'devices'), {
        ...deviceData,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        status: 'active'
      });
      
      logEvent(analytics, 'device_added', { device_type: deviceData.type });
      return docRef.id;
    } catch (error) {
      console.error('Add device error:', error);
      throw error;
    }
  },

  // Get user devices
  async getUserDevices() {
    try {
      const q = query(
        collection(db, 'devices'),
        where('ownerId', '==', auth.currentUser.uid),
        orderBy('lastSeen', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get user devices error:', error);
      throw error;
    }
  },

  // Update device
  async updateDevice(deviceId, updateData) {
    try {
      const deviceRef = doc(db, 'devices', deviceId);
      await updateDoc(deviceRef, {
        ...updateData,
        lastUpdated: serverTimestamp()
      });
      
      logEvent(analytics, 'device_updated');
    } catch (error) {
      console.error('Update device error:', error);
      throw error;
    }
  },

  // Listen to device changes
  onDeviceChanges(callback) {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'devices'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    
    return onSnapshot(q, callback);
  }
};

// Pre-order Services
export const preOrderService = {
  // Create pre-order
  async createPreOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'preorders'), {
        ...orderData,
        userId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      
      logEvent(analytics, 'purchase', {
        transaction_id: docRef.id,
        value: orderData.total,
        currency: 'USD'
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create pre-order error:', error);
      throw error;
    }
  },

  // Get user pre-orders
  async getUserPreOrders() {
    try {
      if (!auth.currentUser) return [];
      
      const q = query(
        collection(db, 'preorders'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get user pre-orders error:', error);
      throw error;
    }
  }
};

// Product Services
export const productService = {
  // Get all products
  async getProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('featured', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // Get single product
  async getProduct(productId) {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }
};

// Analytics Services
export const analyticsService = {
  // Track page view
  trackPageView(page_title, page_location) {
    logEvent(analytics, 'page_view', {
      page_title,
      page_location
    });
  },

  // Track custom event
  trackEvent(event_name, parameters = {}) {
    logEvent(analytics, event_name, parameters);
  },

  // Track user engagement
  trackEngagement(engagement_time_msec) {
    logEvent(analytics, 'user_engagement', {
      engagement_time_msec
    });
  }
};

// Subscription Services
export const subscriptionService = {
  // Get user subscription status
  async getUserSubscription() {
    try {
      if (!auth.currentUser) return null;
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      
      return {
        tier: userData?.subscription?.tier || 'free',
        status: userData?.subscription?.status || 'active',
        priceId: userData?.subscription?.priceId || null,
        expiresAt: userData?.subscription?.expiresAt || null,
        deviceCount: userData?.stats?.devicesConnected || 0,
        safeZoneCount: userData?.stats?.safeZonesCreated || 0
      };
    } catch (error) {
      console.error('Get user subscription error:', error);
      throw error;
    }
  },

  // Update user subscription
  async updateSubscription(subscriptionData) {
    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        'subscription.tier': subscriptionData.tier,
        'subscription.status': subscriptionData.status,
        'subscription.priceId': subscriptionData.priceId,
        'subscription.expiresAt': subscriptionData.expiresAt,
        'subscription.updatedAt': serverTimestamp()
      });
      
      logEvent(analytics, 'subscription_updated', {
        tier: subscriptionData.tier,
        status: subscriptionData.status
      });
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  },

  // Check if user can perform action
  async canPerformAction(action, currentCount = 0) {
    try {
      const subscription = await this.getUserSubscription();
      const { canPerformAction } = await import('./subscription-config.js');
      
      return canPerformAction(subscription.tier, action, currentCount);
    } catch (error) {
      console.error('Can perform action error:', error);
      return false;
    }
  },

  // Get upgrade suggestion
  async getUpgradeSuggestion() {
    try {
      const subscription = await this.getUserSubscription();
      const { getUpgradeSuggestion } = await import('./subscription-config.js');
      
      return getUpgradeSuggestion(
        subscription.tier,
        subscription.deviceCount,
        subscription.safeZoneCount
      );
    } catch (error) {
      console.error('Get upgrade suggestion error:', error);
      return null;
    }
  }
};

// Safe Zone Services
export const safeZoneService = {
  // Add safe zone
  async addSafeZone(zoneData) {
    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      
      // Check if user can add more zones
      const canAdd = await subscriptionService.canPerformAction('add_safe_zone', zoneData.currentZoneCount || 0);
      if (!canAdd) {
        throw new Error('Zone limit reached for current subscription tier');
      }
      
      const docRef = await addDoc(collection(db, 'safe_zones'), {
        ...zoneData,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        active: true
      });
      
      // Update user stats
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        'stats.safeZonesCreated': increment(1)
      });
      
      logEvent(analytics, 'safe_zone_added', {
        zone_type: zoneData.type,
        zone_name: zoneData.name
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Add safe zone error:', error);
      throw error;
    }
  },

  // Get user safe zones
  async getUserSafeZones() {
    try {
      if (!auth.currentUser) return [];
      
      const q = query(
        collection(db, 'safe_zones'),
        where('userId', '==', auth.currentUser.uid),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get user safe zones error:', error);
      throw error;
    }
  },

  // Update safe zone
  async updateSafeZone(zoneId, updateData) {
    try {
      const zoneRef = doc(db, 'safe_zones', zoneId);
      await updateDoc(zoneRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      logEvent(analytics, 'safe_zone_updated');
    } catch (error) {
      console.error('Update safe zone error:', error);
      throw error;
    }
  },

  // Delete safe zone
  async deleteSafeZone(zoneId) {
    try {
      await updateDoc(doc(db, 'safe_zones', zoneId), {
        active: false,
        deletedAt: serverTimestamp()
      });
      
      // Update user stats
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        'stats.safeZonesCreated': increment(-1)
      });
      
      logEvent(analytics, 'safe_zone_deleted');
    } catch (error) {
      console.error('Delete safe zone error:', error);
      throw error;
    }
  }
};

// Storage Services
export const storageService = {
  // Upload file
  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  },

  // Delete file
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }
}; 