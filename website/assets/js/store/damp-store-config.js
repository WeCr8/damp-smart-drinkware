/**
 * DAMP Global Store Configuration
 * Google Engineering Standards Implementation
 * Production-Ready Store Setup with Firebase & Stripe
 * 
 * @fileoverview Main configuration and initialization for the DAMP global store
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { DAMPStore } from './core/store-architecture.js';
import { AuthState } from './modules/auth-module.js';
import { Logger } from './utils/logger.js';

/**
 * Store Configuration
 */
export const STORE_CONFIG = {
    // Firebase Configuration
    firebase: {
        apiKey: "your-api-key",
        authDomain: "damp-smart-drinkware.firebaseapp.com",
        projectId: "damp-smart-drinkware",
        storageBucket: "damp-smart-drinkware.appspot.com",
        messagingSenderId: "your-sender-id",
        appId: "your-app-id",
        measurementId: "your-measurement-id"
    },
    
    // Stripe Configuration
    stripe: {
        publishableKey: "pk_test_your_publishable_key" // Use pk_live_ for production
    },
    
    // Environment Configuration
    environment: process.env.NODE_ENV || 'production',
    
    // Store Options
    storeOptions: {
        enablePersistence: true,
        enableAnalytics: true,
        enableErrorReporting: true,
        maxRetries: 3,
        retryDelay: 1000
    }
};

/**
 * Store State Keys
 * Centralized definition of all state keys used in the application
 */
export const STATE_KEYS = {
    // Authentication
    AUTH: {
        STATE: 'auth/state',
        USER: 'auth/user',
        PROFILE: 'auth/profile',
        ERROR: 'auth/error',
        LOADING: 'auth/loading',
        EMAIL_VERIFICATION_SENT: 'auth/emailVerificationSent',
        PASSWORD_RESET_SENT: 'auth/passwordResetSent'
    },
    
    // User Profile & Settings
    USER: {
        PROFILE: 'user/profile',
        PREFERENCES: 'user/preferences',
        SUBSCRIPTION: 'user/subscription',
        PAYMENT_METHODS: 'user/paymentMethods',
        DEVICES: 'user/devices',
        NOTIFICATIONS: 'user/notifications'
    },
    
    // Application State
    APP: {
        INITIALIZED: 'app/initialized',
        LOADING: 'app/loading',
        ERROR: 'app/error',
        NETWORK_STATUS: 'app/networkStatus',
        THEME: 'app/theme',
        LANGUAGE: 'app/language'
    },
    
    // DAMP Devices & IoT
    DEVICES: {
        CONNECTED: 'devices/connected',
        ACTIVE_DEVICE: 'devices/activeDevice',
        DEVICE_STATUS: 'devices/status',
        SENSOR_DATA: 'devices/sensorData',
        BATTERY_LEVELS: 'devices/batteryLevels',
        LOCATION_ZONES: 'devices/locationZones'
    },
    
    // Payments & Subscriptions
    PAYMENTS: {
        LOADING: 'payments/loading',
        ERROR: 'payments/error',
        CURRENT_SUBSCRIPTION: 'payments/currentSubscription',
        PAYMENT_HISTORY: 'payments/history',
        PENDING_PAYMENTS: 'payments/pending'
    },
    
    // Analytics & Metrics
    ANALYTICS: {
        USER_EVENTS: 'analytics/userEvents',
        DEVICE_METRICS: 'analytics/deviceMetrics',
        USAGE_STATS: 'analytics/usageStats'
    }
};

/**
 * Store Actions
 * Centralized definition of all actions that can be dispatched
 */
export const ACTIONS = {
    // Authentication Actions
    AUTH: {
        SIGN_IN: 'AUTH_SIGN_IN',
        SIGN_UP: 'AUTH_SIGN_UP',
        SIGN_OUT: 'AUTH_SIGN_OUT',
        REFRESH_TOKEN: 'AUTH_REFRESH_TOKEN',
        UPDATE_PROFILE: 'AUTH_UPDATE_PROFILE',
        VERIFY_EMAIL: 'AUTH_VERIFY_EMAIL',
        RESET_PASSWORD: 'AUTH_RESET_PASSWORD'
    },
    
    // User Actions
    USER: {
        LOAD_PROFILE: 'USER_LOAD_PROFILE',
        UPDATE_PREFERENCES: 'USER_UPDATE_PREFERENCES',
        CONNECT_DEVICE: 'USER_CONNECT_DEVICE',
        DISCONNECT_DEVICE: 'USER_DISCONNECT_DEVICE'
    },
    
    // Payment Actions
    PAYMENTS: {
        CREATE_PAYMENT_INTENT: 'PAYMENTS_CREATE_PAYMENT_INTENT',
        CONFIRM_PAYMENT: 'PAYMENTS_CONFIRM_PAYMENT',
        CREATE_SUBSCRIPTION: 'PAYMENTS_CREATE_SUBSCRIPTION',
        CANCEL_SUBSCRIPTION: 'PAYMENTS_CANCEL_SUBSCRIPTION',
        UPDATE_PAYMENT_METHOD: 'PAYMENTS_UPDATE_PAYMENT_METHOD'
    },
    
    // Device Actions
    DEVICES: {
        SCAN_DEVICES: 'DEVICES_SCAN',
        CONNECT: 'DEVICES_CONNECT',
        DISCONNECT: 'DEVICES_DISCONNECT',
        UPDATE_STATUS: 'DEVICES_UPDATE_STATUS',
        SYNC_DATA: 'DEVICES_SYNC_DATA',
        SET_LOCATION_ZONE: 'DEVICES_SET_LOCATION_ZONE'
    }
};

/**
 * Store Initialization Class
 * Handles the complete setup and initialization of the global store
 */
export class DAMPStoreInitializer {
    #store = null;
    #logger = null;
    #initialized = false;
    
    constructor() {
        this.#logger = new Logger('StoreInitializer');
    }
    
    /**
     * Initialize the DAMP global store
     * @param {Object} config - Configuration overrides
     * @returns {Promise<DAMPStore>} Initialized store instance
     */
    async initialize(config = {}) {
        try {
            this.#logger.info('Initializing DAMP Global Store');
            
            // Merge configuration
            const finalConfig = this.#mergeConfig(STORE_CONFIG, config);
            
            // Get store instance
            this.#store = DAMPStore;
            
            // Initialize store with configuration
            await this.#store.initialize(finalConfig);
            
            // Set up action handlers
            this.#setupActionHandlers();
            
            // Set up middleware
            this.#setupMiddleware();
            
            // Set up cross-platform synchronization
            this.#setupCrossPlatformSync();
            
            // Initialize application state
            await this.#initializeApplicationState();
            
            // Set up auto-cleanup
            this.#setupAutoCleanup();
            
            this.#initialized = true;
            this.#logger.info('DAMP Global Store initialized successfully');
            
            return this.#store;
            
        } catch (error) {
            this.#logger.error('Store initialization failed', error);
            throw error;
        }
    }
    
    /**
     * Get store instance
     * @returns {DAMPStore} Store instance
     */
    getStore() {
        if (!this.#initialized) {
            throw new Error('Store not initialized. Call initialize() first.');
        }
        return this.#store;
    }
    
    /**
     * Store Usage Examples
     */
    
    /**
     * Example: User Authentication Flow
     */
    async exampleAuthFlow() {
        const store = this.getStore();
        
        // Subscribe to auth state changes
        const unsubscribeAuth = store.subscribe(STATE_KEYS.AUTH.STATE, (authState) => {
            console.log('Auth state changed:', authState);
            
            switch (authState) {
                case AuthState.AUTHENTICATED:
                    console.log('User is authenticated');
                    break;
                case AuthState.UNAUTHENTICATED:
                    console.log('User is not authenticated');
                    break;
                case AuthState.LOADING:
                    console.log('Authentication in progress');
                    break;
            }
        });
        
        // Sign up a new user
        try {
            await store.dispatch({
                type: ACTIONS.AUTH.SIGN_UP,
                payload: {
                    email: 'user@example.com',
                    password: 'securePassword123',
                    displayName: 'John Doe'
                }
            });
            
            console.log('User signed up successfully');
            
        } catch (error) {
            console.error('Sign up failed:', error);
        }
        
        // Clean up subscription
        // unsubscribeAuth();
    }
    
    /**
     * Example: Payment Processing
     */
    async examplePaymentFlow() {
        const store = this.getStore();
        
        // Create payment intent
        try {
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
            
            console.log('Payment intent created:', paymentResult);
            
            // Confirm payment with payment method
            const confirmResult = await store.dispatch({
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
            
            console.log('Payment confirmed:', confirmResult);
            
        } catch (error) {
            console.error('Payment failed:', error);
        }
    }
    
    /**
     * Example: Device Management
     */
    async exampleDeviceFlow() {
        const store = this.getStore();
        
        // Subscribe to device changes
        const unsubscribeDevices = store.subscribe(STATE_KEYS.DEVICES.CONNECTED, (devices) => {
            console.log('Connected devices:', devices);
        });
        
        // Connect to a DAMP device
        try {
            await store.dispatch({
                type: ACTIONS.DEVICES.CONNECT,
                payload: {
                    deviceId: 'damp_device_001',
                    deviceType: 'silicone_bottom',
                    connectionType: 'bluetooth'
                }
            });
            
            console.log('Device connected successfully');
            
            // Set up location zones
            await store.dispatch({
                type: ACTIONS.DEVICES.SET_LOCATION_ZONE,
                payload: {
                    deviceId: 'damp_device_001',
                    zones: [
                        { name: 'Home Office', latitude: 40.7128, longitude: -74.0060, radius: 50 },
                        { name: 'Kitchen', latitude: 40.7130, longitude: -74.0062, radius: 30 }
                    ]
                }
            });
            
        } catch (error) {
            console.error('Device connection failed:', error);
        }
    }
    
    /**
     * Example: Cross-Platform State Sync
     */
    async exampleCrossPlatformSync() {
        const store = this.getStore();
        
        // This state will automatically sync across web and mobile
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
        
        // Listen for sync events
        store.on('sync:received', (event) => {
            console.log('Received sync update:', event);
        });
    }
    
    // Private methods
    
    /**
     * @private
     */
    #mergeConfig(defaultConfig, userConfig) {
        return {
            ...defaultConfig,
            ...userConfig,
            firebase: { ...defaultConfig.firebase, ...userConfig.firebase },
            stripe: { ...defaultConfig.stripe, ...userConfig.stripe },
            storeOptions: { ...defaultConfig.storeOptions, ...userConfig.storeOptions }
        };
    }
    
    /**
     * @private
     */
    #setupActionHandlers() {
        // Authentication action handlers
        this.#store.addMiddleware(async (type, data) => {
            if (type === 'DISPATCH' && data.type?.startsWith('AUTH_')) {
                return await this.#handleAuthAction(data);
            }
            return data;
        });
        
        // Payment action handlers
        this.#store.addMiddleware(async (type, data) => {
            if (type === 'DISPATCH' && data.type?.startsWith('PAYMENTS_')) {
                return await this.#handlePaymentAction(data);
            }
            return data;
        });
        
        // Device action handlers
        this.#store.addMiddleware(async (type, data) => {
            if (type === 'DISPATCH' && data.type?.startsWith('DEVICES_')) {
                return await this.#handleDeviceAction(data);
            }
            return data;
        });
    }
    
    /**
     * @private
     */
    async #handleAuthAction(action) {
        const { auth } = this.#store;
        
        switch (action.type) {
            case ACTIONS.AUTH.SIGN_UP:
                return await auth.signUp(action.payload);
                
            case ACTIONS.AUTH.SIGN_IN:
                return await auth.signIn(action.payload.email, action.payload.password);
                
            case ACTIONS.AUTH.SIGN_OUT:
                return await auth.signOut();
                
            case ACTIONS.AUTH.UPDATE_PROFILE:
                return await auth.updateProfile(action.payload);
                
            default:
                return action;
        }
    }
    
    /**
     * @private
     */
    async #handlePaymentAction(action) {
        const { payment } = this.#store;
        
        switch (action.type) {
            case ACTIONS.PAYMENTS.CREATE_PAYMENT_INTENT:
                return await payment.createPaymentIntent(action.payload);
                
            case ACTIONS.PAYMENTS.CONFIRM_PAYMENT:
                return await payment.confirmPayment(
                    action.payload.clientSecret,
                    action.payload.paymentMethodData
                );
                
            case ACTIONS.PAYMENTS.CREATE_SUBSCRIPTION:
                return await payment.createSubscriptionCheckout(action.payload);
                
            default:
                return action;
        }
    }
    
    /**
     * @private
     */
    async #handleDeviceAction(action) {
        // Device actions would integrate with your BLE/IoT modules
        switch (action.type) {
            case ACTIONS.DEVICES.CONNECT:
                // Implement device connection logic
                console.log('Connecting to device:', action.payload);
                return { success: true, device: action.payload };
                
            case ACTIONS.DEVICES.DISCONNECT:
                // Implement device disconnection logic
                console.log('Disconnecting device:', action.payload);
                return { success: true };
                
            default:
                return action;
        }
    }
    
    /**
     * @private
     */
    #setupMiddleware() {
        // Analytics middleware
        this.#store.addMiddleware(async (type, data) => {
            if (type === 'DISPATCH') {
                // Track user actions
                if (window.gtag) {
                    window.gtag('event', 'store_action', {
                        action_type: data.type,
                        platform: navigator.platform || 'unknown'
                    });
                }
            }
            return data;
        });
        
        // Performance monitoring middleware
        this.#store.addMiddleware(async (type, data) => {
            const startTime = performance.now();
            const result = data;
            const endTime = performance.now();
            
            if (endTime - startTime > 100) {
                this.#logger.warn(`Slow store operation: ${type}`, {
                    duration: `${(endTime - startTime).toFixed(2)}ms`
                });
            }
            
            return result;
        });
    }
    
    /**
     * @private
     */
    #setupCrossPlatformSync() {
        // Set up real-time synchronization between web and mobile
        this.#store.on('state:changed', async (event) => {
            // Only sync specific state keys
            const syncableKeys = [
                STATE_KEYS.USER.PREFERENCES,
                STATE_KEYS.USER.DEVICES,
                STATE_KEYS.DEVICES.LOCATION_ZONES
            ];
            
            if (syncableKeys.includes(event.key)) {
                await this.#store.sync.broadcastStateChange(event);
            }
        });
    }
    
    /**
     * @private
     */
    async #initializeApplicationState() {
        // Set initial app state
        await this.#store.setState(STATE_KEYS.APP.INITIALIZED, true);
        await this.#store.setState(STATE_KEYS.APP.LOADING, false);
        await this.#store.setState(STATE_KEYS.APP.NETWORK_STATUS, navigator.onLine);
        
        // Listen for network status changes
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.#store.setState(STATE_KEYS.APP.NETWORK_STATUS, true);
            });
            
            window.addEventListener('offline', () => {
                this.#store.setState(STATE_KEYS.APP.NETWORK_STATUS, false);
            });
        }
    }
    
    /**
     * @private
     */
    #setupAutoCleanup() {
        // Clean up old analytics data every hour
        setInterval(() => {
            const analytics = this.#store.getState(STATE_KEYS.ANALYTICS.USER_EVENTS) || [];
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            const filtered = analytics.filter(event => event.timestamp > oneDayAgo);
            
            if (filtered.length !== analytics.length) {
                this.#store.setState(STATE_KEYS.ANALYTICS.USER_EVENTS, filtered, { skipSync: true });
            }
        }, 60 * 60 * 1000); // Every hour
    }
}

/**
 * Global store initializer instance
 */
export const storeInitializer = new DAMPStoreInitializer();

/**
 * Initialize the global store with default configuration
 * @param {Object} config - Configuration overrides
 * @returns {Promise<DAMPStore>} Initialized store
 */
export async function initializeDAMPStore(config = {}) {
    return await storeInitializer.initialize(config);
}

/**
 * Get the initialized store instance
 * @returns {DAMPStore} Store instance
 */
export function getDAMPStore() {
    return storeInitializer.getStore();
}

// Export everything
export { DAMPStore } from './core/store-architecture.js';
export { AuthState } from './modules/auth-module.js';
export default storeInitializer; 