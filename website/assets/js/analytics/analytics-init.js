/**
 * DAMP Analytics Initialization Script
 * Google Engineering Standards Implementation
 * Simple Script for Automatic Analytics Setup
 * 
 * @fileoverview Simple script to initialize analytics on any page
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

(function() {
    'use strict';
    
    // Configuration
    const ANALYTICS_CONFIG = {
        MEASUREMENT_ID: 'G-YW2BN4SVPQ',
        DEBUG: false, // Set to true for debugging
        AUTO_TRACK_EVENTS: true,
        CONSENT_REQUIRED: true
    };
    
    // Google Analytics 4 Initialization
    function initializeGoogleAnalytics() {
        // Create and load the gtag script
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.MEASUREMENT_ID}`;
        document.head.appendChild(gtagScript);
        
        // Initialize dataLayer and gtag function
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        // Initialize with current date
        gtag('js', new Date());
        
        // Set consent defaults (GDPR compliance)
        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': ANALYTICS_CONFIG.CONSENT_REQUIRED ? 'denied' : 'granted',
            'wait_for_update': 500
        });
        
        // Configure Google Analytics
        gtag('config', ANALYTICS_CONFIG.MEASUREMENT_ID, {
            'send_page_view': true, // Let GA handle page views initially
            'allow_google_signals': true,
            'allow_ad_personalization_signals': false, // Privacy-first approach
            'cookie_domain': 'auto',
            'cookie_expires': 63072000, // 2 years
            'debug_mode': ANALYTICS_CONFIG.DEBUG
        });
        
        console.log('✅ Google Analytics 4 initialized:', ANALYTICS_CONFIG.MEASUREMENT_ID);
    }
    
    // Check and update consent based on cookie settings
    function checkConsentStatus() {
        try {
            const consentData = localStorage.getItem('damp_cookie_consent');
            if (consentData) {
                const consent = JSON.parse(consentData);
                updateAnalyticsConsent(consent);
            }
        } catch (error) {
            console.warn('Could not check cookie consent status:', error);
        }
    }
    
    // Update analytics consent
    function updateAnalyticsConsent(consentSettings) {
        if (window.gtag) {
            gtag('consent', 'update', {
                'analytics_storage': consentSettings.analytics ? 'granted' : 'denied',
                'ad_storage': consentSettings.marketing ? 'granted' : 'denied',
                'ad_user_data': consentSettings.marketing ? 'granted' : 'denied',
                'ad_personalization': consentSettings.marketing ? 'granted' : 'denied'
            });
            
            console.log('🍪 Analytics consent updated:', consentSettings);
        }
    }
    
    // Enhanced page view tracking with additional context
    function trackEnhancedPageView() {
        if (!window.gtag) return;
        
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer,
            content_group1: getPageSection(),
            content_group2: getPageSubsection(),
            custom_map: {
                'session_id': getSessionId(),
                'user_type': getUserType(),
                'device_category': getDeviceCategory(),
                'page_load_time': getPageLoadTime(),
                'viewport_size': `${window.innerWidth}x${window.innerHeight}`
            }
        };
        
        gtag('event', 'page_view', pageData);
        console.log('📊 Enhanced page view tracked:', pageData.page_title);
    }
    
    // Set up automatic event tracking
    function setupAutomaticTracking() {
        if (!ANALYTICS_CONFIG.AUTO_TRACK_EVENTS) return;
        
        // Track clicks on elements with data-analytics attribute
        document.addEventListener('click', function(event) {
            const element = event.target.closest('[data-analytics]');
            if (element && window.gtag) {
                const analyticsData = element.dataset.analytics;
                const elementType = element.tagName.toLowerCase();
                const elementText = element.textContent?.trim()?.substring(0, 50);
                
                gtag('event', 'click', {
                    event_category: 'engagement',
                    event_label: analyticsData,
                    custom_map: {
                        'element_type': elementType,
                        'element_text': elementText,
                        'element_id': element.id || 'no_id',
                        'page_section': getPageSection()
                    }
                });
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', function(event) {
            if (window.gtag && event.target.tagName === 'FORM') {
                const form = event.target;
                const formName = form.name || form.id || 'unnamed_form';
                
                gtag('event', 'form_submit', {
                    event_category: 'forms',
                    event_label: formName,
                    custom_map: {
                        'form_method': form.method || 'get',
                        'form_action': form.action || window.location.href,
                        'field_count': form.querySelectorAll('input, textarea, select').length
                    }
                });
            }
        });
        
        // Track outbound links
        document.addEventListener('click', function(event) {
            const link = event.target.closest('a');
            if (link && link.href && window.gtag) {
                try {
                    const url = new URL(link.href, window.location.href);
                    if (url.hostname !== window.location.hostname) {
                        gtag('event', 'click', {
                            event_category: 'outbound_links',
                            event_label: url.hostname,
                            custom_map: {
                                'destination_url': link.href,
                                'link_text': link.textContent?.trim()?.substring(0, 50)
                            }
                        });
                    }
                } catch (e) {
                    // Invalid URL, skip tracking
                }
            }
        });
        
        // Track scroll depth
        setupScrollTracking();
        
        // Track page performance
        setupPerformanceTracking();
        
        console.log('🎯 Automatic event tracking enabled');
    }
    
    // Track scroll depth milestones
    function setupScrollTracking() {
        let maxScroll = 0;
        const scrollMilestones = [25, 50, 75, 90];
        let milestoneTracked = [false, false, false, false];
        
        function trackScroll() {
            const scrollPercent = Math.round(
                (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                scrollMilestones.forEach((milestone, index) => {
                    if (scrollPercent >= milestone && !milestoneTracked[index]) {
                        milestoneTracked[index] = true;
                        
                        if (window.gtag) {
                            gtag('event', 'scroll', {
                                event_category: 'engagement',
                                event_label: `${milestone}%`,
                                value: milestone,
                                non_interaction: true
                            });
                        }
                    }
                });
            }
        }
        
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 1000);
        });
    }
    
    // Track page performance metrics
    function setupPerformanceTracking() {
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData && window.gtag) {
                        gtag('event', 'performance_timing', {
                            event_category: 'performance',
                            custom_map: {
                                'page_load_time': Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                                'dom_content_loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                                'dns_lookup_time': Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
                                'server_response_time': Math.round(perfData.responseEnd - perfData.requestStart)
                            }
                        });
                    }
                }, 2000); // Wait for all resources to load
            });
        }
    }
    
    // Listen for consent changes
    function setupConsentListener() {
        // Listen for cookie consent changes
        window.addEventListener('storage', function(e) {
            if (e.key === 'damp_cookie_consent') {
                try {
                    const consent = JSON.parse(e.newValue);
                    updateAnalyticsConsent(consent);
                } catch (error) {
                    console.warn('Error parsing consent data:', error);
                }
            }
        });
        
        // Listen for consent updates via custom events
        window.addEventListener('cookieConsentUpdated', function(event) {
            if (event.detail) {
                updateAnalyticsConsent(event.detail);
            }
        });
    }
    
    // Utility functions
    function getPageSection() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        if (path.includes('/pages/')) {
            const pageName = path.split('/pages/')[1]?.split('.')[0];
            return pageName || 'unknown';
        }
        return 'unknown';
    }
    
    function getPageSubsection() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : null;
    }
    
    function getSessionId() {
        let sessionId = sessionStorage.getItem('dampSessionId');
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('dampSessionId', sessionId);
        }
        return sessionId;
    }
    
    function getUserType() {
        // Simple user type detection
        if (document.referrer && !document.referrer.includes(window.location.hostname)) {
            return 'new_visitor';
        }
        return localStorage.getItem('dampVisitor') ? 'returning_visitor' : 'new_visitor';
    }
    
    function getDeviceCategory() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    function getPageLoadTime() {
        return Date.now() - performance.timing.navigationStart;
    }
    
    // Mark visitor as returning
    function markVisitor() {
        if (!localStorage.getItem('dampVisitor')) {
            localStorage.setItem('dampVisitor', 'true');
        }
    }
    
    // Initialize everything when DOM is ready
    function initialize() {
        console.log('🚀 Initializing DAMP Analytics...');
        
        // Initialize Google Analytics
        initializeGoogleAnalytics();
        
        // Check consent status
        checkConsentStatus();
        
        // Set up consent listener
        setupConsentListener();
        
        // Mark visitor
        markVisitor();
        
        // Wait for gtag to be available, then set up tracking
        const checkGtag = setInterval(function() {
            if (window.gtag) {
                clearInterval(checkGtag);
                
                // Track enhanced page view
                setTimeout(trackEnhancedPageView, 100);
                
                // Set up automatic tracking
                setupAutomaticTracking();
                
                console.log('✅ DAMP Analytics fully initialized');
            }
        }, 100);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready
        setTimeout(initialize, 0);
    }
    
    // Expose utility functions globally
    window.dampAnalyticsUtils = {
        trackEvent: function(eventName, eventData) {
            if (window.gtag) {
                gtag('event', eventName, eventData);
            }
        },
        updateConsent: updateAnalyticsConsent,
        setUserId: function(userId) {
            if (window.gtag) {
                gtag('config', ANALYTICS_CONFIG.MEASUREMENT_ID, {
                    user_id: userId
                });
            }
        },
        setUserProperties: function(properties) {
            if (window.gtag) {
                gtag('config', ANALYTICS_CONFIG.MEASUREMENT_ID, {
                    custom_map: properties
                });
            }
        }
    };
    
})(); 