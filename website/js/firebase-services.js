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
  increment,
  setDoc,
  writeBatch
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
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        role: 'user',
        stats: {
          devicesConnected: 0,
          safeZonesCreated: 0,
          votesSubmitted: 0
        }
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

  // Check if user is admin
  async isAdmin(user) {
    if (!user) return false;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  },

  // Get current user data
  async getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// Real-time Stats Services
export const statsService = {
  // Initialize default stats if they don't exist
  async initializeStats() {
    try {
      const statsDoc = await getDoc(doc(db, 'stats', 'global'));
      if (!statsDoc.exists()) {
        await setDoc(doc(db, 'stats', 'global'), {
          preOrders: 5000,
          rating: 4.9,
          countries: 50,
          totalVotes: 2847,
          lastUpdated: serverTimestamp(),
          salesData: {
            handle: 1250,
            siliconeBottom: 1800,
            cupSleeve: 950,
            babyBottle: 1000
          }
        });
      }
    } catch (error) {
      console.error('Initialize stats error:', error);
    }
  },

  // Get real-time stats
  onStatsChange(callback) {
    return onSnapshot(doc(db, 'stats', 'global'), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  },

  // Update stats (admin only)
  async updateStats(updates, user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      await updateDoc(doc(db, 'stats', 'global'), {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      
      logEvent(analytics, 'admin_stats_update', { 
        admin_uid: user.uid,
        updates: Object.keys(updates)
      });
    } catch (error) {
      console.error('Update stats error:', error);
      throw error;
    }
  },

  // Increment pre-order count
  async incrementPreOrders() {
    try {
      await updateDoc(doc(db, 'stats', 'global'), {
        preOrders: increment(1),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Increment pre-orders error:', error);
    }
  },

  // Update product sales
  async updateProductSales(productId, quantity = 1) {
    try {
      await updateDoc(doc(db, 'stats', 'global'), {
        [`salesData.${productId}`]: increment(quantity),
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Update product sales error:', error);
    }
  }
};

// Voting System Services
export const votingService = {
  // Initialize voting data
  async initializeVoting() {
    try {
      const votingDoc = await getDoc(doc(db, 'voting', 'products'));
      if (!votingDoc.exists()) {
        await setDoc(doc(db, 'voting', 'products'), {
          products: {
            handle: {
              name: 'DAMP Handle',
              description: 'Universal clip-on handle for any drinkware',
              votes: 1245,
              percentage: 43.7
            },
            siliconeBottom: {
              name: 'Silicone Bottom',
              description: 'Non-slip smart base for bottles and tumblers',
              votes: 823,
              percentage: 28.9
            },
            cupSleeve: {
              name: 'Cup Sleeve',
              description: 'Adjustable smart sleeve with thermal insulation',
              votes: 512,
              percentage: 18.0
            },
            babyBottle: {
              name: 'Baby Bottle',
              description: 'Smart baby bottle with feeding tracking',
              votes: 267,
              percentage: 9.4
            }
          },
          totalVotes: 2847,
          lastUpdated: serverTimestamp(),
          isActive: true
        });
      }
    } catch (error) {
      console.error('Initialize voting error:', error);
    }
  },

  // Get real-time voting data
  onVotingChange(callback) {
    return onSnapshot(doc(db, 'voting', 'products'), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  },

  // Submit a vote (requires authentication)
  async submitVote(productId, user) {
    if (!user) {
      throw new Error('Authentication required to vote');
    }

    try {
      // Check if user has already voted
      const userVoteDoc = await getDoc(doc(db, 'userVotes', user.uid));
      if (userVoteDoc.exists() && userVoteDoc.data().hasVoted) {
        throw new Error('You have already voted. Only one vote per user is allowed.');
      }

      // Use batch to ensure atomicity
      const batch = writeBatch(db);

      // Record user's vote
      batch.set(doc(db, 'userVotes', user.uid), {
        productId: productId,
        hasVoted: true,
        votedAt: serverTimestamp(),
        userEmail: user.email
      });

      // Update voting totals
      batch.update(doc(db, 'voting', 'products'), {
        [`products.${productId}.votes`]: increment(1),
        totalVotes: increment(1),
        lastUpdated: serverTimestamp()
      });

      // Update user stats
      batch.update(doc(db, 'users', user.uid), {
        'stats.votesSubmitted': increment(1)
      });

      await batch.commit();

      // Recalculate percentages
      await this.recalculatePercentages();

      logEvent(analytics, 'vote_submitted', { 
        product: productId,
        user_id: user.uid
      });

    } catch (error) {
      console.error('Submit vote error:', error);
      throw error;
    }
  },

  // Check if user has voted
  async hasUserVoted(user) {
    if (!user) return false;
    
    try {
      const userVoteDoc = await getDoc(doc(db, 'userVotes', user.uid));
      return userVoteDoc.exists() && userVoteDoc.data().hasVoted;
    } catch (error) {
      console.error('Check vote status error:', error);
      return false;
    }
  },

  // Get user's vote
  async getUserVote(user) {
    if (!user) return null;
    
    try {
      const userVoteDoc = await getDoc(doc(db, 'userVotes', user.uid));
      return userVoteDoc.exists() ? userVoteDoc.data() : null;
    } catch (error) {
      console.error('Get user vote error:', error);
      return null;
    }
  },

  // Recalculate vote percentages
  async recalculatePercentages() {
    try {
      const votingDoc = await getDoc(doc(db, 'voting', 'products'));
      if (!votingDoc.exists()) return;

      const data = votingDoc.data();
      const totalVotes = data.totalVotes || 0;
      
      if (totalVotes === 0) return;

      const updates = {};
      Object.keys(data.products).forEach(productId => {
        const votes = data.products[productId].votes || 0;
        const percentage = ((votes / totalVotes) * 100).toFixed(1);
        updates[`products.${productId}.percentage`] = parseFloat(percentage);
      });

      await updateDoc(doc(db, 'voting', 'products'), {
        ...updates,
        lastUpdated: serverTimestamp()
      });

    } catch (error) {
      console.error('Recalculate percentages error:', error);
    }
  },

  // Admin: Reset voting (requires admin)
  async resetVoting(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Reset voting data
      await updateDoc(doc(db, 'voting', 'products'), {
        'products.handle.votes': 0,
        'products.siliconeBottom.votes': 0,
        'products.cupSleeve.votes': 0,
        'products.babyBottle.votes': 0,
        totalVotes: 0,
        lastUpdated: serverTimestamp()
      });

      // Clear all user votes
      const userVotesQuery = query(collection(db, 'userVotes'));
      const userVotesSnapshot = await getDocs(userVotesQuery);
      
      const batch = writeBatch(db);
      userVotesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      await this.recalculatePercentages();

      logEvent(analytics, 'admin_voting_reset', { 
        admin_uid: user.uid
      });

    } catch (error) {
      console.error('Reset voting error:', error);
      throw error;
    }
  },

  // Admin: Toggle voting status
  async toggleVotingStatus(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const votingDoc = await getDoc(doc(db, 'voting', 'products'));
      const currentStatus = votingDoc.exists() ? votingDoc.data().isActive : true;

      await updateDoc(doc(db, 'voting', 'products'), {
        isActive: !currentStatus,
        lastUpdated: serverTimestamp()
      });

      logEvent(analytics, 'admin_voting_toggle', { 
        admin_uid: user.uid,
        new_status: !currentStatus
      });

    } catch (error) {
      console.error('Toggle voting status error:', error);
      throw error;
    }
  }
};

// Admin Services
export const adminService = {
  // Get admin dashboard data
  async getDashboardData(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const [statsDoc, votingDoc, usersSnapshot] = await Promise.all([
        getDoc(doc(db, 'stats', 'global')),
        getDoc(doc(db, 'voting', 'products')),
        getDocs(query(collection(db, 'users'), limit(100)))
      ]);

      return {
        stats: statsDoc.exists() ? statsDoc.data() : null,
        voting: votingDoc.exists() ? votingDoc.data() : null,
        userCount: usersSnapshot.size,
        users: usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw error;
    }
  },

  // Update user role (super admin only)
  async updateUserRole(targetUserId, newRole, user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      await updateDoc(doc(db, 'users', targetUserId), {
        role: newRole,
        roleUpdatedAt: serverTimestamp(),
        roleUpdatedBy: user.uid
      });

      logEvent(analytics, 'admin_role_update', { 
        admin_uid: user.uid,
        target_user: targetUserId,
        new_role: newRole
      });

    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }
};

// Initialize services
export const initializeFirebaseServices = async () => {
  try {
    await Promise.all([
      statsService.initializeStats(),
      votingService.initializeVoting()
    ]);
    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Initialize Firebase services error:', error);
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