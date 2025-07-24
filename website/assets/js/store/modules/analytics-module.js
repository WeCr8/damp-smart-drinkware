/**
 * Analytics Module
 * Google Engineering Standards Implementation
 * Comprehensive Analytics Integration with Google Analytics 4
 * 
 * @fileoverview Analytics module for comprehensive tracking and insights
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

/**
 * Analytics Event Types
 */
export const AnalyticsEventType = {
    // User Engagement
    PAGE_VIEW: 'page_view',
    USER_ENGAGEMENT: 'user_engagement',
    SCROLL: 'scroll',
    CLICK: 'click',
    
    // Authentication
    SIGN_UP: 'sign_up',
    LOGIN: 'login',
    LOGOUT: 'logout',
    
    // E-commerce
    VIEW_ITEM: 'view_item',
    ADD_TO_CART: 'add_to_cart',
    BEGIN_CHECKOUT: 'begin_checkout',
    PURCHASE: 'purchase',
    
    // DAMP Specific
    DEVICE_CONNECTED: 'device_connected',
    ZONE_CREATED: 'zone_created',
    ALERT_TRIGGERED: 'alert_triggered',
    PRODUCT_VOTED: 'product_voted',
    
    // Subscriptions
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    
    // Errors and Performance
    EXCEPTION: 'exception',
    PERFORMANCE: 'performance_timing',
    
    // Custom Events
    CUSTOM: 'custom_event'
};

/**
 * Analytics Module Class
 * Manages all analytics tracking with privacy compliance
 */
export class AnalyticsModule {
    #store = null;
    #logger = null;
    #errorHandler = null;
    #initialized = false;
    #config = {};
    #consentGiven = false;
    #eventQueue = [];
    #sessionData = {};
    #userProperties = {};
    #debugMode = false;
    
    // Analytics configuration
    static CONFIG = {
        MEASUREMENT_ID: 'G-YW2BN4SVPQ',
        COOKIE_DOMAIN: 'auto',
        COOKIE_EXPIRES: 63072000, // 2 years in seconds
        SEND_PAGE_VIEW: false, // We'll handle this manually
        ALLOW_GOOGLE_SIGNALS: true,
        ALLOW_AD_PERSONALIZATION_SIGNALS: true
    };
    
    /**
     * Initialize Analytics module
     * @param {Object} store - Global store instance
     * @param {Object} config - Analytics configuration
     */
    constructor(store, config = {}) {
        this.#store = store;
        this.#config = { ...AnalyticsModule.CONFIG, ...config };
        this.#logger = new Logger('AnalyticsModule');
        this.#errorHandler = new ErrorHandler();
        this.#debugMode = config.debug || false;
        
        // Initialize session data
        this.#initializeSession();
    }
    
    /**
     * Initialize analytics system
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            this.#logger.info('Initializing Analytics Module');
            
            // Check for consent
            await this.#checkConsentStatus();
            
            // Load Google Analytics
            await this.#loadGoogleAnalytics();
            
            // Configure Google Analytics
            this.#configureAnalytics();
            
            // Set up store integration
            this.#setupStoreIntegration();
            
            // Set up automatic tracking
            this.#setupAutomaticTracking();
            
            // Process queued events
            this.#processEventQueue();
            
            this.#initialized = true;
            this.#logger.info('Analytics Module initialized successfully');
            
        } catch (error) {
            this.#errorHandler.handleError('ANALYTICS_INITIALIZATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Track page view
     * @param {Object} pageData - Page view data
     */
    trackPageView(pageData = {}) {
        const event = {
            event_name: AnalyticsEventType.PAGE_VIEW,
            page_title: pageData.title || document.title,
            page_location: pageData.url || window.location.href,
            page_referrer: pageData.referrer || document.referrer,
            content_group1: pageData.section || this.#getPageSection(),
            content_group2: pageData.subsection || this.#getPageSubsection(),
            custom_map: {
                user_type: this.#getUserType(),
                session_id: this.#sessionData.sessionId,
                platform: this.#getPlatform(),
                device_category: this.#getDeviceCategory(),
                connection_type: this.#getConnectionType()
            }
        };
        
        this.#trackEvent(AnalyticsEventType.PAGE_VIEW, event);
        
        this.#logger.debug('Page view tracked', { 
            title: event.page_title,
            url: event.page_location 
        });
    }
    
    /**
     * Track user authentication events
     * @param {string} method - Authentication method
     * @param {Object} userData - User data
     */
    trackAuthentication(method, userData = {}) {
        const eventType = method === 'signup' ? AnalyticsEventType.SIGN_UP : AnalyticsEventType.LOGIN;
        
        const event = {
            method: userData.provider || 'email',
            user_id: userData.uid,
            custom_map: {
                email_verified: userData.emailVerified || false,
                sign_up_method: userData.signUpMethod || method,
                account_age_days: userData.accountAge || 0
            }
        };
        
        this.#trackEvent(eventType, event);
        
        // Set user properties
        if (userData.uid) {
            this.setUserProperties({
                user_id: userData.uid,
                sign_up_method: event.method,
                email_verified: event.custom_map.email_verified
            });
        }
        
        this.#logger.info('Authentication tracked', { method, userId: userData.uid });
    }
    
    /**
     * Track e-commerce events
     * @param {string} eventType - E-commerce event type
     * @param {Object} ecommerceData - E-commerce data
     */
    trackEcommerce(eventType, ecommerceData = {}) {
        const event = {
            currency: ecommerceData.currency || 'USD',
            value: ecommerceData.value || 0,
            transaction_id: ecommerceData.transactionId,
            coupon: ecommerceData.coupon,
            payment_type: ecommerceData.paymentType,
            items: ecommerceData.items || [],
            custom_map: {
                checkout_option: ecommerceData.checkoutOption,
                shipping_tier: ecommerceData.shippingTier,
                promotion_id: ecommerceData.promotionId
            }
        };
        
        this.#trackEvent(eventType, event);
        
        this.#logger.info('E-commerce event tracked', { 
            type: eventType, 
            value: event.value,
            items: event.items.length 
        });
    }
    
    /**
     * Track DAMP-specific device events
     * @param {string} eventType - Device event type
     * @param {Object} deviceData - Device data
     */
    trackDeviceEvent(eventType, deviceData = {}) {
        const event = {
            device_id: deviceData.deviceId,
            device_type: deviceData.deviceType,
            connection_type: deviceData.connectionType,
            battery_level: deviceData.batteryLevel,
            signal_strength: deviceData.signalStrength,
            custom_map: {
                firmware_version: deviceData.firmwareVersion,
                last_sync: deviceData.lastSync,
                location_zone: deviceData.locationZone
            }
        };
        
        this.#trackEvent(eventType, event);
        
        this.#logger.info('Device event tracked', { 
            type: eventType, 
            deviceId: deviceData.deviceId 
        });
    }
    
    /**
     * Track subscription events
     * @param {string} eventType - Subscription event type
     * @param {Object} subscriptionData - Subscription data
     */
    trackSubscription(eventType, subscriptionData = {}) {
        const event = {
            currency: subscriptionData.currency || 'USD',
            value: subscriptionData.value || 0,
            subscription_id: subscriptionData.subscriptionId,
            price_id: subscriptionData.priceId,
            billing_cycle: subscriptionData.billingCycle,
            trial_period: subscriptionData.trialPeriod,
            custom_map: {
                plan_name: subscriptionData.planName,
                upgrade_from: subscriptionData.upgradeFrom,
                cancellation_reason: subscriptionData.cancellationReason
            }
        };
        
        this.#trackEvent(eventType, event);
        
        this.#logger.info('Subscription event tracked', { 
            type: eventType, 
            planName: subscriptionData.planName 
        });
    }
    
    /**
     * Track custom events
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     */
    trackCustomEvent(eventName, eventData = {}) {
        const event = {
            event_category: eventData.category || 'custom',
            event_label: eventData.label,
            value: eventData.value || 1,
            non_interaction: eventData.nonInteraction || false,
            custom_map: {
                ...eventData.customParameters
            }
        };
        
        this.#trackEvent(eventName, event);
        
        this.#logger.debug('Custom event tracked', { 
            name: eventName, 
            category: event.event_category 
        });
    }
    
    /**
     * Track performance metrics
     * @param {Object} performanceData - Performance data
     */
    trackPerformance(performanceData = {}) {
        const event = {
            page_load_time: performanceData.pageLoadTime,
            dom_content_loaded: performanceData.domContentLoaded,
            first_contentful_paint: performanceData.firstContentfulPaint,
            largest_contentful_paint: performanceData.largestContentfulPaint,
            first_input_delay: performanceData.firstInputDelay,
            cumulative_layout_shift: performanceData.cumulativeLayoutShift,
            custom_map: {
                connection_type: this.#getConnectionType(),
                memory_usage: performanceData.memoryUsage,
                javascript_errors: performanceData.jsErrors || 0
            }
        };
        
        this.#trackEvent(AnalyticsEventType.PERFORMANCE, event);
        
        this.#logger.debug('Performance tracked', { 
            pageLoadTime: event.page_load_time 
        });
    }
    
    /**
     * Track errors and exceptions
     * @param {Error} error - Error object
     * @param {Object} context - Error context
     */
    trackError(error, context = {}) {
        const event = {
            description: `${error.name}: ${error.message}`,
            fatal: context.fatal || false,
            error_code: error.code || 'unknown',
            stack_trace: error.stack,
            custom_map: {
                component: context.component,
                user_action: context.userAction,
                error_boundary: context.errorBoundary,
                recovery_attempted: context.recoveryAttempted || false
            }
        };
        
        this.#trackEvent(AnalyticsEventType.EXCEPTION, event);
        
        this.#logger.error('Error tracked in analytics', error);
    }
    
    /**
     * Set user properties
     * @param {Object} properties - User properties
     */
    setUserProperties(properties = {}) {
        if (!this.#consentGiven) {
            this.#logger.warn('Cannot set user properties without consent');
            return;
        }
        
        // Merge with existing properties
        this.#userProperties = { ...this.#userProperties, ...properties };
        
        // Set in Google Analytics
        if (window.gtag) {
            window.gtag('config', this.#config.MEASUREMENT_ID, {
                custom_map: properties
            });
        }
        
        this.#logger.debug('User properties set', { count: Object.keys(properties).length });
    }
    
    /**
     * Set user ID for cross-device tracking
     * @param {string} userId - User ID
     */
    setUserId(userId) {
        if (!this.#consentGiven || !userId) return;
        
        if (window.gtag) {
            window.gtag('config', this.#config.MEASUREMENT_ID, {
                user_id: userId
            });
        }
        
        this.#userProperties.user_id = userId;
        this.#logger.info('User ID set for analytics', { userId });
    }
    
    /**
     * Enable debug mode
     * @param {boolean} enabled - Enable debug mode
     */
    setDebugMode(enabled = true) {
        this.#debugMode = enabled;
        
        if (enabled && window.gtag) {
            window.gtag('config', this.#config.MEASUREMENT_ID, {
                debug_mode: true
            });
        }
        
        this.#logger.info('Analytics debug mode', { enabled });
    }
    
    /**
     * Update consent status
     * @param {Object} consentSettings - Consent settings
     */
    updateConsent(consentSettings = {}) {
        this.#consentGiven = consentSettings.analytics !== false;
        
        if (window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: consentSettings.analytics ? 'granted' : 'denied',
                ad_storage: consentSettings.marketing ? 'granted' : 'denied',
                ad_user_data: consentSettings.marketing ? 'granted' : 'denied',
                ad_personalization: consentSettings.marketing ? 'granted' : 'denied'
            });
        }
        
        // Process queued events if consent was just given
        if (this.#consentGiven && this.#eventQueue.length > 0) {
            this.#processEventQueue();
        }
        
        this.#logger.info('Analytics consent updated', consentSettings);
    }
    
    /**
     * Get analytics session data
     * @returns {Object} Session data
     */
    getSessionData() {
        return {
            ...this.#sessionData,
            userProperties: this.#userProperties,
            consentGiven: this.#consentGiven,
            eventsTracked: this.#getEventCount()
        };
    }
    
    /**
     * Get analytics metrics
     * @returns {Object} Analytics metrics
     */
    getMetrics() {
        return {
            initialized: this.#initialized,
            consentGiven: this.#consentGiven,
            eventsQueued: this.#eventQueue.length,
            sessionId: this.#sessionData.sessionId,
            userProperties: Object.keys(this.#userProperties).length,
            debugMode: this.#debugMode
        };
    }
    
    // Private methods
    
    /**
     * @private
     */
    async #checkConsentStatus() {
        // Check if user has given consent for analytics
        try {
            const consentData = localStorage.getItem('damp_cookie_consent');
            if (consentData) {
                const consent = JSON.parse(consentData);
                this.#consentGiven = consent.analytics === true;
            }
        } catch (error) {
            this.#logger.warn('Could not check consent status', error);
        }
    }
    
    /**
     * @private
     */
    async #loadGoogleAnalytics() {
        return new Promise((resolve, reject) => {
            try {
                // Create script element
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${this.#config.MEASUREMENT_ID}`;
                
                script.onload = () => {
                    this.#logger.debug('Google Analytics script loaded');
                    resolve();
                };
                
                script.onerror = () => {
                    const error = new Error('Failed to load Google Analytics script');
                    this.#logger.error('Google Analytics load failed', error);
                    reject(error);
                };
                
                document.head.appendChild(script);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * @private
     */
    #configureAnalytics() {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        
        // Define gtag function
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };
        
        // Initialize with timestamp
        window.gtag('js', new Date());
        
        // Set consent defaults
        window.gtag('consent', 'default', {
            analytics_storage: this.#consentGiven ? 'granted' : 'denied',
            ad_storage: 'denied', // Default to denied, will be updated based on marketing consent
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
        });
        
        // Configure Google Analytics
        window.gtag('config', this.#config.MEASUREMENT_ID, {
            cookie_domain: this.#config.COOKIE_DOMAIN,
            cookie_expires: this.#config.COOKIE_EXPIRES,
            send_page_view: this.#config.SEND_PAGE_VIEW,
            allow_google_signals: this.#config.ALLOW_GOOGLE_SIGNALS,
            allow_ad_personalization_signals: this.#config.ALLOW_AD_PERSONALIZATION_SIGNALS,
            debug_mode: this.#debugMode,
            custom_map: {
                'custom_parameter_session_id': 'session_id',
                'custom_parameter_user_type': 'user_type',
                'custom_parameter_platform': 'platform'
            }
        });
        
        this.#logger.info('Google Analytics configured', {
            measurementId: this.#config.MEASUREMENT_ID,
            consent: this.#consentGiven
        });
    }
    
    /**
     * @private
     */
    #setupStoreIntegration() {
        if (!this.#store) return;
        
        // Track store actions
        this.#store.addMiddleware(async (type, data) => {
            if (type === 'DISPATCH' && data.type) {
                this.trackCustomEvent('store_action', {
                    category: 'store',
                    label: data.type,
                    customParameters: {
                        action_type: data.type,
                        has_payload: !!data.payload
                    }
                });
            }
            return data;
        });
        
        // Track authentication state changes
        this.#store.subscribe('auth/state', (authState, previousState) => {
            if (authState !== previousState) {
                this.trackCustomEvent('auth_state_change', {
                    category: 'authentication',
                    label: authState,
                    customParameters: {
                        previous_state: previousState,
                        new_state: authState
                    }
                });
            }
        });
        
        // Track user changes
        this.#store.subscribe('auth/user', (user) => {
            if (user) {
                this.setUserId(user.uid);
                this.setUserProperties({
                    email_verified: user.emailVerified,
                    sign_up_method: user.providerId || 'email'
                });
            }
        });
    }
    
    /**
     * @private
     */
    #setupAutomaticTracking() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackCustomEvent('page_visibility', {
                category: 'engagement',
                label: document.hidden ? 'hidden' : 'visible',
                nonInteraction: true
            });
        });
        
        // Track scroll depth
        let maxScroll = 0;
        const trackScroll = () => {
            const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            if (scrollPercent > maxScroll && scrollPercent > 0) {
                maxScroll = scrollPercent;
                
                // Track significant scroll milestones
                if ([25, 50, 75, 90].includes(scrollPercent)) {
                    this.trackCustomEvent('scroll_depth', {
                        category: 'engagement',
                        label: `${scrollPercent}%`,
                        value: scrollPercent,
                        nonInteraction: true
                    });
                }
            }
        };
        
        window.addEventListener('scroll', this.#debounce(trackScroll, 1000));
        
        // Track unload events
        window.addEventListener('beforeunload', () => {
            this.trackCustomEvent('page_unload', {
                category: 'engagement',
                label: 'beforeunload',
                customParameters: {
                    session_duration: Date.now() - this.#sessionData.startTime,
                    max_scroll_depth: maxScroll
                }
            });
        });
        
        // Track performance metrics when available
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        this.trackPerformance({
                            pageLoadTime: perfData.loadEventEnd - perfData.loadEventStart,
                            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                            firstContentfulPaint: this.#getFirstContentfulPaint(),
                            memoryUsage: this.#getMemoryUsage()
                        });
                    }
                }, 1000);
            });
        }
    }
    
    /**
     * @private
     */
    #trackEvent(eventType, eventData = {}) {
        if (!this.#initialized) {
            this.#logger.warn('Analytics not initialized, queueing event', { eventType });
            this.#eventQueue.push({ eventType, eventData, timestamp: Date.now() });
            return;
        }
        
        if (!this.#consentGiven) {
            this.#logger.debug('Analytics consent not given, skipping event', { eventType });
            return;
        }
        
        try {
            // Add session data to all events
            const enrichedData = {
                ...eventData,
                session_id: this.#sessionData.sessionId,
                timestamp: Date.now(),
                user_agent: navigator.userAgent,
                custom_map: {
                    ...eventData.custom_map,
                    platform: this.#getPlatform(),
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                    session_start: this.#sessionData.startTime
                }
            };
            
            // Send to Google Analytics
            if (window.gtag) {
                window.gtag('event', eventType, enrichedData);
            }
            
            // Debug logging
            if (this.#debugMode) {
                this.#logger.debug('Analytics event tracked', {
                    type: eventType,
                    data: enrichedData
                });
            }
            
        } catch (error) {
            this.#errorHandler.handleError('ANALYTICS_TRACK_ERROR', error, {
                eventType,
                eventData
            });
        }
    }
    
    /**
     * @private
     */
    #processEventQueue() {
        if (this.#eventQueue.length === 0 || !this.#consentGiven) return;
        
        this.#logger.info('Processing queued analytics events', { 
            count: this.#eventQueue.length 
        });
        
        const events = [...this.#eventQueue];
        this.#eventQueue = [];
        
        events.forEach(({ eventType, eventData }) => {
            this.#trackEvent(eventType, eventData);
        });
    }
    
    /**
     * @private
     */
    #initializeSession() {
        this.#sessionData = {
            sessionId: this.#generateSessionId(),
            startTime: Date.now(),
            pageViews: 0,
            events: 0
        };
    }
    
    /**
     * @private
     */
    #generateSessionId() {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * @private
     */
    #getUserType() {
        const user = this.#store?.getState('auth/user');
        if (!user) return 'anonymous';
        
        const accountAge = Date.now() - new Date(user.createdAt).getTime();
        const daysSinceSignup = Math.floor(accountAge / (1000 * 60 * 60 * 24));
        
        if (daysSinceSignup < 1) return 'new_user';
        if (daysSinceSignup < 30) return 'recent_user';
        return 'returning_user';
    }
    
    /**
     * @private
     */
    #getPlatform() {
        if (typeof window !== 'undefined') return 'web';
        if (typeof global !== 'undefined') return 'mobile';
        return 'unknown';
    }
    
    /**
     * @private
     */
    #getDeviceCategory() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    /**
     * @private
     */
    #getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }
    
    /**
     * @private
     */
    #getPageSection() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        if (path.includes('/pages/')) return path.split('/pages/')[1].split('.')[0];
        return 'unknown';
    }
    
    /**
     * @private
     */
    #getPageSubsection() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : null;
    }
    
    /**
     * @private
     */
    #getFirstContentfulPaint() {
        try {
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return fcpEntry ? fcpEntry.startTime : null;
        } catch {
            return null;
        }
    }
    
    /**
     * @private
     */
    #getMemoryUsage() {
        try {
            return performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null;
        } catch {
            return null;
        }
    }
    
    /**
     * @private
     */
    #getEventCount() {
        return this.#sessionData.events || 0;
    }
    
    /**
     * @private
     */
    #debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.#logger.info('Destroying Analytics Module');
        
        // Clear event queue
        this.#eventQueue = [];
        
        // Reset session data
        this.#sessionData = {};
        this.#userProperties = {};
        
        this.#initialized = false;
    }
    
    /**
     * Public getters
     */
    get initialized() {
        return this.#initialized;
    }
    
    get consentGiven() {
        return this.#consentGiven;
    }
    
    get sessionId() {
        return this.#sessionData.sessionId;
    }
}

export default AnalyticsModule; 