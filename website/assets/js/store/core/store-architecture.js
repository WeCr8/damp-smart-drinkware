/**
 * DAMP Global Store Architecture
 * Google Engineering Standards Implementation
 * Cross-Platform State Management for Web & Mobile
 * 
 * @fileoverview Core store architecture with Firebase and Stripe integration
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { SecurityValidator } from '../utils/security-validator.js';

/**
 * Core Store Manager - Singleton Pattern
 * Manages global application state with cross-platform compatibility
 */
class DAMPStoreManager extends EventEmitter {
    /**
     * @private
     * @static
     */
    static #instance = null;
    
    /**
     * @private
     */
    #state = new Map();
    #subscriptions = new Map();
    #middleware = [];
    #isInitialized = false;
    #platform = null;
    #logger = null;
    #errorHandler = null;
    #securityValidator = null;
    
    /**
     * Private constructor for Singleton pattern
     */
    constructor() {
        super();
        if (DAMPStoreManager.#instance) {
            throw new Error('DAMPStoreManager is a singleton. Use getInstance()');
        }
        
        this.#logger = new Logger('DAMPStore');
        this.#errorHandler = new ErrorHandler();
        this.#securityValidator = new SecurityValidator();
        this.#detectPlatform();
        this.#initializeCore();
    }
    
    /**
     * Get singleton instance
     * @returns {DAMPStoreManager}
     */
    static getInstance() {
        if (!DAMPStoreManager.#instance) {
            DAMPStoreManager.#instance = new DAMPStoreManager();
        }
        return DAMPStoreManager.#instance;
    }
    
    /**
     * Initialize the store with configuration
     * @param {Object} config - Store configuration
     * @param {Object} config.firebase - Firebase configuration
     * @param {Object} config.stripe - Stripe configuration
     * @param {string} config.environment - Development environment
     * @returns {Promise<void>}
     */
    async initialize(config) {
        try {
            this.#logger.info('Initializing DAMP Store Manager', { 
                platform: this.#platform,
                environment: config.environment 
            });
            
            // Validate configuration
            this.#validateConfiguration(config);
            
            // Initialize store modules
            await this.#initializeModules(config);
            
            // Set up cross-platform synchronization
            await this.#setupCrossPlatformSync();
            
            // Initialize middleware chain
            this.#initializeMiddleware();
            
            this.#isInitialized = true;
            this.emit('store:initialized', { platform: this.#platform });
            
            this.#logger.info('DAMP Store Manager initialized successfully');
            
        } catch (error) {
            this.#errorHandler.handleError('STORE_INITIALIZATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Get current state slice
     * @param {string} key - State key
     * @returns {*} State value
     */
    getState(key) {
        this.#ensureInitialized();
        this.#securityValidator.validateStateAccess(key);
        
        return this.#state.get(key);
    }
    
    /**
     * Set state with validation and notifications
     * @param {string} key - State key
     * @param {*} value - State value
     * @param {Object} options - Update options
     * @returns {Promise<void>}
     */
    async setState(key, value, options = {}) {
        this.#ensureInitialized();
        
        try {
            // Security validation
            this.#securityValidator.validateStateUpdate(key, value);
            
            // Get previous state
            const previousState = this.#state.get(key);
            
            // Apply middleware
            const processedValue = await this.#applyMiddleware('SET_STATE', {
                key,
                value,
                previousState,
                options
            });
            
            // Update state
            this.#state.set(key, processedValue.value);
            
            // Emit state change event
            this.emit('state:changed', {
                key,
                value: processedValue.value,
                previousState,
                timestamp: Date.now(),
                platform: this.#platform
            });
            
            // Trigger subscriptions
            this.#notifySubscriptions(key, processedValue.value, previousState);
            
            // Cross-platform synchronization
            if (!options.skipSync) {
                await this.#syncToPlatforms(key, processedValue.value);
            }
            
            this.#logger.debug('State updated', { key, hasValue: !!processedValue.value });
            
        } catch (error) {
            this.#errorHandler.handleError('STATE_UPDATE_FAILED', error, { key });
            throw error;
        }
    }
    
    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch
     * @param {Function} callback - Callback function
     * @param {Object} options - Subscription options
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback, options = {}) {
        this.#ensureInitialized();
        
        const subscriptionId = this.#generateSubscriptionId();
        const subscription = {
            id: subscriptionId,
            key,
            callback,
            options,
            created: Date.now(),
            platform: this.#platform
        };
        
        if (!this.#subscriptions.has(key)) {
            this.#subscriptions.set(key, new Map());
        }
        
        this.#subscriptions.get(key).set(subscriptionId, subscription);
        
        // Return unsubscribe function
        return () => {
            const keySubscriptions = this.#subscriptions.get(key);
            if (keySubscriptions) {
                keySubscriptions.delete(subscriptionId);
                if (keySubscriptions.size === 0) {
                    this.#subscriptions.delete(key);
                }
            }
        };
    }
    
    /**
     * Dispatch action with middleware support
     * @param {Object} action - Action object
     * @returns {Promise<*>}
     */
    async dispatch(action) {
        this.#ensureInitialized();
        
        try {
            // Validate action structure
            this.#securityValidator.validateAction(action);
            
            // Apply middleware chain
            const result = await this.#applyMiddleware('DISPATCH', action);
            
            // Emit action dispatched event
            this.emit('action:dispatched', {
                action: result,
                timestamp: Date.now(),
                platform: this.#platform
            });
            
            return result;
            
        } catch (error) {
            this.#errorHandler.handleError('ACTION_DISPATCH_FAILED', error, { action });
            throw error;
        }
    }
    
    /**
     * Add middleware to the processing chain
     * @param {Function} middleware - Middleware function
     */
    addMiddleware(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        
        this.#middleware.push(middleware);
        this.#logger.debug('Middleware added', { count: this.#middleware.length });
    }
    
    /**
     * Get store statistics and health metrics
     * @returns {Object} Store metrics
     */
    getMetrics() {
        return {
            isInitialized: this.#isInitialized,
            platform: this.#platform,
            stateKeys: Array.from(this.#state.keys()),
            subscriptionCount: Array.from(this.#subscriptions.values())
                .reduce((total, subs) => total + subs.size, 0),
            middlewareCount: this.#middleware.length,
            uptime: Date.now() - (this.#initTime || Date.now()),
            memoryUsage: this.#getMemoryUsage()
        };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.#logger.info('Destroying DAMP Store Manager');
        
        // Clear all subscriptions
        this.#subscriptions.clear();
        
        // Clear state
        this.#state.clear();
        
        // Remove all listeners
        this.removeAllListeners();
        
        // Reset singleton instance
        DAMPStoreManager.#instance = null;
        
        this.#isInitialized = false;
    }
    
    // Private methods
    
    /**
     * @private
     */
    #detectPlatform() {
        if (typeof window !== 'undefined') {
            this.#platform = 'web';
        } else if (typeof global !== 'undefined' && global.process) {
            this.#platform = 'node';
        } else {
            this.#platform = 'mobile'; // React Native or similar
        }
    }
    
    /**
     * @private
     */
    #initializeCore() {
        this.#initTime = Date.now();
        
        // Set up error handling
        this.on('error', (error) => {
            this.#errorHandler.handleError('STORE_ERROR', error);
        });
        
        // Set up performance monitoring
        this.#setupPerformanceMonitoring();
    }
    
    /**
     * @private
     */
    #validateConfiguration(config) {
        const required = ['firebase', 'stripe', 'environment'];
        
        for (const key of required) {
            if (!config[key]) {
                throw new Error(`Missing required configuration: ${key}`);
            }
        }
        
        // Validate Firebase config
        if (!config.firebase.apiKey || !config.firebase.projectId) {
            throw new Error('Invalid Firebase configuration');
        }
        
        // Validate Stripe config
        if (!config.stripe.publishableKey) {
            throw new Error('Invalid Stripe configuration');
        }
    }
    
    /**
     * @private
     */
    async #initializeModules(config) {
        // Initialize Firebase module
        const { FirebaseModule } = await import('./modules/firebase-module.js');
        this.firebase = new FirebaseModule(config.firebase);
        await this.firebase.initialize();
        
        // Initialize Stripe module
        const { StripeModule } = await import('./modules/stripe-module.js');
        this.stripe = new StripeModule(config.stripe);
        await this.stripe.initialize();
        
        // Initialize Auth module
        const { AuthModule } = await import('./modules/auth-module.js');
        this.auth = new AuthModule(this.firebase, this);
        await this.auth.initialize();
        
        // Initialize Payment module
        const { PaymentModule } = await import('./modules/payment-module.js');
        this.payment = new PaymentModule(this.stripe, this);
        await this.payment.initialize();
        
        // Initialize Sync module
        const { SyncModule } = await import('./modules/sync-module.js');
        this.sync = new SyncModule(this);
        await this.sync.initialize();
        
        // Initialize Analytics module
        const { AnalyticsModule } = await import('./modules/analytics-module.js');
        this.analytics = new AnalyticsModule(this, config.analytics || {});
        await this.analytics.initialize();
    }
    
    /**
     * @private
     */
    async #setupCrossPlatformSync() {
        // Set up real-time synchronization
        this.on('state:changed', async (event) => {
            if (!event.options?.skipSync) {
                await this.sync.broadcastStateChange(event);
            }
        });
    }
    
    /**
     * @private
     */
    #initializeMiddleware() {
        // Add built-in middleware
        this.addMiddleware(this.#securityMiddleware.bind(this));
        this.addMiddleware(this.#loggingMiddleware.bind(this));
        this.addMiddleware(this.#performanceMiddleware.bind(this));
    }
    
    /**
     * @private
     */
    async #applyMiddleware(type, data) {
        let result = data;
        
        for (const middleware of this.#middleware) {
            try {
                result = await middleware(type, result, this);
            } catch (error) {
                this.#errorHandler.handleError('MIDDLEWARE_ERROR', error);
                break;
            }
        }
        
        return result;
    }
    
    /**
     * @private
     */
    #notifySubscriptions(key, value, previousValue) {
        const keySubscriptions = this.#subscriptions.get(key);
        if (!keySubscriptions) return;
        
        keySubscriptions.forEach((subscription) => {
            try {
                subscription.callback(value, previousValue, key);
            } catch (error) {
                this.#errorHandler.handleError('SUBSCRIPTION_CALLBACK_ERROR', error);
            }
        });
    }
    
    /**
     * @private
     */
    async #syncToPlatforms(key, value) {
        if (this.sync && this.sync.isEnabled()) {
            await this.sync.syncState(key, value);
        }
    }
    
    /**
     * @private
     */
    #generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * @private
     */
    #ensureInitialized() {
        if (!this.#isInitialized) {
            throw new Error('Store not initialized. Call initialize() first.');
        }
    }
    
    /**
     * @private
     */
    #setupPerformanceMonitoring() {
        // Monitor performance metrics
        setInterval(() => {
            const metrics = this.getMetrics();
            this.emit('metrics:updated', metrics);
        }, 30000); // Every 30 seconds
    }
    
    /**
     * @private
     */
    #getMemoryUsage() {
        if (typeof performance !== 'undefined' && performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    /**
     * Built-in security middleware
     * @private
     */
    async #securityMiddleware(type, data, store) {
        // Implement security checks
        this.#securityValidator.validateOperation(type, data);
        return data;
    }
    
    /**
     * Built-in logging middleware
     * @private
     */
    async #loggingMiddleware(type, data, store) {
        this.#logger.debug(`Store operation: ${type}`, { 
            hasData: !!data,
            platform: this.#platform 
        });
        return data;
    }
    
    /**
     * Built-in performance middleware
     * @private
     */
    async #performanceMiddleware(type, data, store) {
        const startTime = performance.now();
        
        // Process continues to next middleware
        const result = data;
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 100) { // Log slow operations
            this.#logger.warn(`Slow store operation: ${type}`, { 
                duration: `${duration.toFixed(2)}ms` 
            });
        }
        
        return result;
    }
}

// Export singleton instance
export const DAMPStore = DAMPStoreManager.getInstance();
export default DAMPStore; 