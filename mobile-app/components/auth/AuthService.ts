/**
 * DAMP Smart Drinkware - React Native Authentication Service
 * 
 * Cross-platform authentication service for mobile app
 */

import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
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

import { auth, db, analytics } from '../config/firebase-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth?: string;
    location: {
      country: string;
      state: string;
      city: string;
      zipCode: string;
    };
  };
  preferences: {
    newsletter: boolean;
    productUpdates: boolean;
    launchAlerts: boolean;
    appNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
  damp: {
    devices: Array<{
      id: string;
      name: string;
      type: string;
      model: string;
      serialNumber?: string;
      purchaseDate: string;
      status: 'active' | 'inactive';
      batteryLevel: number;
      lastSeen: string;
    }>;
    totalDevices: number;
    subscription: {
      plan: 'free' | 'premium';
      status: 'active' | 'inactive';
      startDate: string;
      endDate?: string;
    };
    votingHistory: Array<{
      productId: string;
      votedAt: string;
    }>;
    safeZones: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      radius: number;
      active: boolean;
    }>;
    referralCode: string;
  };
  orders: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
    favoriteCategories: string[];
  };
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message: string;
}

class MobileAuthService {
  private currentUser: User | null = null;
  private authStateListeners: Array<(user: User | null) => void> = [];
  private userProfile: UserProfile | null = null;

  constructor() {
    this.initializeGoogleSignIn();
    this.setupAuthStateListener();
  }

  private initializeGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: '309818614427-your-web-client-id.apps.googleusercontent.com', // Replace with your web client ID
      offlineAccess: true,
    });
  }

  private setupAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        await this.handleUserSignIn(user);
        await this.loadUserProfile();
      } else {
        await this.handleUserSignOut();
      }
      
      // Notify listeners
      this.authStateListeners.forEach(callback => callback(user));
    });
  }

  private async handleUserSignIn(user: User) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await this.createUserProfile(user);
      } else {
        await updateDoc(userRef, {
          lastSignIn: serverTimestamp(),
          isOnline: true,
          'analytics.lastActivity': serverTimestamp(),
          'analytics.platform': Platform.OS,
          'analytics.deviceInfo': {
            platform: Platform.OS,
            version: Platform.Version,
          }
        });
      }
      
      // Store auth state locally
      await AsyncStorage.setItem('dampAuth', JSON.stringify({
        isAuthenticated: true,
        userId: user.uid,
        email: user.email,
        lastSignIn: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error handling user sign in:', error);
    }
  }

  private async handleUserSignOut() {
    if (this.currentUser) {
      try {
        const userRef = doc(db, 'users', this.currentUser.uid);
        await updateDoc(userRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating user status on sign out:', error);
      }
    }
    
    // Clear local storage
    await AsyncStorage.removeItem('dampAuth');
    this.userProfile = null;
  }

  private async createUserProfile(user: User, additionalData: any = {}) {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      
      profile: {
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        phone: additionalData.phone || '',
        dateOfBirth: additionalData.dateOfBirth || null,
        location: {
          country: additionalData.country || '',
          state: additionalData.state || '',
          city: additionalData.city || '',
          zipCode: additionalData.zipCode || ''
        }
      },
      
      preferences: {
        newsletter: true,
        productUpdates: true,
        launchAlerts: true,
        appNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        theme: 'auto'
      },
      
      damp: {
        devices: [],
        totalDevices: 0,
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: new Date().toISOString()
        },
        votingHistory: [],
        safeZones: [],
        referralCode: this.generateReferralCode(user.uid)
      },
      
      orders: {
        totalOrders: 0,
        totalSpent: 0,
        favoriteCategories: []
      }
    };
    
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
      lastSignIn: serverTimestamp(),
      isOnline: true,
      analytics: {
        firstVisit: serverTimestamp(),
        totalSessions: 1,
        lastActivity: serverTimestamp(),
        platform: Platform.OS,
        acquisitionSource: additionalData.source || 'mobile_app',
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      },
      account: {
        role: 'user',
        status: 'active',
        verificationLevel: user.emailVerified ? 'email' : 'none',
        twoFactorEnabled: false,
        loginAttempts: 0,
        lastPasswordChange: serverTimestamp()
      }
    });
    
    this.userProfile = userProfile;
    return userProfile;
  }

  // Authentication methods
  async signUpWithEmail(email: string, password: string, additionalData: any = {}): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (additionalData.displayName) {
        await updateProfile(user, {
          displayName: additionalData.displayName
        });
      }
      
      await this.createUserProfile(user, {
        ...additionalData,
        signInMethod: 'email'
      });
      
      return {
        success: true,
        user: user,
        message: 'Account created successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in with Google successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      await GoogleSignin.signOut();
      await firebaseSignOut(auth);
      
      return {
        success: true,
        message: 'Signed out successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error signing out'
      };
    }
  }

  async sendPasswordReset(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent!'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  async updateUserPassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    if (!this.currentUser || !this.currentUser.email) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(this.currentUser.email, currentPassword);
      await reauthenticateWithCredential(this.currentUser, credential);
      
      // Update password
      await updatePassword(this.currentUser, newPassword);
      
      // Update profile
      const userRef = doc(db, 'users', this.currentUser.uid);
      await updateDoc(userRef, {
        'account.lastPasswordChange': serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Password updated successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Profile management
  async loadUserProfile(): Promise<UserProfile | null> {
    if (!this.currentUser) return null;
    
    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        this.userProfile = userSnap.data() as UserProfile;
        
        // Cache profile locally
        await AsyncStorage.setItem('dampUserProfile', JSON.stringify(this.userProfile));
        
        return this.userProfile;
      }
      return null;
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Try to load from cache
      try {
        const cachedProfile = await AsyncStorage.getItem('dampUserProfile');
        if (cachedProfile) {
          this.userProfile = JSON.parse(cachedProfile);
          return this.userProfile;
        }
      } catch (cacheError) {
        console.error('Error loading cached profile:', cacheError);
      }
      
      return null;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<AuthResult> {
    if (!this.currentUser) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }
    
    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      
      // Update local cache
      if (this.userProfile) {
        this.userProfile = { ...this.userProfile, ...updates };
        await AsyncStorage.setItem('dampUserProfile', JSON.stringify(this.userProfile));
      }
      
      // Update Firebase Auth profile if needed
      const authUpdates: any = {};
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.photoURL) authUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(this.currentUser, authUpdates);
      }
      
      return {
        success: true,
        message: 'Profile updated successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error updating profile'
      };
    }
  }

  // Device management
  async addDevice(deviceData: {
    name: string;
    type: string;
    model: string;
    serialNumber?: string;
  }): Promise<AuthResult> {
    if (!this.currentUser || !this.userProfile) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }
    
    try {
      const device = {
        id: this.generateDeviceId(),
        name: deviceData.name,
        type: deviceData.type,
        model: deviceData.model,
        serialNumber: deviceData.serialNumber || null,
        purchaseDate: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
        status: 'active' as const,
        batteryLevel: 100,
        lastSeen: new Date().toISOString()
      };
      
      const updatedDevices = [...(this.userProfile.damp.devices || []), device];
      
      await this.updateUserProfile({
        damp: {
          ...this.userProfile.damp,
          devices: updatedDevices,
          totalDevices: updatedDevices.length
        }
      });
      
      return {
        success: true,
        message: 'Device added successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error adding device'
      };
    }
  }

  async removeDevice(deviceId: string): Promise<AuthResult> {
    if (!this.currentUser || !this.userProfile) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }
    
    try {
      const updatedDevices = this.userProfile.damp.devices.filter(device => device.id !== deviceId);
      
      await this.updateUserProfile({
        damp: {
          ...this.userProfile.damp,
          devices: updatedDevices,
          totalDevices: updatedDevices.length
        }
      });
      
      return {
        success: true,
        message: 'Device removed successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error removing device'
      };
    }
  }

  async updateDeviceStatus(deviceId: string, updates: Partial<UserProfile['damp']['devices'][0]>): Promise<AuthResult> {
    if (!this.currentUser || !this.userProfile) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }
    
    try {
      const updatedDevices = this.userProfile.damp.devices.map(device => 
        device.id === deviceId ? { ...device, ...updates } : device
      );
      
      await this.updateUserProfile({
        damp: {
          ...this.userProfile.damp,
          devices: updatedDevices
        }
      });
      
      return {
        success: true,
        message: 'Device updated successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error updating device'
      };
    }
  }

  // Safe zones management
  async addSafeZone(safeZoneData: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }): Promise<AuthResult> {
    if (!this.currentUser || !this.userProfile) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }
    
    try {
      const safeZone = {
        id: this.generateSafeZoneId(),
        name: safeZoneData.name,
        latitude: safeZoneData.latitude,
        longitude: safeZoneData.longitude,
        radius: safeZoneData.radius,
        active: true,
        createdAt: new Date().toISOString()
      };
      
      const updatedSafeZones = [...(this.userProfile.damp.safeZones || []), safeZone];
      
      await this.updateUserProfile({
        damp: {
          ...this.userProfile.damp,
          safeZones: updatedSafeZones
        }
      });
      
      return {
        success: true,
        message: 'Safe zone added successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error adding safe zone'
      };
    }
  }

  // Newsletter integration
  async updateNewsletterPreferences(preferences: {
    newsletter?: boolean;
    productUpdates?: boolean;
    launchAlerts?: boolean;
    emailNotifications?: boolean;
  }): Promise<AuthResult> {
    if (!this.currentUser || !this.userProfile) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }
    
    try {
      await this.updateUserProfile({
        preferences: {
          ...this.userProfile.preferences,
          ...preferences
        }
      });
      
      // Update newsletter subscription in the newsletter_subscribers collection
      if (preferences.newsletter !== undefined) {
        const newsletterQuery = query(
          collection(db, 'newsletter_subscribers'),
          where('email', '==', this.currentUser.email)
        );
        
        const querySnapshot = await getDocs(newsletterQuery);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          await updateDoc(doc.ref, {
            status: preferences.newsletter ? 'active' : 'unsubscribed',
            userId: this.currentUser.uid,
            preferences: preferences,
            lastUpdated: serverTimestamp()
          });
        }
      }
      
      return {
        success: true,
        message: 'Preferences updated successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error updating preferences'
      };
    }
  }

  // Voting integration
  async submitVote(productId: string): Promise<AuthResult> {
    if (!this.currentUser || !this.userProfile) {
      return {
        success: false,
        message: 'No user signed in'
      };
    }
    
    try {
      const vote = {
        productId,
        votedAt: new Date().toISOString(),
        platform: Platform.OS
      };
      
      const updatedVotingHistory = [...(this.userProfile.damp.votingHistory || []), vote];
      
      await this.updateUserProfile({
        damp: {
          ...this.userProfile.damp,
          votingHistory: updatedVotingHistory,
          totalVotes: updatedVotingHistory.length
        }
      });
      
      return {
        success: true,
        message: 'Vote submitted successfully!'
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: 'Error submitting vote'
      };
    }
  }

  // Getters
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Auth state listener
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  private generateReferralCode(uid: string): string {
    return `DAMP${uid.slice(-6).toUpperCase()}`;
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSafeZoneId(): string {
    return `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/requires-recent-login': 'Please sign in again to perform this action.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

export default new MobileAuthService(); 