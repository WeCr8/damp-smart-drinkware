/**
 * DAMP Analytics Service
 * Google Engineering Standards Implementation
 * Global Analytics Service for Easy Integration
 * 
 * @fileoverview Global analytics service for tracking across all pages
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { AnalyticsModule, AnalyticsEventType } from '../store/modules/analytics-module.js';
import { Logger } from '../store/utils/logger.js';

/**
 * Global Analytics Service Class
 * Provides easy-to-use analytics tracking for all pages
 */
class DAMPAnalyticsService {
    #analytics = null;
    #logger = null;
    #initialized = false;
    #pageLoadTime = null;
    
    constructor() {
        this.#logger = new Logger('AnalyticsService');
        this.#pageLoadTime = Date.now();
        
        // Auto-initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#autoInitialize());
        } else {
            setTimeout(() => this.#autoInitialize(), 0);
        }
    }
    
    /**
     * Initialize analytics service
     * @param {Object} store - Global store instance (optional)
     * @param {Object} config - Analytics configuration
     * @returns {Promise<void>}
     */
    async initialize(store = null, config = {}) {
        try {
            this.#logger.info('Initializing DAMP Analytics Service');
            
            // Create analytics module
            this.#analytics = new AnalyticsModule(store, {
                debug: config.debug || this.#isDebugMode(),
                ...config
            });
            
            // Initialize the module
            await this.#analytics.initialize();
            
            // Track initial page view
            this.trackPageView();
            
            // Set up automatic event tracking
            this.#setupAutomaticTracking();
            
            this.#initialized = true;
            this.#logger.info('DAMP Analytics Service initialized successfully');
            
        } catch (error) {
            this.#logger.error('Analytics service initialization failed', error);
            // Don't throw - analytics should not break the app
        }
    }
    
    /**
     * Track page view with enhanced data
     * @param {Object} pageData - Page-specific data
     */
    trackPageView(pageData = {}) {
        if (!this.#analytics) return;
        
        const enhancedPageData = {
            title: pageData.title || document.title,
            url: pageData.url || window.location.href,
            referrer: pageData.referrer || document.referrer,
            section: pageData.section || this.#getPageSection(),
            subsection: pageData.subsection || this.#getPageSubsection(),
            loadTime: Date.now() - this.#pageLoadTime,
            ...pageData
        };
        
        this.#analytics.trackPageView(enhancedPageData);
        this.#logger.debug('Page view tracked', { url: enhancedPageData.url });
    }
    
    /**
     * Track user interactions (clicks, form submissions, etc.)
     * @param {string} element - Element that was interacted with
     * @param {string} action - Action taken
     * @param {Object} data - Additional data
     */
    trackInteraction(element, action, data = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackCustomEvent('user_interaction', {
            category: 'engagement',
            label: `${element}_${action}`,
            customParameters: {
                element_type: element,
                action_type: action,
                page_section: this.#getPageSection(),
                ...data
            }
        });
    }
    
    /**
     * Track button clicks with context
     * @param {string} buttonName - Button identifier
     * @param {Object} context - Button context
     */
    trackButtonClick(buttonName, context = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackCustomEvent('button_click', {
            category: 'engagement',
            label: buttonName,
            customParameters: {
                button_type: context.type || 'button',
                button_location: context.location || this.#getPageSection(),
                button_text: context.text || buttonName,
                destination: context.href || context.destination,
                ...context
            }
        });
        
        this.#logger.debug('Button click tracked', { button: buttonName });
    }
    
    /**
     * Track form interactions
     * @param {string} formName - Form identifier
     * @param {string} action - Form action (start, complete, error)
     * @param {Object} formData - Form data
     */
    trackForm(formName, action, formData = {}) {
        if (!this.#analytics) return;
        
        const eventName = `form_${action}`;
        
        this.#analytics.trackCustomEvent(eventName, {
            category: 'forms',
            label: formName,
            customParameters: {
                form_name: formName,
                form_action: action,
                form_fields: formData.fieldCount || 0,
                validation_errors: formData.errors || 0,
                completion_time: formData.completionTime,
                ...formData
            }
        });
    }
    
    /**
     * Track navigation events
     * @param {string} from - Source page/section
     * @param {string} to - Destination page/section
     * @param {string} method - Navigation method (click, redirect, etc.)
     */
    trackNavigation(from, to, method = 'click') {
        if (!this.#analytics) return;
        
        this.#analytics.trackCustomEvent('navigation', {
            category: 'navigation',
            label: `${from}_to_${to}`,
            customParameters: {
                source_page: from,
                destination_page: to,
                navigation_method: method,
                referrer: document.referrer
            }
        });
    }
    
    /**
     * Track search events
     * @param {string} query - Search query
     * @param {Object} results - Search results data
     */
    trackSearch(query, results = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackCustomEvent('search', {
            category: 'search',
            label: query,
            value: results.count || 0,
            customParameters: {
                search_query: query,
                results_count: results.count || 0,
                search_location: results.location || 'main',
                filters_applied: results.filters || [],
                no_results: (results.count || 0) === 0
            }
        });
    }
    
    /**
     * Track video/media interactions
     * @param {string} mediaId - Media identifier
     * @param {string} action - Media action (play, pause, complete, etc.)
     * @param {Object} mediaData - Media data
     */
    trackMedia(mediaId, action, mediaData = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackCustomEvent(`video_${action}`, {
            category: 'media',
            label: mediaId,
            value: mediaData.progress || 0,
            customParameters: {
                media_id: mediaId,
                media_type: mediaData.type || 'video',
                media_duration: mediaData.duration,
                media_progress: mediaData.progress,
                media_quality: mediaData.quality,
                ...mediaData
            }
        });
    }
    
    /**
     * Track e-commerce events
     * @param {string} eventType - E-commerce event type
     * @param {Object} ecommerceData - E-commerce data
     */
    trackEcommerce(eventType, ecommerceData = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackEcommerce(eventType, ecommerceData);
        this.#logger.info('E-commerce event tracked', { type: eventType });
    }
    
    /**
     * Track authentication events
     * @param {string} method - Auth method (signup, login, logout)
     * @param {Object} userData - User data
     */
    trackAuth(method, userData = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackAuthentication(method, userData);
        this.#logger.info('Auth event tracked', { method });
    }
    
    /**
     * Track DAMP device events
     * @param {string} eventType - Device event type
     * @param {Object} deviceData - Device data
     */
    trackDevice(eventType, deviceData = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackDeviceEvent(eventType, deviceData);
        this.#logger.info('Device event tracked', { type: eventType });
    }
    
    /**
     * Track subscription events
     * @param {string} eventType - Subscription event type
     * @param {Object} subscriptionData - Subscription data
     */
    trackSubscription(eventType, subscriptionData = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackSubscription(eventType, subscriptionData);
        this.#logger.info('Subscription event tracked', { type: eventType });
    }
    
    /**
     * Track performance metrics
     * @param {Object} performanceData - Performance data
     */
    trackPerformance(performanceData = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackPerformance(performanceData);
    }
    
    /**
     * Track errors
     * @param {Error} error - Error object
     * @param {Object} context - Error context
     */
    trackError(error, context = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackError(error, {
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            ...context
        });
    }
    
    /**
     * Set user properties
     * @param {Object} properties - User properties
     */
    setUserProperties(properties = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.setUserProperties(properties);
    }
    
    /**
     * Set user ID
     * @param {string} userId - User ID
     */
    setUserId(userId) {
        if (!this.#analytics) return;
        
        this.#analytics.setUserId(userId);
    }
    
    /**
     * Update consent settings
     * @param {Object} consentSettings - Consent settings
     */
    updateConsent(consentSettings = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.updateConsent(consentSettings);
        this.#logger.info('Analytics consent updated', consentSettings);
    }
    
    /**
     * Get analytics metrics
     * @returns {Object} Analytics metrics
     */
    getMetrics() {
        if (!this.#analytics) return null;
        
        return this.#analytics.getMetrics();
    }
    
    // Private methods
    
    /**
     * @private
     */
    async #autoInitialize() {
        try {
            // Check if global store is available
            let store = null;
            if (window.dampStore) {
                store = window.dampStore;
            }
            
            // Initialize with default configuration
            await this.initialize(store, {
                debug: this.#isDebugMode()
            });
            
        } catch (error) {
            this.#logger.warn('Auto-initialization failed', error);
        }
    }
    
    /**
     * @private
     */
    #setupAutomaticTracking() {
        // Track all clicks with data attributes
        document.addEventListener('click', (event) => {
            const element = event.target.closest('[data-analytics]');
            if (element) {
                const analyticsData = element.dataset.analytics;
                const elementType = element.tagName.toLowerCase();
                
                this.trackInteraction(elementType, 'click', {
                    analytics_data: analyticsData,
                    element_id: element.id,
                    element_class: element.className,
                    element_text: element.textContent?.trim()?.substring(0, 100)
                });
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                const formName = form.name || form.id || 'unnamed_form';
                const fieldCount = form.querySelectorAll('input, textarea, select').length;
                
                this.trackForm(formName, 'submit', {
                    fieldCount,
                    action: form.action,
                    method: form.method
                });
            }
        });
        
        // Track outbound links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                const url = new URL(link.href, window.location.href);
                if (url.hostname !== window.location.hostname) {
                    this.trackCustomEvent('outbound_link', {
                        category: 'navigation',
                        label: url.hostname,
                        customParameters: {
                            destination_url: link.href,
                            link_text: link.textContent?.trim()?.substring(0, 100)
                        }
                    });
                }
            }
        });
        
        // Track file downloads
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                const fileExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|mp4|mov|avi)$/i;
                if (fileExtensions.test(link.href)) {
                    this.trackCustomEvent('file_download', {
                        category: 'downloads',
                        label: link.href.split('/').pop(),
                        customParameters: {
                            file_url: link.href,
                            file_type: link.href.split('.').pop()
                        }
                    });
                }
            }
        });
        
        // Track scroll depth automatically
        this.#setupScrollTracking();
        
        // Track page performance
        this.#setupPerformanceTracking();
    }
    
    /**
     * @private
     */
    #setupScrollTracking() {
        let maxScroll = 0;
        const scrollMilestones = [25, 50, 75, 90];
        
        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                scrollMilestones.forEach(milestone => {
                    if (scrollPercent >= milestone && maxScroll < milestone + 5) {
                        this.trackCustomEvent('scroll_depth', {
                            category: 'engagement',
                            label: `${milestone}%`,
                            value: milestone,
                            nonInteraction: true,
                            customParameters: {
                                page_height: document.body.scrollHeight,
                                viewport_height: window.innerHeight
                            }
                        });
                    }
                });
            }
        };
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 1000);
        });
    }
    
    /**
     * @private
     */
    #setupPerformanceTracking() {
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
                }, 2000); // Wait 2 seconds for paint metrics
            });
        }
    }
    
    /**
     * @private
     */
    #isDebugMode() {
        return localStorage.getItem('dampDebug') === 'true' || 
               new URLSearchParams(window.location.search).get('debug') === 'true';
    }
    
    /**
     * @private
     */
    #getPageSection() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        if (path.includes('/pages/')) {
            const pageName = path.split('/pages/')[1]?.split('.')[0];
            return pageName || 'unknown';
        }
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
     * Expose custom event tracking method
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     */
    trackCustomEvent(eventName, eventData = {}) {
        if (!this.#analytics) return;
        
        this.#analytics.trackCustomEvent(eventName, eventData);
    }
    
    /**
     * Check if analytics is initialized
     * @returns {boolean} Initialization status
     */
    get initialized() {
        return this.#initialized && this.#analytics?.initialized;
    }
    
    /**
     * Get analytics instance (for advanced usage)
     * @returns {AnalyticsModule} Analytics module instance
     */
    get analytics() {
        return this.#analytics;
    }
}

// Create global instance
const dampAnalytics = new DAMPAnalyticsService();

// Expose globally for easy access
window.dampAnalytics = dampAnalytics;

// Export for module usage
export default dampAnalytics;
export { AnalyticsEventType };

// Helper functions for easy tracking
export const trackPageView = (data) => dampAnalytics.trackPageView(data);
export const trackButtonClick = (name, context) => dampAnalytics.trackButtonClick(name, context);
export const trackForm = (name, action, data) => dampAnalytics.trackForm(name, action, data);
export const trackInteraction = (element, action, data) => dampAnalytics.trackInteraction(element, action, data);
export const trackNavigation = (from, to, method) => dampAnalytics.trackNavigation(from, to, method);
export const trackSearch = (query, results) => dampAnalytics.trackSearch(query, results);
export const trackMedia = (id, action, data) => dampAnalytics.trackMedia(id, action, data);
export const trackEcommerce = (type, data) => dampAnalytics.trackEcommerce(type, data);
export const trackAuth = (method, data) => dampAnalytics.trackAuth(method, data);
export const trackDevice = (type, data) => dampAnalytics.trackDevice(type, data);
export const trackSubscription = (type, data) => dampAnalytics.trackSubscription(type, data);
export const trackError = (error, context) => dampAnalytics.trackError(error, context);
export const setUserProperties = (properties) => dampAnalytics.setUserProperties(properties);
export const setUserId = (userId) => dampAnalytics.setUserId(userId);
export const updateConsent = (settings) => dampAnalytics.updateConsent(settings); 