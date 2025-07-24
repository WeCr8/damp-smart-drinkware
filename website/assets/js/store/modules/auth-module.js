/**
 * Authentication Module
 * Google Engineering Standards Implementation
 * Firebase Auth Integration with Global Store
 * 
 * @fileoverview Auth module that connects Firebase authentication with the global store
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { SecurityValidator } from '../utils/security-validator.js';

/**
 * Authentication States
 */
export const AuthState = {
    UNAUTHENTICATED: 'unauthenticated',
    AUTHENTICATING: 'authenticating',
    AUTHENTICATED: 'authenticated',
    LOADING: 'loading',
    ERROR: 'error'
};

/**
 * Authentication Module Class
 * Manages authentication state and integrates with Firebase
 */
export class AuthModule {
    #firebaseModule = null;
    #store = null;
    #logger = null;
    #errorHandler = null;
    #securityValidator = null;
    #initialized = false;
    #authStateUnsubscribe = null;
    #currentUser = null;
    #authState = AuthState.LOADING;
    #refreshTokenInterval = null;
    
    // Auth state keys for the global store
    static STATE_KEYS = {
        AUTH_STATE: 'auth/state',
        CURRENT_USER: 'auth/user',
        USER_PROFILE: 'auth/profile',
        AUTH_ERROR: 'auth/error',
        EMAIL_VERIFICATION_SENT: 'auth/emailVerificationSent',
        PASSWORD_RESET_SENT: 'auth/passwordResetSent',
        IS_LOADING: 'auth/loading'
    };
    
    /**
     * Initialize Auth module
     * @param {FirebaseModule} firebaseModule - Firebase module instance
     * @param {DAMPStore} store - Global store instance
     */
    constructor(firebaseModule, store) {
        this.#firebaseModule = firebaseModule;
        this.#store = store;
        this.#logger = new Logger('AuthModule');
        this.#errorHandler = new ErrorHandler();
        this.#securityValidator = new SecurityValidator();
    }
    
    /**
     * Initialize the auth module
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            this.#logger.info('Initializing Auth Module');
            
            // Initialize auth state in store
            await this.#initializeAuthState();
            
            // Set up Firebase auth state listener
            this.#setupAuthStateListener();
            
            // Set up token refresh
            this.#setupTokenRefresh();
            
            // Set up store subscriptions
            this.#setupStoreSubscriptions();
            
            this.#initialized = true;
            this.#logger.info('Auth Module initialized successfully');
            
        } catch (error) {
            this.#errorHandler.handleError('AUTH_MODULE_INITIALIZATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Authentication Methods
     */
    
    /**
     * Sign up with email and password
     * @param {Object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.displayName - User display name
     * @param {Object} userData.profile - Additional profile data
     * @returns {Promise<Object>} User data
     */
    async signUp(userData) {
        try {
            await this.#setLoading(true);
            await this.#clearError();
            
            this.#logger.info('Starting user registration', { email: userData.email });
            
            // Create user with Firebase
            const user = await this.#firebaseModule.createUser(
                userData.email,
                userData.password,
                {
                    displayName: userData.displayName,
                    ...userData.profile
                }
            );
            
            // Update store state
            await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, user);
            await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.AUTHENTICATED);
            await this.#store.setState(AuthModule.STATE_KEYS.EMAIL_VERIFICATION_SENT, true);
            
            this.#logger.info('User registration completed', { uid: user.uid });
            
            return user;
            
        } catch (error) {
            await this.#handleAuthError('SIGN_UP_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data
     */
    async signIn(email, password) {
        try {
            await this.#setLoading(true);
            await this.#clearError();
            
            this.#logger.info('Starting user sign in', { email });
            
            // Sign in with Firebase
            const user = await this.#firebaseModule.signInWithEmail(email, password);
            
            // Update store state
            await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, user);
            await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.AUTHENTICATED);
            
            this.#logger.info('User sign in completed', { uid: user.uid });
            
            return user;
            
        } catch (error) {
            await this.#handleAuthError('SIGN_IN_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Sign in with Google
     * @returns {Promise<Object>} User data
     */
    async signInWithGoogle() {
        try {
            await this.#setLoading(true);
            await this.#clearError();
            
            this.#logger.info('Starting Google sign in');
            
            const user = await this.#firebaseModule.signInWithGoogle();
            
            await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, user);
            await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.AUTHENTICATED);
            
            this.#logger.info('Google sign in completed', { uid: user.uid });
            
            return user;
            
        } catch (error) {
            await this.#handleAuthError('GOOGLE_SIGN_IN_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Sign in with Facebook
     * @returns {Promise<Object>} User data
     */
    async signInWithFacebook() {
        try {
            await this.#setLoading(true);
            await this.#clearError();
            
            this.#logger.info('Starting Facebook sign in');
            
            const user = await this.#firebaseModule.signInWithFacebook();
            
            await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, user);
            await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.AUTHENTICATED);
            
            this.#logger.info('Facebook sign in completed', { uid: user.uid });
            
            return user;
            
        } catch (error) {
            await this.#handleAuthError('FACEBOOK_SIGN_IN_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Sign out current user
     * @returns {Promise<void>}
     */
    async signOut() {
        try {
            await this.#setLoading(true);
            
            this.#logger.info('Starting user sign out');
            
            // Sign out from Firebase
            await this.#firebaseModule.signOut();
            
            // Clear auth state from store
            await this.#clearAuthState();
            
            // Clear token refresh
            this.#clearTokenRefresh();
            
            this.#logger.info('User sign out completed');
            
        } catch (error) {
            await this.#handleAuthError('SIGN_OUT_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Send email verification
     * @returns {Promise<void>}
     */
    async sendEmailVerification() {
        try {
            await this.#firebaseModule.sendEmailVerification();
            
            await this.#store.setState(AuthModule.STATE_KEYS.EMAIL_VERIFICATION_SENT, true);
            
            this.#logger.info('Email verification sent');
            
        } catch (error) {
            await this.#handleAuthError('EMAIL_VERIFICATION_FAILED', error);
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
            await this.#firebaseModule.sendPasswordReset(email);
            
            await this.#store.setState(AuthModule.STATE_KEYS.PASSWORD_RESET_SENT, true);
            
            this.#logger.info('Password reset email sent', { email });
            
        } catch (error) {
            await this.#handleAuthError('PASSWORD_RESET_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Update user profile
     * @param {Object} updates - Profile updates
     * @returns {Promise<void>}
     */
    async updateProfile(updates) {
        try {
            await this.#setLoading(true);
            
            await this.#firebaseModule.updateUserProfile(updates);
            
            // Update current user in store
            const currentUser = this.#store.getState(AuthModule.STATE_KEYS.CURRENT_USER);
            if (currentUser) {
                const updatedUser = { ...currentUser, ...updates };
                await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, updatedUser);
            }
            
            this.#logger.info('User profile updated');
            
        } catch (error) {
            await this.#handleAuthError('PROFILE_UPDATE_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Update user email
     * @param {string} newEmail - New email address
     * @returns {Promise<void>}
     */
    async updateEmail(newEmail) {
        try {
            await this.#setLoading(true);
            
            await this.#firebaseModule.updateUserEmail(newEmail);
            
            this.#logger.info('Email update initiated', { newEmail });
            
        } catch (error) {
            await this.#handleAuthError('EMAIL_UPDATE_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Update user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    async updatePassword(currentPassword, newPassword) {
        try {
            await this.#setLoading(true);
            
            await this.#firebaseModule.updateUserPassword(currentPassword, newPassword);
            
            this.#logger.info('Password updated successfully');
            
        } catch (error) {
            await this.#handleAuthError('PASSWORD_UPDATE_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * Delete user account
     * @param {string} password - User password for confirmation
     * @returns {Promise<void>}
     */
    async deleteAccount(password) {
        try {
            await this.#setLoading(true);
            
            await this.#firebaseModule.deleteAccount(password);
            
            // Clear auth state
            await this.#clearAuthState();
            
            this.#logger.info('User account deleted');
            
        } catch (error) {
            await this.#handleAuthError('ACCOUNT_DELETION_FAILED', error);
            throw error;
        } finally {
            await this.#setLoading(false);
        }
    }
    
    /**
     * State Management Methods
     */
    
    /**
     * Get current authentication state
     * @returns {string} Current auth state
     */
    getAuthState() {
        return this.#store.getState(AuthModule.STATE_KEYS.AUTH_STATE);
    }
    
    /**
     * Get current user
     * @returns {Object|null} Current user data
     */
    getCurrentUser() {
        return this.#store.getState(AuthModule.STATE_KEYS.CURRENT_USER);
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        const authState = this.getAuthState();
        return authState === AuthState.AUTHENTICATED;
    }
    
    /**
     * Check if user email is verified
     * @returns {boolean} Email verification status
     */
    isEmailVerified() {
        const user = this.getCurrentUser();
        return user?.emailVerified || false;
    }
    
    /**
     * Get authentication error
     * @returns {Object|null} Current auth error
     */
    getAuthError() {
        return this.#store.getState(AuthModule.STATE_KEYS.AUTH_ERROR);
    }
    
    /**
     * Check if auth operation is loading
     * @returns {boolean} Loading status
     */
    isLoading() {
        return this.#store.getState(AuthModule.STATE_KEYS.IS_LOADING) || false;
    }
    
    /**
     * Get ID token for API calls
     * @param {boolean} forceRefresh - Force token refresh
     * @returns {Promise<string>} ID token
     */
    async getIdToken(forceRefresh = false) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }
        
        return await this.#firebaseModule.getIdToken(forceRefresh);
    }
    
    /**
     * Subscribe to auth state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChanged(callback) {
        return this.#store.subscribe(AuthModule.STATE_KEYS.AUTH_STATE, callback);
    }
    
    /**
     * Subscribe to user changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onUserChanged(callback) {
        return this.#store.subscribe(AuthModule.STATE_KEYS.CURRENT_USER, callback);
    }
    
    /**
     * Clear authentication error
     * @returns {Promise<void>}
     */
    async clearError() {
        await this.#clearError();
    }
    
    /**
     * Refresh user data
     * @returns {Promise<void>}
     */
    async refreshUser() {
        try {
            const currentUser = this.#firebaseModule.getCurrentUser();
            if (currentUser) {
                await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, currentUser);
            }
        } catch (error) {
            this.#logger.warn('Failed to refresh user data', error);
        }
    }
    
    // Private methods
    
    /**
     * @private
     */
    async #initializeAuthState() {
        // Set initial auth state
        await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.LOADING);
        await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, null);
        await this.#store.setState(AuthModule.STATE_KEYS.USER_PROFILE, null);
        await this.#store.setState(AuthModule.STATE_KEYS.AUTH_ERROR, null);
        await this.#store.setState(AuthModule.STATE_KEYS.EMAIL_VERIFICATION_SENT, false);
        await this.#store.setState(AuthModule.STATE_KEYS.PASSWORD_RESET_SENT, false);
        await this.#store.setState(AuthModule.STATE_KEYS.IS_LOADING, false);
    }
    
    /**
     * @private
     */
    #setupAuthStateListener() {
        this.#authStateUnsubscribe = this.#firebaseModule.onAuthStateChanged(async (user) => {
            try {
                if (user) {
                    this.#currentUser = user;
                    await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, user);
                    await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.AUTHENTICATED);
                    
                    // Start token refresh for authenticated users
                    this.#setupTokenRefresh();
                    
                    this.#logger.info('User authenticated', { uid: user.uid });
                } else {
                    this.#currentUser = null;
                    await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, null);
                    await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.UNAUTHENTICATED);
                    
                    // Clear token refresh
                    this.#clearTokenRefresh();
                    
                    this.#logger.info('User signed out');
                }
                
                // Clear loading state
                await this.#store.setState(AuthModule.STATE_KEYS.IS_LOADING, false);
                
            } catch (error) {
                this.#errorHandler.handleError('AUTH_STATE_UPDATE_FAILED', error);
                await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.ERROR);
                await this.#store.setState(AuthModule.STATE_KEYS.AUTH_ERROR, error);
            }
        });
    }
    
    /**
     * @private
     */
    #setupTokenRefresh() {
        // Clear existing interval
        this.#clearTokenRefresh();
        
        // Set up token refresh every 55 minutes (tokens expire in 1 hour)
        this.#refreshTokenInterval = setInterval(async () => {
            try {
                if (this.isAuthenticated()) {
                    await this.getIdToken(true); // Force refresh
                    this.#logger.debug('Token refreshed successfully');
                }
            } catch (error) {
                this.#logger.warn('Token refresh failed', error);
            }
        }, 55 * 60 * 1000); // 55 minutes
    }
    
    /**
     * @private
     */
    #clearTokenRefresh() {
        if (this.#refreshTokenInterval) {
            clearInterval(this.#refreshTokenInterval);
            this.#refreshTokenInterval = null;
        }
    }
    
    /**
     * @private
     */
    #setupStoreSubscriptions() {
        // Listen for auth state changes to sync with Firebase
        this.#store.subscribe(AuthModule.STATE_KEYS.AUTH_STATE, (newState, prevState) => {
            if (newState !== prevState) {
                this.#authState = newState;
                this.#logger.debug('Auth state changed', { from: prevState, to: newState });
            }
        });
    }
    
    /**
     * @private
     */
    async #setLoading(loading) {
        await this.#store.setState(AuthModule.STATE_KEYS.IS_LOADING, loading);
    }
    
    /**
     * @private
     */
    async #clearError() {
        await this.#store.setState(AuthModule.STATE_KEYS.AUTH_ERROR, null);
    }
    
    /**
     * @private
     */
    async #handleAuthError(errorType, error) {
        this.#errorHandler.handleError(errorType, error);
        await this.#store.setState(AuthModule.STATE_KEYS.AUTH_ERROR, {
            type: errorType,
            message: error.message,
            code: error.code,
            timestamp: Date.now()
        });
        await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.ERROR);
    }
    
    /**
     * @private
     */
    async #clearAuthState() {
        await this.#store.setState(AuthModule.STATE_KEYS.CURRENT_USER, null);
        await this.#store.setState(AuthModule.STATE_KEYS.USER_PROFILE, null);
        await this.#store.setState(AuthModule.STATE_KEYS.AUTH_STATE, AuthState.UNAUTHENTICATED);
        await this.#store.setState(AuthModule.STATE_KEYS.AUTH_ERROR, null);
        await this.#store.setState(AuthModule.STATE_KEYS.EMAIL_VERIFICATION_SENT, false);
        await this.#store.setState(AuthModule.STATE_KEYS.PASSWORD_RESET_SENT, false);
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.#logger.info('Destroying Auth Module');
        
        // Unsubscribe from Firebase auth state
        if (this.#authStateUnsubscribe) {
            this.#authStateUnsubscribe();
            this.#authStateUnsubscribe = null;
        }
        
        // Clear token refresh
        this.#clearTokenRefresh();
        
        this.#initialized = false;
    }
    
    /**
     * Public getters
     */
    get initialized() {
        return this.#initialized;
    }
    
    get firebaseModule() {
        return this.#firebaseModule;
    }
}

export default AuthModule; 