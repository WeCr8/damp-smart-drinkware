/**
 * Firebase Integration Module
 * Google Engineering Standards Implementation
 * Email Verification & Real-time Database Integration
 * 
 * @fileoverview Firebase module for authentication and data synchronization
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { 
    initializeApp,
    getApps,
    getApp 
} from 'firebase/app';

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    signOut,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    updateEmail,
    verifyBeforeUpdateEmail
} from 'firebase/auth';

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    increment,
    arrayUnion,
    arrayRemove,
    writeBatch,
    runTransaction
} from 'firebase/firestore';

import {
    getFunctions,
    httpsCallable,
    connectFunctionsEmulator
} from 'firebase/functions';

import {
    getAnalytics,
    logEvent,
    setUserId,
    setUserProperties
} from 'firebase/analytics';

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { SecurityValidator } from '../utils/security-validator.js';

/**
 * Firebase Module Class
 * Handles all Firebase operations with enterprise-level patterns
 */
export class FirebaseModule {
    #config = null;
    #app = null;
    #auth = null;
    #firestore = null;
    #functions = null;
    #analytics = null;
    #logger = null;
    #errorHandler = null;
    #securityValidator = null;
    #initialized = false;
    #authStateListeners = new Set();
    #realtimeListeners = new Map();
    
    /**
     * Initialize Firebase module
     * @param {Object} config - Firebase configuration
     */
    constructor(config) {
        this.#config = this.#validateConfig(config);
        this.#logger = new Logger('FirebaseModule');
        this.#errorHandler = new ErrorHandler();
        this.#securityValidator = new SecurityValidator();
    }
    
    /**
     * Initialize Firebase services
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            this.#logger.info('Initializing Firebase Module');
            
            // Initialize Firebase App
            this.#app = getApps().length === 0 
                ? initializeApp(this.#config)
                : getApp();
            
            // Initialize services
            this.#auth = getAuth(this.#app);
            this.#firestore = getFirestore(this.#app);
            this.#functions = getFunctions(this.#app);
            
            // Initialize Analytics (if in browser environment)
            if (typeof window !== 'undefined') {
                this.#analytics = getAnalytics(this.#app);
            }
            
            // Set up development emulators if needed
            if (this.#config.useEmulators) {
                this.#setupEmulators();
            }
            
            // Configure Auth settings
            this.#configureAuth();
            
            this.#initialized = true;
            this.#logger.info('Firebase Module initialized successfully');
            
        } catch (error) {
            this.#errorHandler.handleError('FIREBASE_INITIALIZATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Authentication Methods
     */
    
    /**
     * Create user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {Object} profile - Additional profile data
     * @returns {Promise<Object>} User data
     */
    async createUser(email, password, profile = {}) {
        try {
            this.#securityValidator.validateEmail(email);
            this.#securityValidator.validatePassword(password);
            
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(
                this.#auth, 
                email, 
                password
            );
            
            const user = userCredential.user;
            
            // Update user profile
            await updateProfile(user, {
                displayName: profile.displayName || email.split('@')[0],
                photoURL: profile.photoURL || null
            });
            
            // Send email verification
            await this.sendEmailVerification(user);
            
            // Create user document in Firestore
            await this.#createUserDocument(user, profile);
            
            // Track user creation
            this.#trackEvent('user_created', {
                uid: user.uid,
                method: 'email_password'
            });
            
            this.#logger.info('User created successfully', { uid: user.uid });
            
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified,
                createdAt: user.metadata.creationTime
            };
            
        } catch (error) {
            this.#errorHandler.handleError('USER_CREATION_FAILED', error, { email });
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data
     */
    async signInWithEmail(email, password) {
        try {
            this.#securityValidator.validateEmail(email);
            
            const userCredential = await signInWithEmailAndPassword(
                this.#auth,
                email,
                password
            );
            
            const user = userCredential.user;
            
            // Update last login
            await this.#updateUserDocument(user.uid, {
                lastLoginAt: serverTimestamp(),
                loginCount: increment(1)
            });
            
            // Track sign in
            this.#trackEvent('user_signed_in', {
                uid: user.uid,
                method: 'email_password'
            });
            
            return this.#formatUserData(user);
            
        } catch (error) {
            this.#errorHandler.handleError('SIGN_IN_FAILED', error, { email });
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Sign in with Google
     * @returns {Promise<Object>} User data
     */
    async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            
            const userCredential = await signInWithPopup(this.#auth, provider);
            const user = userCredential.user;
            
            // Create or update user document
            await this.#createOrUpdateUserDocument(user, {
                provider: 'google',
                lastLoginAt: serverTimestamp()
            });
            
            this.#trackEvent('user_signed_in', {
                uid: user.uid,
                method: 'google'
            });
            
            return this.#formatUserData(user);
            
        } catch (error) {
            this.#errorHandler.handleError('GOOGLE_SIGN_IN_FAILED', error);
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Sign in with Facebook
     * @returns {Promise<Object>} User data
     */
    async signInWithFacebook() {
        try {
            const provider = new FacebookAuthProvider();
            provider.addScope('email');
            
            const userCredential = await signInWithPopup(this.#auth, provider);
            const user = userCredential.user;
            
            await this.#createOrUpdateUserDocument(user, {
                provider: 'facebook',
                lastLoginAt: serverTimestamp()
            });
            
            this.#trackEvent('user_signed_in', {
                uid: user.uid,
                method: 'facebook'
            });
            
            return this.#formatUserData(user);
            
        } catch (error) {
            this.#errorHandler.handleError('FACEBOOK_SIGN_IN_FAILED', error);
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Send email verification
     * @param {Object} user - Firebase user object
     * @returns {Promise<void>}
     */
    async sendEmailVerification(user = null) {
        try {
            const currentUser = user || this.#auth.currentUser;
            if (!currentUser) {
                throw new Error('No user is currently signed in');
            }
            
            await sendEmailVerification(currentUser, {
                url: `${window.location.origin}/pages/email-verified.html`,
                handleCodeInApp: true
            });
            
            this.#trackEvent('email_verification_sent', {
                uid: currentUser.uid
            });
            
            this.#logger.info('Email verification sent', { uid: currentUser.uid });
            
        } catch (error) {
            this.#errorHandler.handleError('EMAIL_VERIFICATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    async sendPasswordReset(email) {
        try {
            this.#securityValidator.validateEmail(email);
            
            await sendPasswordResetEmail(this.#auth, email, {
                url: `${window.location.origin}/pages/password-reset-complete.html`,
                handleCodeInApp: true
            });
            
            this.#trackEvent('password_reset_sent', { email });
            this.#logger.info('Password reset email sent', { email });
            
        } catch (error) {
            this.#errorHandler.handleError('PASSWORD_RESET_FAILED', error);
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Update user profile
     * @param {Object} updates - Profile updates
     * @returns {Promise<void>}
     */
    async updateUserProfile(updates) {
        try {
            const user = this.#auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }
            
            // Update Firebase Auth profile
            if (updates.displayName || updates.photoURL) {
                await updateProfile(user, {
                    displayName: updates.displayName,
                    photoURL: updates.photoURL
                });
            }
            
            // Update Firestore document
            await this.#updateUserDocument(user.uid, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            
            this.#trackEvent('profile_updated', { uid: user.uid });
            
        } catch (error) {
            this.#errorHandler.handleError('PROFILE_UPDATE_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Update user email with verification
     * @param {string} newEmail - New email address
     * @returns {Promise<void>}
     */
    async updateUserEmail(newEmail) {
        try {
            const user = this.#auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }
            
            this.#securityValidator.validateEmail(newEmail);
            
            // Send verification to new email
            await verifyBeforeUpdateEmail(user, newEmail);
            
            this.#trackEvent('email_update_requested', { 
                uid: user.uid,
                newEmail 
            });
            
        } catch (error) {
            this.#errorHandler.handleError('EMAIL_UPDATE_FAILED', error);
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Update user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    async updateUserPassword(currentPassword, newPassword) {
        try {
            const user = this.#auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }
            
            this.#securityValidator.validatePassword(newPassword);
            
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            // Update password
            await updatePassword(user, newPassword);
            
            this.#trackEvent('password_updated', { uid: user.uid });
            
        } catch (error) {
            this.#errorHandler.handleError('PASSWORD_UPDATE_FAILED', error);
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Sign out current user
     * @returns {Promise<void>}
     */
    async signOut() {
        try {
            const user = this.#auth.currentUser;
            if (user) {
                this.#trackEvent('user_signed_out', { uid: user.uid });
            }
            
            await signOut(this.#auth);
            this.#logger.info('User signed out');
            
        } catch (error) {
            this.#errorHandler.handleError('SIGN_OUT_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Delete user account
     * @param {string} password - User password for confirmation
     * @returns {Promise<void>}
     */
    async deleteAccount(password) {
        try {
            const user = this.#auth.currentUser;
            if (!user) {
                throw new Error('No user is currently signed in');
            }
            
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            
            // Delete user document
            await this.#deleteUserDocument(user.uid);
            
            // Delete user account
            await deleteUser(user);
            
            this.#trackEvent('account_deleted', { uid: user.uid });
            
        } catch (error) {
            this.#errorHandler.handleError('ACCOUNT_DELETION_FAILED', error);
            throw this.#normalizeAuthError(error);
        }
    }
    
    /**
     * Authentication State Management
     */
    
    /**
     * Listen to auth state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChanged(callback) {
        const wrappedCallback = (user) => {
            try {
                const userData = user ? this.#formatUserData(user) : null;
                callback(userData);
            } catch (error) {
                this.#errorHandler.handleError('AUTH_STATE_CALLBACK_ERROR', error);
            }
        };
        
        this.#authStateListeners.add(wrappedCallback);
        
        const unsubscribe = onAuthStateChanged(this.#auth, wrappedCallback);
        
        // Return enhanced unsubscribe function
        return () => {
            this.#authStateListeners.delete(wrappedCallback);
            unsubscribe();
        };
    }
    
    /**
     * Get current user
     * @returns {Object|null} Current user data
     */
    getCurrentUser() {
        const user = this.#auth.currentUser;
        return user ? this.#formatUserData(user) : null;
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!this.#auth.currentUser;
    }
    
    /**
     * Get user authentication token
     * @param {boolean} forceRefresh - Force token refresh
     * @returns {Promise<string>} ID token
     */
    async getIdToken(forceRefresh = false) {
        const user = this.#auth.currentUser;
        if (!user) {
            throw new Error('No user is currently signed in');
        }
        
        return await user.getIdToken(forceRefresh);
    }
    
    // Private methods
    
    /**
     * @private
     */
    #validateConfig(config) {
        const required = ['apiKey', 'authDomain', 'projectId'];
        
        for (const key of required) {
            if (!config[key]) {
                throw new Error(`Missing required Firebase config: ${key}`);
            }
        }
        
        return config;
    }
    
    /**
     * @private
     */
    #setupEmulators() {
        if (this.#config.emulators?.functions) {
            connectFunctionsEmulator(this.#functions, 'localhost', 5001);
        }
        // Add other emulator connections as needed
    }
    
    /**
     * @private
     */
    #configureAuth() {
        // Configure auth settings
        this.#auth.languageCode = 'en';
        
        // Set up persistence (handled automatically by Firebase)
    }
    
    /**
     * @private
     */
    async #createUserDocument(user, additionalData = {}) {
        const userRef = doc(this.#firestore, 'users', user.uid);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            loginCount: 1,
            lastLoginAt: serverTimestamp(),
            ...additionalData
        };
        
        await setDoc(userRef, userData, { merge: true });
    }
    
    /**
     * @private
     */
    async #createOrUpdateUserDocument(user, additionalData = {}) {
        const userRef = doc(this.#firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            updatedAt: serverTimestamp(),
            ...additionalData
        };
        
        if (!userDoc.exists()) {
            userData.createdAt = serverTimestamp();
            userData.loginCount = 1;
        } else {
            userData.loginCount = increment(1);
        }
        
        await setDoc(userRef, userData, { merge: true });
    }
    
    /**
     * @private
     */
    async #updateUserDocument(uid, updates) {
        const userRef = doc(this.#firestore, 'users', uid);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    }
    
    /**
     * @private
     */
    async #deleteUserDocument(uid) {
        const userRef = doc(this.#firestore, 'users', uid);
        await deleteDoc(userRef);
    }
    
    /**
     * @private
     */
    #formatUserData(user) {
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            providerId: user.providerId,
            createdAt: user.metadata.creationTime,
            lastSignInAt: user.metadata.lastSignInTime
        };
    }
    
    /**
     * @private
     */
    #normalizeAuthError(error) {
        const errorMap = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/popup-blocked': 'Sign-in popup was blocked by the browser.'
        };
        
        const message = errorMap[error.code] || error.message;
        
        return {
            code: error.code,
            message,
            originalError: error
        };
    }
    
    /**
     * @private
     */
    #trackEvent(eventName, parameters = {}) {
        if (this.#analytics) {
            logEvent(this.#analytics, eventName, parameters);
        }
    }
    
    /**
     * Public getters
     */
    get initialized() {
        return this.#initialized;
    }
    
    get app() {
        return this.#app;
    }
    
    get auth() {
        return this.#auth;
    }
    
    get firestore() {
        return this.#firestore;
    }
    
    get functions() {
        return this.#functions;
    }
    
    get analytics() {
        return this.#analytics;
    }
}

export default FirebaseModule; 