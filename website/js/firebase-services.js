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

// Import authentication service
import DAMPAuthService from '../assets/js/auth-service.js';

// Initialize authentication service
export const authService = new DAMPAuthService(auth, db, analytics);

// Global services object for easy access
const firebaseServices = {
  auth,
  db,
  analytics,
  functions,
  storage,
  
  // Services will be added below after they are defined
  authService,
  initializeFirebaseServices
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

// Dual Voting System Services (Authenticated + Public)
export const votingService = {
  // Initialize authenticated customer voting data
  async initializeVoting() {
    try {
      const votingDoc = await getDoc(doc(db, 'voting', 'products'));
      if (!votingDoc.exists()) {
        await setDoc(doc(db, 'voting', 'products'), {
          type: 'authenticated',
          title: 'Customer Product Preferences',
          description: 'Authenticated votes from DAMP users and customers',
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
            }
          },
          totalVotes: 2847,
          lastUpdated: serverTimestamp(),
          isActive: true
        });
      }
    } catch (error) {
      console.error('Initialize authenticated voting error:', error);
    }
  },

  // Initialize public voting data
  async initializePublicVoting() {
    try {
      const publicVotingDoc = await getDoc(doc(db, 'voting', 'public'));
      if (!publicVotingDoc.exists()) {
        await setDoc(doc(db, 'voting', 'public'), {
          type: 'public',
          title: 'Community Product Demand',
          description: 'Open public voting for broader market insights',
          products: {
            handle: {
              name: 'DAMP Handle',
              description: 'Universal clip-on handle for any drinkware',
              votes: 2891,
              percentage: 41.2
            },
            siliconeBottom: {
              name: 'Silicone Bottom',
              description: 'Non-slip smart base for bottles and tumblers',
              votes: 1654,
              percentage: 23.6
            },
            cupSleeve: {
              name: 'Cup Sleeve',
              description: 'Adjustable smart sleeve with thermal insulation',
              votes: 1432,
              percentage: 20.4
            },
            babyBottle: {
              name: 'Baby Bottle',
              description: 'Smart baby bottle with feeding tracking',
              votes: 1042,
              percentage: 14.8
            }
          },
          totalVotes: 7019,
          lastUpdated: serverTimestamp(),
          isActive: true
        });
      }
    } catch (error) {
      console.error('Initialize public voting error:', error);
    }
  },

  // Get real-time authenticated voting data
  onVotingChange(callback) {
    return onSnapshot(doc(db, 'voting', 'products'), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  },

  // Get real-time public voting data
  onPublicVotingChange(callback) {
    return onSnapshot(doc(db, 'voting', 'public'), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  },

  // Get both voting datasets for comparison
  onBothVotingChange(callback) {
    const authenticatedUnsubscribe = onSnapshot(doc(db, 'voting', 'products'), (authDoc) => {
      const publicUnsubscribe = onSnapshot(doc(db, 'voting', 'public'), (publicDoc) => {
        callback({
          authenticated: authDoc.exists() ? authDoc.data() : null,
          public: publicDoc.exists() ? publicDoc.data() : null
        });
      });
    });
    
    return authenticatedUnsubscribe; // Return function to unsubscribe from both
  },

  // Submit authenticated vote (requires authentication)
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
        userEmail: user.email,
        voteType: 'authenticated'
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

      logEvent(analytics, 'authenticated_vote_submitted', { 
        product: productId,
        user_id: user.uid
      });

    } catch (error) {
      console.error('Submit authenticated vote error:', error);
      throw error;
    }
  },

  // Submit public vote (no authentication required, uses browser fingerprinting)
  async submitPublicVote(productId, browserFingerprint) {
    try {
      // Create unique session identifier
      const sessionId = browserFingerprint || this.generateBrowserFingerprint();
      
      // Check if this browser/session has already voted
      const publicVoteDoc = await getDoc(doc(db, 'publicVotes', sessionId));
      if (publicVoteDoc.exists() && publicVoteDoc.data().hasVoted) {
        throw new Error('This device has already submitted a vote. Only one vote per device is allowed.');
      }

      // Use batch to ensure atomicity
      const batch = writeBatch(db);

      // Record public vote
      batch.set(doc(db, 'publicVotes', sessionId), {
        productId: productId,
        hasVoted: true,
        votedAt: serverTimestamp(),
        sessionId: sessionId,
        voteType: 'public',
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });

      // Update public voting totals
      batch.update(doc(db, 'voting', 'public'), {
        [`products.${productId}.votes`]: increment(1),
        totalVotes: increment(1),
        lastUpdated: serverTimestamp()
      });

      await batch.commit();

      // Recalculate public percentages
      await this.recalculatePublicPercentages();

      logEvent(analytics, 'public_vote_submitted', { 
        product: productId,
        session_id: sessionId
      });

      // Store vote in localStorage for immediate UI feedback
      localStorage.setItem('damp_public_vote', JSON.stringify({
        productId,
        votedAt: Date.now(),
        sessionId
      }));

    } catch (error) {
      console.error('Submit public vote error:', error);
      throw error;
    }
  },

  // Generate browser fingerprint for public voting
  generateBrowserFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('DAMP Browser Fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create hash of fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return 'pub_' + Math.abs(hash).toString(36);
  },

  // Check if user has voted (authenticated)
  async hasUserVoted(user) {
    if (!user) return false;
    
    try {
      const userVoteDoc = await getDoc(doc(db, 'userVotes', user.uid));
      return userVoteDoc.exists() && userVoteDoc.data().hasVoted;
    } catch (error) {
      console.error('Check authenticated vote status error:', error);
      return false;
    }
  },

  // Get user's vote (authenticated)
  async getUserVote(user) {
    if (!user) return null;
    
    try {
      const userVoteDoc = await getDoc(doc(db, 'userVotes', user.uid));
      return userVoteDoc.exists() ? userVoteDoc.data() : null;
    } catch (error) {
      console.error('Get authenticated user vote error:', error);
      return null;
    }
  },

  // Check if device has voted (public)
  async hasPublicVoted(browserFingerprint) {
    try {
      const sessionId = browserFingerprint || this.generateBrowserFingerprint();
      
      // Check localStorage first for immediate feedback
      const localVote = localStorage.getItem('damp_public_vote');
      if (localVote) {
        try {
          const voteData = JSON.parse(localVote);
          // Check if vote is recent (within 24 hours to prevent stale data)
          if (Date.now() - voteData.votedAt < 24 * 60 * 60 * 1000) {
            return true;
          }
        } catch (e) {
          localStorage.removeItem('damp_public_vote');
        }
      }
      
      // Check Firebase
      const publicVoteDoc = await getDoc(doc(db, 'publicVotes', sessionId));
      return publicVoteDoc.exists() && publicVoteDoc.data().hasVoted;
    } catch (error) {
      console.error('Check public vote status error:', error);
      return false;
    }
  },

  // Get public vote data
  async getPublicVote(browserFingerprint) {
    try {
      const sessionId = browserFingerprint || this.generateBrowserFingerprint();
      
      // Check localStorage first
      const localVote = localStorage.getItem('damp_public_vote');
      if (localVote) {
        try {
          const voteData = JSON.parse(localVote);
          if (Date.now() - voteData.votedAt < 24 * 60 * 60 * 1000) {
            return { ...voteData, source: 'local' };
          }
        } catch (e) {
          localStorage.removeItem('damp_public_vote');
        }
      }
      
      // Check Firebase
      const publicVoteDoc = await getDoc(doc(db, 'publicVotes', sessionId));
      return publicVoteDoc.exists() ? { ...publicVoteDoc.data(), source: 'firebase' } : null;
    } catch (error) {
      console.error('Get public vote error:', error);
      return null;
    }
  },

  // Recalculate authenticated vote percentages
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
      console.error('Recalculate authenticated percentages error:', error);
    }
  },

  // Recalculate public vote percentages
  async recalculatePublicPercentages() {
    try {
      const publicVotingDoc = await getDoc(doc(db, 'voting', 'public'));
      if (!publicVotingDoc.exists()) return;

      const data = publicVotingDoc.data();
      const totalVotes = data.totalVotes || 0;
      
      if (totalVotes === 0) return;

      const updates = {};
      Object.keys(data.products).forEach(productId => {
        const votes = data.products[productId].votes || 0;
        const percentage = ((votes / totalVotes) * 100).toFixed(1);
        updates[`products.${productId}.percentage`] = parseFloat(percentage);
      });

      await updateDoc(doc(db, 'voting', 'public'), {
        ...updates,
        lastUpdated: serverTimestamp()
      });

    } catch (error) {
      console.error('Recalculate public percentages error:', error);
    }
  },

  // Admin: Reset authenticated voting (requires admin)
  async resetVoting(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Reset authenticated voting data
      await updateDoc(doc(db, 'voting', 'products'), {
        'products.handle.votes': 0,
        'products.siliconeBottom.votes': 0,
        'products.cupSleeve.votes': 0,
        'products.babyBottle.votes': 0,
        totalVotes: 0,
        lastUpdated: serverTimestamp()
      });

      // Clear all authenticated user votes
      const userVotesQuery = query(collection(db, 'userVotes'));
      const userVotesSnapshot = await getDocs(userVotesQuery);
      
      const batch = writeBatch(db);
      userVotesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      await this.recalculatePercentages();

      logEvent(analytics, 'admin_authenticated_voting_reset', { 
        admin_uid: user.uid,
        vote_type: 'authenticated'
      });

    } catch (error) {
      console.error('Reset authenticated voting error:', error);
      throw error;
    }
  },

  // Admin: Reset public voting (requires admin)
  async resetPublicVoting(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Reset public voting data
      await updateDoc(doc(db, 'voting', 'public'), {
        'products.handle.votes': 0,
        'products.siliconeBottom.votes': 0,
        'products.cupSleeve.votes': 0,
        'products.babyBottle.votes': 0,
        totalVotes: 0,
        lastUpdated: serverTimestamp()
      });

      // Clear all public votes
      const publicVotesQuery = query(collection(db, 'publicVotes'));
      const publicVotesSnapshot = await getDocs(publicVotesQuery);
      
      const batch = writeBatch(db);
      publicVotesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      await this.recalculatePublicPercentages();

      logEvent(analytics, 'admin_public_voting_reset', { 
        admin_uid: user.uid,
        vote_type: 'public'
      });

    } catch (error) {
      console.error('Reset public voting error:', error);
      throw error;
    }
  },

  // Admin: Reset both voting systems (requires admin)
  async resetAllVoting(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      await Promise.all([
        this.resetVoting(user),
        this.resetPublicVoting(user)
      ]);

      logEvent(analytics, 'admin_all_voting_reset', { 
        admin_uid: user.uid,
        vote_type: 'both'
      });

    } catch (error) {
      console.error('Reset all voting error:', error);
      throw error;
    }
  },

  // Admin: Toggle authenticated voting status
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

      logEvent(analytics, 'admin_authenticated_voting_toggle', { 
        admin_uid: user.uid,
        new_status: !currentStatus,
        vote_type: 'authenticated'
      });

      return !currentStatus;

    } catch (error) {
      console.error('Toggle authenticated voting status error:', error);
      throw error;
    }
  },

  // Admin: Toggle public voting status
  async togglePublicVotingStatus(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const publicVotingDoc = await getDoc(doc(db, 'voting', 'public'));
      const currentStatus = publicVotingDoc.exists() ? publicVotingDoc.data().isActive : true;

      await updateDoc(doc(db, 'voting', 'public'), {
        isActive: !currentStatus,
        lastUpdated: serverTimestamp()
      });

      logEvent(analytics, 'admin_public_voting_toggle', { 
        admin_uid: user.uid,
        new_status: !currentStatus,
        vote_type: 'public'
      });

      return !currentStatus;

    } catch (error) {
      console.error('Toggle public voting status error:', error);
      throw error;
    }
  },

  // Admin: Toggle both voting systems
  async toggleAllVotingStatus(user, newStatus) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      await Promise.all([
        updateDoc(doc(db, 'voting', 'products'), {
          isActive: newStatus,
          lastUpdated: serverTimestamp()
        }),
        updateDoc(doc(db, 'voting', 'public'), {
          isActive: newStatus,
          lastUpdated: serverTimestamp()
        })
      ]);

      logEvent(analytics, 'admin_all_voting_toggle', { 
        admin_uid: user.uid,
        new_status: newStatus,
        vote_type: 'both'
      });

      return newStatus;

    } catch (error) {
      console.error('Toggle all voting status error:', error);
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
      votingService.initializeVoting(),
      votingService.initializePublicVoting()
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

// Email & Newsletter Services
export const emailService = {
  // Subscribe to newsletter
  async subscribeToNewsletter(email, preferences = {}) {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if email already exists
      const existingSubscription = await this.getSubscriberByEmail(email);
      if (existingSubscription && existingSubscription.status === 'active') {
        throw new Error('This email is already subscribed to our newsletter');
      }

      const subscriptionData = {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp(),
        source: preferences.source || 'homepage',
        status: 'active',
        preferences: {
          productUpdates: preferences.productUpdates !== false,
          launchAlerts: preferences.launchAlerts !== false,
          marketingEmails: preferences.marketingEmails !== false,
          weeklyDigest: preferences.weeklyDigest !== false
        },
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: Date.now(),
          ipAddress: null, // Would be set server-side
          location: preferences.location || null
        },
        engagement: {
          subscriptionScore: 100,
          lastEngagement: serverTimestamp(),
          engagementHistory: []
        },
        tags: preferences.tags || []
      };

      // If resubscribing, update existing record
      if (existingSubscription) {
        await updateDoc(doc(db, 'newsletter_subscribers', existingSubscription.id), {
          ...subscriptionData,
          resubscribedAt: serverTimestamp(),
          previousUnsubscribeReason: existingSubscription.unsubscribeReason || null
        });
        
        logEvent(analytics, 'newsletter_resubscribe', {
          email_domain: email.split('@')[1],
          source: preferences.source || 'homepage'
        });
        
        return { id: existingSubscription.id, action: 'resubscribed' };
      } else {
        // Create new subscription
        const docRef = await addDoc(collection(db, 'newsletter_subscribers'), subscriptionData);
        
        // Update global stats
        await updateDoc(doc(db, 'stats', 'global'), {
          newsletterSubscribers: increment(1),
          lastUpdated: serverTimestamp()
        });
        
        logEvent(analytics, 'newsletter_subscribe', {
          email_domain: email.split('@')[1],
          source: preferences.source || 'homepage',
          product_updates: subscriptionData.preferences.productUpdates,
          launch_alerts: subscriptionData.preferences.launchAlerts
        });
        
        return { id: docRef.id, action: 'subscribed' };
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      // Log error for analytics
      logEvent(analytics, 'newsletter_subscribe_error', {
        error_message: error.message,
        source: preferences.source || 'homepage'
      });
      
      throw error;
    }
  },

  // Get subscriber by email
  async getSubscriberByEmail(email) {
    try {
      const q = query(
        collection(db, 'newsletter_subscribers'),
        where('email', '==', email.toLowerCase().trim()),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      
      return null;
    } catch (error) {
      console.error('Get subscriber by email error:', error);
      return null;
    }
  },

  // Unsubscribe from newsletter
  async unsubscribeFromNewsletter(email, reason = 'user_request') {
    try {
      const subscriber = await this.getSubscriberByEmail(email);
      
      if (!subscriber) {
        throw new Error('Email address not found in our newsletter list');
      }
      
      if (subscriber.status === 'unsubscribed') {
        throw new Error('This email is already unsubscribed');
      }
      
      await updateDoc(doc(db, 'newsletter_subscribers', subscriber.id), {
        status: 'unsubscribed',
        unsubscribedAt: serverTimestamp(),
        unsubscribeReason: reason,
        lastUpdated: serverTimestamp()
      });
      
      // Update global stats
      await updateDoc(doc(db, 'stats', 'global'), {
        newsletterSubscribers: increment(-1),
        lastUpdated: serverTimestamp()
      });
      
      logEvent(analytics, 'newsletter_unsubscribe', {
        email_domain: email.split('@')[1],
        reason: reason
      });
      
      return { success: true, message: 'Successfully unsubscribed from newsletter' };
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      throw error;
    }
  },

  // Update subscriber preferences
  async updateSubscriberPreferences(email, newPreferences) {
    try {
      const subscriber = await this.getSubscriberByEmail(email);
      
      if (!subscriber) {
        throw new Error('Email address not found in our newsletter list');
      }
      
      await updateDoc(doc(db, 'newsletter_subscribers', subscriber.id), {
        preferences: {
          ...subscriber.preferences,
          ...newPreferences
        },
        lastUpdated: serverTimestamp()
      });
      
      logEvent(analytics, 'newsletter_preferences_update', {
        email_domain: email.split('@')[1],
        preferences_updated: Object.keys(newPreferences)
      });
      
      return { success: true, message: 'Preferences updated successfully' };
    } catch (error) {
      console.error('Update subscriber preferences error:', error);
      throw error;
    }
  },

  // Get newsletter statistics (admin only)
  async getNewsletterStats(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Get total subscribers
      const subscribersQuery = query(
        collection(db, 'newsletter_subscribers'),
        where('status', '==', 'active')
      );
      const subscribersSnapshot = await getDocs(subscribersQuery);

      // Get recent subscriptions (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentQuery = query(
        collection(db, 'newsletter_subscribers'),
        where('subscribedAt', '>=', thirtyDaysAgo),
        where('status', '==', 'active')
      );
      const recentSnapshot = await getDocs(recentQuery);

      // Analyze subscription sources
      const sources = {};
      subscribersSnapshot.docs.forEach(doc => {
        const source = doc.data().source || 'unknown';
        sources[source] = (sources[source] || 0) + 1;
      });

      return {
        totalSubscribers: subscribersSnapshot.size,
        recentSubscribers: recentSnapshot.size,
        sources: sources,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Get newsletter stats error:', error);
      throw error;
    }
  },

  // Bulk email operations (admin only)
  async sendBulkEmail(subject, content, targetSegment, user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      // Create email campaign record
      const campaignData = {
        subject,
        content,
        targetSegment,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'queued',
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0
        }
      };

      const campaignRef = await addDoc(collection(db, 'email_campaigns'), campaignData);
      
      // In a real implementation, this would trigger a cloud function
      // to actually send the emails via a service like SendGrid, Mailgun, etc.
      
      logEvent(analytics, 'bulk_email_campaign_created', {
        campaign_id: campaignRef.id,
        target_segment: targetSegment,
        admin_uid: user.uid
      });

      return { campaignId: campaignRef.id, status: 'queued' };
    } catch (error) {
      console.error('Send bulk email error:', error);
      throw error;
    }
  },

  // Email validation utility
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Sanitize email
  sanitizeEmail(email) {
    return email.toLowerCase().trim();
  },

  // Check if email is from a disposable email service
  async isDisposableEmail(email) {
    const domain = email.split('@')[1];
    const disposableDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com', 
      'mailinator.com', 'yopmail.com', 'throwaway.email'
    ];
    return disposableDomains.includes(domain);
  },

  // Email engagement tracking
  async trackEmailEngagement(email, action, details = {}) {
    try {
      const subscriber = await this.getSubscriberByEmail(email);
      if (!subscriber) return;

      const engagementData = {
        action,
        timestamp: serverTimestamp(),
        details
      };

      await updateDoc(doc(db, 'newsletter_subscribers', subscriber.id), {
        'engagement.lastEngagement': serverTimestamp(),
        'engagement.engagementHistory': [...(subscriber.engagement?.engagementHistory || []), engagementData].slice(-50) // Keep last 50 engagements
      });

      logEvent(analytics, 'email_engagement', {
        action,
        email_domain: email.split('@')[1],
        ...details
      });
    } catch (error) {
      console.error('Track email engagement error:', error);
    }
  },

  // Export subscribers (admin only)
  async exportSubscribers(format = 'json', user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const subscribersQuery = query(
        collection(db, 'newsletter_subscribers'),
        where('status', '==', 'active'),
        orderBy('subscribedAt', 'desc')
      );
      
      const subscribersSnapshot = await getDocs(subscribersQuery);
      const subscribers = subscribersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        subscribedAt: doc.data().subscribedAt?.toDate?.()?.toISOString() || null
      }));

      logEvent(analytics, 'newsletter_export', {
        format,
        count: subscribers.length,
        admin_uid: user.uid
      });

      return {
        data: subscribers,
        count: subscribers.length,
        exportedAt: new Date().toISOString(),
        format
      };
    } catch (error) {
      console.error('Export subscribers error:', error);
      throw error;
    }
  }
};

// Contact Form Services
export const contactService = {
  // Submit contact form
  async submitContactForm(formData) {
    try {
      const contactData = {
        ...formData,
        submittedAt: serverTimestamp(),
        status: 'new',
        source: formData.source || 'contact_form',
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: Date.now()
        }
      };

      const docRef = await addDoc(collection(db, 'contact_submissions'), contactData);
      
      logEvent(analytics, 'contact_form_submit', {
        source: formData.source || 'contact_form',
        subject_category: formData.category || 'general'
      });

      return { id: docRef.id, status: 'submitted' };
    } catch (error) {
      console.error('Submit contact form error:', error);
      throw error;
    }
  },

  // Get contact submissions (admin only)
  async getContactSubmissions(user) {
    const isAdmin = await authService.isAdmin(user);
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const q = query(
        collection(db, 'contact_submissions'),
        orderBy('submittedAt', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get contact submissions error:', error);
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

// Add all services to the global object
firebaseServices.analyticsService = analyticsService;
firebaseServices.statsService = statsService;
firebaseServices.votingService = votingService;
firebaseServices.adminService = adminService;
firebaseServices.emailService = emailService;
firebaseServices.contactService = contactService;
firebaseServices.deviceService = deviceService;
firebaseServices.storageService = storageService;

// Make Firebase services available globally
window.firebaseServices = firebaseServices;

// Also export for module usage
export default firebaseServices; 