/**
 * DAMP Cookie Consent Manager - Professional GDPR/CCPA Compliant System
 * Handles cookie consent, categorization, and user preferences
 */

class DAMPCookieConsent {
    constructor(options = {}) {
        this.options = {
            autoShow: true,
            showAgain: true,
            enableAnalytics: true,
            enableMarketing: false,
            enableFunctional: true,
            consentDuration: 365, // Days
            theme: 'professional',
            position: 'bottom',
            language: 'en',
            companyName: 'DAMP Smart Drinkware',
            privacyPolicyUrl: '/pages/privacy.html',
            cookiePolicyUrl: '/pages/cookie-policy.html',
            debug: window.location.hostname === 'localhost',
            ...options
        };

        this.consentData = {
            necessary: true,    // Always required
            functional: false,  // User preference
            analytics: false,   // User preference
            marketing: false,   // User preference
            timestamp: null,
            version: '1.0.0'
        };

        this.cookieTypes = {
            necessary: {
                name: 'Necessary Cookies',
                description: 'Essential for website functionality and security',
                required: true,
                cookies: [
                    'damp_session',
                    'damp_security_token',
                    'damp_consent_preferences'
                ]
            },
            functional: {
                name: 'Functional Cookies',
                description: 'Enhance your experience with personalized features',
                required: false,
                cookies: [
                    'damp_user_preferences',
                    'damp_language_preference',
                    'damp_cart_contents'
                ]
            },
            analytics: {
                name: 'Analytics Cookies',
                description: 'Help us improve our website and user experience',
                required: false,
                cookies: [
                    '_ga',
                    '_gid',
                    '_gat',
                    'damp_analytics_session'
                ]
            },
            marketing: {
                name: 'Marketing Cookies',
                description: 'Personalize ads and measure campaign effectiveness',
                required: false,
                cookies: [
                    'damp_marketing_preferences',
                    'fbp',
                    'fr'
                ]
            }
        };

        this.texts = {
            en: {
                title: 'We respect your privacy',
                message: 'We use cookies to enhance your experience, analyze site usage, and personalize content. You can manage your preferences below.',
                acceptAll: 'Accept All',
                acceptSelected: 'Accept Selected',
                rejectAll: 'Reject All',
                customize: 'Customize',
                save: 'Save Preferences',
                close: 'Close',
                learnMore: 'Learn More',
                cookiePolicy: 'Cookie Policy',
                privacyPolicy: 'Privacy Policy',
                poweredBy: 'Powered by DAMP Cookie Consent',
                essential: 'Essential cookies cannot be disabled',
                updated: 'Cookie preferences updated successfully!'
            }
        };

        this.isConsentGiven = false;
        this.consentModal = null;
        this.settingsModal = null;
        this.showAgainButton = null;
        
        this.init();
    }

    init() {
        this.loadConsentData();
        this.createConsentModal();
        this.createSettingsModal();
        this.createShowAgainButton();
        this.bindEvents();
        this.checkConsentStatus();
        
        // Initialize Google Analytics in consent mode
        this.initializeGoogleAnalytics();
        
        if (this.options.debug) {
            console.log('DAMP Cookie Consent initialized', this.consentData);
        }
    }

    /**
     * Load existing consent data from localStorage
     */
    loadConsentData() {
        try {
            const stored = localStorage.getItem('damp_cookie_consent');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.version === this.consentData.version) {
                    this.consentData = { ...this.consentData, ...parsed };
                    this.isConsentGiven = true;
                    
                    // Check if consent is still valid
                    const consentAge = Date.now() - this.consentData.timestamp;
                    const maxAge = this.options.consentDuration * 24 * 60 * 60 * 1000;
                    
                    if (consentAge > maxAge) {
                        this.resetConsent();
                    }
                }
            }
        } catch (error) {
            console.error('DAMP Cookie Consent: Error loading consent data', error);
        }
    }

    /**
     * Save consent data to localStorage
     */
    saveConsentData() {
        try {
            this.consentData.timestamp = Date.now();
            localStorage.setItem('damp_cookie_consent', JSON.stringify(this.consentData));
            this.isConsentGiven = true;
            
            // Update analytics consent
            this.updateAnalyticsConsent();
            
            if (this.options.debug) {
                console.log('DAMP Cookie Consent: Consent saved', this.consentData);
            }
        } catch (error) {
            console.error('DAMP Cookie Consent: Error saving consent data', error);
        }
    }

    /**
     * Create professional consent modal
     */
    createConsentModal() {
        const modal = document.createElement('div');
        modal.className = 'damp-cookie-consent-modal';
        modal.innerHTML = `
            <div class="damp-cookie-backdrop"></div>
            <div class="damp-cookie-modal">
                <div class="damp-cookie-header">
                    <div class="damp-cookie-icon">🍪</div>
                    <h3 class="damp-cookie-title">${this.texts.en.title}</h3>
                </div>
                <div class="damp-cookie-content">
                    <p class="damp-cookie-message">${this.texts.en.message}</p>
                    <div class="damp-cookie-types">
                        ${Object.entries(this.cookieTypes).map(([key, type]) => `
                            <div class="damp-cookie-type ${type.required ? 'required' : ''}">
                                <div class="damp-cookie-type-header">
                                    <label class="damp-cookie-toggle">
                                        <input type="checkbox" 
                                               data-type="${key}" 
                                               ${type.required ? 'checked disabled' : ''}
                                               ${this.consentData[key] ? 'checked' : ''}>
                                        <span class="damp-cookie-toggle-slider"></span>
                                    </label>
                                    <div class="damp-cookie-type-info">
                                        <h4>${type.name}</h4>
                                        <p>${type.description}</p>
                                    </div>
                                </div>
                                <div class="damp-cookie-type-cookies">
                                    ${type.cookies.map(cookie => `
                                        <span class="damp-cookie-name">${cookie}</span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="damp-cookie-actions">
                    <button class="damp-cookie-btn damp-cookie-btn-secondary" data-action="reject">
                        ${this.texts.en.rejectAll}
                    </button>
                    <button class="damp-cookie-btn damp-cookie-btn-primary" data-action="accept-selected">
                        ${this.texts.en.acceptSelected}
                    </button>
                    <button class="damp-cookie-btn damp-cookie-btn-success" data-action="accept-all">
                        ${this.texts.en.acceptAll}
                    </button>
                </div>
                <div class="damp-cookie-footer">
                    <a href="${this.options.privacyPolicyUrl}" target="_blank">${this.texts.en.privacyPolicy}</a>
                    <a href="${this.options.cookiePolicyUrl}" target="_blank">${this.texts.en.cookiePolicy}</a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.consentModal = modal;
    }

    /**
     * Create settings modal for preference management
     */
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'damp-cookie-settings-modal';
        modal.innerHTML = `
            <div class="damp-cookie-backdrop"></div>
            <div class="damp-cookie-settings">
                <div class="damp-cookie-settings-header">
                    <h3>Cookie Preferences</h3>
                    <button class="damp-cookie-close" data-action="close">×</button>
                </div>
                <div class="damp-cookie-settings-content">
                    <div class="damp-cookie-settings-tabs">
                        <button class="damp-cookie-tab active" data-tab="preferences">Preferences</button>
                        <button class="damp-cookie-tab" data-tab="details">Details</button>
                        <button class="damp-cookie-tab" data-tab="about">About</button>
                    </div>
                    <div class="damp-cookie-tab-content">
                        <div class="damp-cookie-tab-pane active" data-pane="preferences">
                            <!-- Preferences content will be generated dynamically -->
                        </div>
                        <div class="damp-cookie-tab-pane" data-pane="details">
                            <h4>Cookie Details</h4>
                            <p>Below you can see detailed information about all cookies used on this website.</p>
                            <!-- Cookie details will be generated dynamically -->
                        </div>
                        <div class="damp-cookie-tab-pane" data-pane="about">
                            <h4>About Cookies</h4>
                            <p>Cookies are small text files that are stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.</p>
                            <p>You can manage your cookie preferences at any time by clicking the "Cookie Settings" button that appears on every page.</p>
                        </div>
                    </div>
                </div>
                <div class="damp-cookie-settings-actions">
                    <button class="damp-cookie-btn damp-cookie-btn-secondary" data-action="close">Close</button>
                    <button class="damp-cookie-btn damp-cookie-btn-primary" data-action="save">Save Preferences</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.settingsModal = modal;
    }

    /**
     * Create floating "Show Again" button
     */
    createShowAgainButton() {
        if (!this.options.showAgain) return;
        
        const button = document.createElement('button');
        button.className = 'damp-cookie-show-again';
        button.innerHTML = '🍪 Cookie Settings';
        button.title = 'Manage Cookie Preferences';
        button.onclick = () => this.showSettings();
        
        document.body.appendChild(button);
        this.showAgainButton = button;
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Consent modal actions
        if (this.consentModal) {
            this.consentModal.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                
                if (action === 'accept-all') {
                    this.acceptAll();
                } else if (action === 'accept-selected') {
                    this.acceptSelected();
                } else if (action === 'reject') {
                    this.rejectAll();
                }
            });
            
            // Toggle switches
            this.consentModal.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox' && e.target.dataset.type) {
                    const type = e.target.dataset.type;
                    this.consentData[type] = e.target.checked;
                }
            });
        }

        // Settings modal actions
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                
                if (action === 'close') {
                    this.hideSettings();
                } else if (action === 'save') {
                    this.saveSettings();
                }
            });
        }

        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.consentModal && this.consentModal.style.display !== 'none') {
                    // Don't close consent modal with escape - require explicit choice
                } else if (this.settingsModal && this.settingsModal.style.display !== 'none') {
                    this.hideSettings();
                }
            }
        });
    }

    /**
     * Check consent status and show modal if needed
     */
    checkConsentStatus() {
        if (!this.isConsentGiven && this.options.autoShow) {
            this.showConsent();
        } else if (this.isConsentGiven && this.showAgainButton) {
            this.showAgainButton.style.display = 'block';
        }
    }

    /**
     * Show consent modal
     */
    showConsent() {
        if (this.consentModal) {
            this.consentModal.style.display = 'block';
            document.body.classList.add('damp-cookie-modal-open');
            
            // Update checkbox states
            Object.entries(this.consentData).forEach(([key, value]) => {
                if (typeof value === 'boolean') {
                    const checkbox = this.consentModal.querySelector(`input[data-type="${key}"]`);
                    if (checkbox) {
                        checkbox.checked = value;
                    }
                }
            });
        }
    }

    /**
     * Hide consent modal
     */
    hideConsent() {
        if (this.consentModal) {
            this.consentModal.style.display = 'none';
            document.body.classList.remove('damp-cookie-modal-open');
        }
    }

    /**
     * Show settings modal
     */
    showSettings() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'block';
            document.body.classList.add('damp-cookie-modal-open');
        }
    }

    /**
     * Hide settings modal
     */
    hideSettings() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'none';
            document.body.classList.remove('damp-cookie-modal-open');
        }
    }

    /**
     * Accept all cookies
     */
    acceptAll() {
        Object.keys(this.cookieTypes).forEach(type => {
            this.consentData[type] = true;
        });
        
        this.saveConsentData();
        this.hideConsent();
        this.showNotification('All cookies accepted!');
        
        if (this.showAgainButton) {
            this.showAgainButton.style.display = 'block';
        }
    }

    /**
     * Accept selected cookies
     */
    acceptSelected() {
        // Consent data is already updated from checkbox changes
        this.saveConsentData();
        this.hideConsent();
        this.showNotification('Cookie preferences saved!');
        
        if (this.showAgainButton) {
            this.showAgainButton.style.display = 'block';
        }
    }

    /**
     * Reject all non-essential cookies
     */
    rejectAll() {
        Object.keys(this.cookieTypes).forEach(type => {
            this.consentData[type] = this.cookieTypes[type].required;
        });
        
        this.saveConsentData();
        this.hideConsent();
        this.showNotification('Only essential cookies accepted.');
        
        if (this.showAgainButton) {
            this.showAgainButton.style.display = 'block';
        }
    }

    /**
     * Save settings from settings modal
     */
    saveSettings() {
        // Get updated preferences from settings modal
        const checkboxes = this.settingsModal.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const type = checkbox.dataset.type;
            if (type) {
                this.consentData[type] = checkbox.checked;
            }
        });
        
        this.saveConsentData();
        this.hideSettings();
        this.showNotification('Cookie preferences updated!');
    }

    /**
     * Reset consent data
     */
    resetConsent() {
        localStorage.removeItem('damp_cookie_consent');
        this.consentData = {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false,
            timestamp: null,
            version: '1.0.0'
        };
        this.isConsentGiven = false;
        
        if (this.options.autoShow) {
            this.showConsent();
        }
    }

    /**
     * Initialize Google Analytics with consent mode
     */
    initializeGoogleAnalytics() {
        // Initialize gtag with consent mode
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        
        gtag('consent', 'default', {
            'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
            'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
            'functionality_storage': this.consentData.functional ? 'granted' : 'denied',
            'personalization_storage': this.consentData.functional ? 'granted' : 'denied',
            'security_storage': 'granted'
        });
    }

    /**
     * Update analytics consent based on user preferences
     */
    updateAnalyticsConsent() {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
                'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
                'functionality_storage': this.consentData.functional ? 'granted' : 'denied',
                'personalization_storage': this.consentData.functional ? 'granted' : 'denied'
            });
        }
    }

    /**
     * Show notification
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'damp-cookie-notification';
        notification.innerHTML = `
            <div class="damp-notification-content">
                <span class="damp-notification-icon">✓</span>
                <span class="damp-notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get current consent status
     */
    getConsentStatus() {
        return {
            hasConsent: this.isConsentGiven,
            preferences: { ...this.consentData },
            canUseAnalytics: this.consentData.analytics,
            canUseMarketing: this.consentData.marketing,
            canUseFunctional: this.consentData.functional
        };
    }

    /**
     * Public API methods
     */
    static getInstance() {
        if (!window.dampCookieConsent) {
            window.dampCookieConsent = new DAMPCookieConsent();
        }
        return window.dampCookieConsent;
    }
}

// Initialize cookie consent
document.addEventListener('DOMContentLoaded', () => {
    window.dampCookieConsent = new DAMPCookieConsent();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPCookieConsent;
} 