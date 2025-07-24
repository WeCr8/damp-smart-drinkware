/**
 * 🔒 DAMP Environment Configuration Manager
 * Secure handling of environment variables and sensitive data
 * Google Engineering Standards - Production Ready
 */

class DAMPEnvironmentConfig {
    constructor() {
        this.config = {};
        this.initialized = false;
        this.devMode = false;
        this.loadConfiguration();
    }

    /**
     * Load configuration from various sources
     */
    loadConfiguration() {
        try {
            // Detect environment
            this.devMode = this.isDevEnvironment();
            
            // Load from environment variables (Vite/build time)
            this.config = {
                // Analytics & Tracking
                analytics: {
                    googleAnalyticsId: this.getEnvVar('VITE_GOOGLE_ANALYTICS_ID', 'G-YW2BN4SVPQ'),
                    googleTagManagerId: this.getEnvVar('VITE_GOOGLE_TAG_MANAGER_ID', ''),
                    facebookPixelId: this.getEnvVar('VITE_FACEBOOK_PIXEL_ID', ''),
                    hotjarId: this.getEnvVar('VITE_HOTJAR_ID', ''),
                    enableAnalytics: this.getBoolEnvVar('VITE_ENABLE_ANALYTICS', true)
                },

                // Stripe Configuration
                stripe: {
                    publishableKey: this.getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', ''),
                    priceIds: {
                        handle: this.getEnvVar('VITE_STRIPE_PRICE_ID_HANDLE', ''),
                        bottom: this.getEnvVar('VITE_STRIPE_PRICE_ID_BOTTOM', ''),
                        sleeve: this.getEnvVar('VITE_STRIPE_PRICE_ID_SLEEVE', ''),
                        baby: this.getEnvVar('VITE_STRIPE_PRICE_ID_BABY', '')
                    }
                },

                // Firebase Configuration
                firebase: {
                    apiKey: this.getEnvVar('VITE_FIREBASE_API_KEY', ''),
                    authDomain: this.getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', ''),
                    projectId: this.getEnvVar('VITE_FIREBASE_PROJECT_ID', ''),
                    storageBucket: this.getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', ''),
                    messagingSenderId: this.getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
                    appId: this.getEnvVar('VITE_FIREBASE_APP_ID', ''),
                    measurementId: this.getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', '')
                },

                // Application Configuration
                app: {
                    name: this.getEnvVar('VITE_APP_NAME', 'DAMP Smart Drinkware'),
                    url: this.getEnvVar('VITE_APP_URL', 'https://dampdrink.com'),
                    environment: this.getEnvVar('VITE_APP_ENVIRONMENT', 'production'),
                    version: this.getEnvVar('VITE_APP_VERSION', '1.0.0'),
                    apiBaseUrl: this.getEnvVar('VITE_API_BASE_URL', 'https://api.dampdrink.com'),
                    cdnUrl: this.getEnvVar('VITE_CDN_URL', 'https://cdn.dampdrink.com')
                },

                // Contact Information
                contact: {
                    supportEmail: this.getEnvVar('VITE_SUPPORT_EMAIL', 'support@dampdrink.com'),
                    contactEmail: this.getEnvVar('VITE_CONTACT_EMAIL', 'hello@dampdrink.com')
                },

                // Feature Flags
                features: {
                    analytics: this.getBoolEnvVar('VITE_ENABLE_ANALYTICS', true),
                    chatSupport: this.getBoolEnvVar('VITE_ENABLE_CHAT_SUPPORT', true),
                    abTesting: this.getBoolEnvVar('VITE_ENABLE_A_B_TESTING', false),
                    betaFeatures: this.getBoolEnvVar('VITE_ENABLE_BETA_FEATURES', false),
                    debugMode: this.getBoolEnvVar('VITE_ENABLE_DEBUG_MODE', false)
                }
            };

            this.initialized = true;
            this.logConfiguration();

        } catch (error) {
            console.error('🚨 DAMP Config: Failed to load environment configuration:', error);
            this.loadFallbackConfiguration();
        }
    }

    /**
     * Get environment variable with fallback
     */
    getEnvVar(key, fallback = '') {
        try {
            // Try Vite environment variables first
            if (typeof import !== 'undefined' && import.meta && import.meta.env) {
                return import.meta.env[key] || fallback;
            }
            
            // Try process.env (Node.js environments)
            if (typeof process !== 'undefined' && process.env) {
                return process.env[key] || fallback;
            }
            
            // Try window environment (runtime configuration)
            if (typeof window !== 'undefined' && window.DAMP_CONFIG) {
                return window.DAMP_CONFIG[key] || fallback;
            }
            
            return fallback;
        } catch (error) {
            console.warn(`🔧 DAMP Config: Could not read environment variable ${key}:`, error);
            return fallback;
        }
    }

    /**
     * Get boolean environment variable
     */
    getBoolEnvVar(key, fallback = false) {
        const value = this.getEnvVar(key, fallback.toString());
        return value === 'true' || value === true;
    }

    /**
     * Check if running in development environment
     */
    isDevEnvironment() {
        return (
            this.getEnvVar('VITE_APP_ENVIRONMENT', 'production') === 'development' ||
            this.getEnvVar('NODE_ENV', 'production') === 'development' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port !== ''
        );
    }

    /**
     * Load fallback configuration for offline/error scenarios
     */
    loadFallbackConfiguration() {
        console.warn('🔄 DAMP Config: Loading fallback configuration');
        
        this.config = {
            analytics: {
                googleAnalyticsId: this.devMode ? '' : 'G-YW2BN4SVPQ',
                enableAnalytics: !this.devMode
            },
            stripe: {
                publishableKey: '',
                priceIds: { handle: '', bottom: '', sleeve: '', baby: '' }
            },
            firebase: {
                apiKey: '', authDomain: '', projectId: '', storageBucket: '',
                messagingSenderId: '', appId: '', measurementId: ''
            },
            app: {
                name: 'DAMP Smart Drinkware',
                url: window.location.origin,
                environment: this.devMode ? 'development' : 'production',
                version: '1.0.0',
                apiBaseUrl: window.location.origin + '/api',
                cdnUrl: window.location.origin + '/assets'
            },
            contact: {
                supportEmail: 'support@dampdrink.com',
                contactEmail: 'hello@dampdrink.com'
            },
            features: {
                analytics: !this.devMode,
                chatSupport: false,
                abTesting: false,
                betaFeatures: this.devMode,
                debugMode: this.devMode
            }
        };
        
        this.initialized = true;
    }

    /**
     * Log configuration in development mode
     */
    logConfiguration() {
        if (this.devMode && this.config.features.debugMode) {
            console.group('🔧 DAMP Environment Configuration');
            console.log('Environment:', this.config.app.environment);
            console.log('Analytics Enabled:', this.config.analytics.enableAnalytics);
            console.log('Debug Mode:', this.config.features.debugMode);
            console.log('Features:', this.config.features);
            console.groupEnd();
        }
    }

    /**
     * Get configuration value by path
     */
    get(path, fallback = null) {
        try {
            const keys = path.split('.');
            let value = this.config;
            
            for (const key of keys) {
                if (value && typeof value === 'object' && key in value) {
                    value = value[key];
                } else {
                    return fallback;
                }
            }
            
            return value;
        } catch (error) {
            console.warn(`🔧 DAMP Config: Could not get configuration value for ${path}:`, error);
            return fallback;
        }
    }

    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.get(`features.${feature}`, false);
    }

    /**
     * Get analytics configuration
     */
    getAnalyticsConfig() {
        return this.config.analytics;
    }

    /**
     * Get Stripe configuration
     */
    getStripeConfig() {
        return this.config.stripe;
    }

    /**
     * Get Firebase configuration
     */
    getFirebaseConfig() {
        return this.config.firebase;
    }

    /**
     * Get application configuration
     */
    getAppConfig() {
        return this.config.app;
    }

    /**
     * Validate configuration
     */
    validate() {
        const issues = [];
        
        // Check required analytics configuration
        if (this.config.analytics.enableAnalytics && !this.config.analytics.googleAnalyticsId) {
            issues.push('Google Analytics ID is required when analytics is enabled');
        }
        
        // Check Stripe configuration for production
        if (this.config.app.environment === 'production' && !this.config.stripe.publishableKey) {
            issues.push('Stripe publishable key is required for production');
        }
        
        // Check Firebase configuration
        if (!this.config.firebase.apiKey && !this.devMode) {
            issues.push('Firebase API key is required');
        }
        
        if (issues.length > 0) {
            console.group('⚠️ DAMP Config: Configuration Issues');
            issues.forEach(issue => console.warn(issue));
            console.groupEnd();
        }
        
        return issues.length === 0;
    }
}

// Create and export global configuration instance
window.DAMP = window.DAMP || {};
window.DAMP.Config = new DAMPEnvironmentConfig();

// Validate configuration on load
document.addEventListener('DOMContentLoaded', function() {
    if (window.DAMP.Config.isFeatureEnabled('debugMode')) {
        window.DAMP.Config.validate();
    }
});

export default window.DAMP.Config; 