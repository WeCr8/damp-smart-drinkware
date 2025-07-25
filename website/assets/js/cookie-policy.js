/**
 * DAMP Cookie Policy Manager - Comprehensive GDPR/CCPA Compliant System
 * Combined from cookie-consent-simple.js and cookie-consent.js
 * Features: Simple banner + Detailed settings + Full compliance + Performance optimized
 * Copyright 2025 WeCr8 Solutions LLC
 */

class DAMPCookiePolicy {
    constructor(options = {}) {
        this.options = {
            // Basic Configuration
            autoShow: true,
            showAgain: true,
            consentDuration: 365, // Days
            theme: 'professional',
            position: 'bottom',
            language: 'en',
            
            // Company Information
            companyName: 'DAMP Smart Drinkware',
            privacyPolicyUrl: '/pages/privacy.html',
            cookiePolicyUrl: '/pages/cookie-policy.html',
            
            // Feature Toggles
            enableAnalytics: true,
            enableMarketing: false,
            enableFunctional: true,
            enableSimpleBanner: true,
            enableDetailedModal: true,
            
            // Debug & Development
            debug: window.location.hostname === 'localhost',
            
            ...options
        };

        // Consent Data Structure
        this.consentData = {
            necessary: true,    // Always required
            functional: false,  // User preference
            analytics: false,   // User preference
            marketing: false,   // User preference
            timestamp: null,
            version: '3.0.0',   // Combined version
            region: null,       // Detected region
            method: null        // How consent was given
        };

        // Cookie Categories with Detailed Information
        this.cookieTypes = {
            necessary: {
                name: 'Essential Cookies',
                description: 'Required for website functionality and security. Cannot be disabled.',
                required: true,
                cookies: [
                    { name: 'damp_session', purpose: 'Session management', duration: 'Session' },
                    { name: 'damp_security_token', purpose: 'Security and CSRF protection', duration: '24 hours' },
                    { name: 'damp_consent_preferences', purpose: 'Remember your cookie preferences', duration: '1 year' }
                ]
            },
            functional: {
                name: 'Functional Cookies',
                description: 'Enhance your experience with personalized features and preferences.',
                required: false,
                cookies: [
                    { name: 'damp_user_preferences', purpose: 'Remember your settings and preferences', duration: '1 year' },
                    { name: 'damp_language_preference', purpose: 'Remember your language choice', duration: '1 year' },
                    { name: 'damp_cart_contents', purpose: 'Remember items in your shopping cart', duration: '30 days' }
                ]
            },
            analytics: {
                name: 'Analytics Cookies',
                description: 'Help us improve our website by analyzing how you use it.',
                required: false,
                cookies: [
                    { name: '_ga', purpose: 'Google Analytics - distinguish users', duration: '2 years' },
                    { name: '_gid', purpose: 'Google Analytics - distinguish users', duration: '24 hours' },
                    { name: '_gat_gtag_*', purpose: 'Google Analytics - throttle request rate', duration: '1 minute' },
                    { name: 'damp_analytics_session', purpose: 'Track website usage patterns', duration: 'Session' }
                ]
            },
            marketing: {
                name: 'Marketing Cookies',
                description: 'Personalize ads and measure campaign effectiveness.',
                required: false,
                cookies: [
                    { name: 'damp_marketing_preferences', purpose: 'Personalize marketing content', duration: '1 year' },
                    { name: '_fbp', purpose: 'Facebook Pixel - track conversions', duration: '90 days' },
                    { name: 'fr', purpose: 'Facebook - ad targeting', duration: '90 days' }
                ]
            }
        };

        // Multi-language Support
        this.texts = {
            en: {
                // Simple Banner
                bannerTitle: '🍪 Cookie Notice',
                bannerMessage: 'We use cookies to enhance your experience and analyze site usage.',
                bannerMessageGDPR: 'We use cookies with your consent to enhance your experience, analyze site usage, and assist with marketing efforts.',
                bannerMessageCCPA: 'We use cookies to enhance your experience. California residents have additional privacy rights.',
                
                // Actions
                acceptAll: 'Accept All',
                acceptSelected: 'Accept Selected',
                essentialOnly: 'Essential Only',
                rejectAll: 'Reject All',
                managePreferences: 'Manage Preferences',
                savePreferences: 'Save Preferences',
                close: 'Close',
                
                // Modal
                modalTitle: 'Cookie Preferences',
                modalMessage: 'We use cookies to enhance your experience, analyze site usage, and personalize content. You can manage your preferences below.',
                
                // Links
                learnMore: 'Learn More',
                cookiePolicy: 'Cookie Policy',
                privacyPolicy: 'Privacy Policy',
                yourRights: 'Your Rights',
                caPrivacyRights: 'CA Privacy Rights',
                
                // Notifications
                allAccepted: 'All cookies accepted!',
                essentialAccepted: 'Only essential cookies accepted.',
                preferencesUpdated: 'Cookie preferences updated successfully!',
                
                // Tabs
                tabPreferences: 'Preferences',
                tabDetails: 'Cookie Details',
                tabAbout: 'About Cookies',
                
                // About
                aboutText: 'Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.',
                
                // Settings
                settingsButton: 'Cookie Settings',
                poweredBy: 'Powered by DAMP Cookie Policy'
            }
        };

        // State Management
        this.isConsentGiven = false;
        this.region = null;
        this.banner = null;
        this.modal = null;
        this.settingsModal = null;
        this.showAgainButton = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the cookie policy system
     */
    init() {
        this.detectRegion();
        this.loadConsentData();
        this.initializeGoogleConsent();
        this.createElements();
        this.bindEvents();
        this.checkConsentStatus();
        
        if (this.options.debug) {
            console.log('🍪 DAMP Cookie Policy initialized', {
                consent: this.consentData,
                region: this.region,
                options: this.options
            });
        }
    }

    /**
     * Detect user's region for compliance requirements
     */
    detectRegion() {
        // Check if compliance manager is available
        if (window.dampCompliance) {
            const complianceStatus = window.dampCompliance.getComplianceStatus();
            this.region = complianceStatus.region;
            this.consentData.region = this.region;
        } else {
            // Fallback region detection
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const language = navigator.language || navigator.userLanguage;
            
            // Simple region detection based on timezone and language
            if (timezone.includes('Europe') || language.startsWith('de') || language.startsWith('fr')) {
                this.region = { requiresGDPR: true, requiresCCPA: false, name: 'EU' };
            } else if (timezone.includes('America/Los_Angeles') || language === 'en-US') {
                this.region = { requiresGDPR: false, requiresCCPA: true, name: 'CA' };
            } else {
                this.region = { requiresGDPR: false, requiresCCPA: false, name: 'Other' };
            }
            
            this.consentData.region = this.region;
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
                } else {
                    // Version mismatch - reset consent
                    this.resetConsent();
                }
            }
        } catch (error) {
            console.warn('Cookie Policy: Error loading consent data', error);
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
            
            // Update consent systems
            this.updateGoogleConsent();
            this.updateComplianceManager();
            this.dispatchConsentEvent();
            
            if (this.options.debug) {
                console.log('🍪 Consent saved:', this.consentData);
            }
        } catch (error) {
            console.warn('Cookie Policy: Error saving consent data', error);
        }
    }

    /**
     * Initialize Google Analytics Consent Mode v2
     */
    initializeGoogleConsent() {
        // Set up Google Consent Mode v2 (Advanced)
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        
        // Set default consent state before GA loads
        gtag('consent', 'default', {
            'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
            'ad_user_data': this.consentData.marketing ? 'granted' : 'denied',
            'ad_personalization': this.consentData.marketing ? 'granted' : 'denied',
            'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
            'functionality_storage': this.consentData.functional ? 'granted' : 'denied',
            'personalization_storage': this.consentData.marketing ? 'granted' : 'denied',
            'security_storage': 'granted', // Always granted for security
            'wait_for_update': 500 // Wait up to 500ms for consent update
        });
        
        window.gtag_consent_initialized = true;
        
        if (this.options.debug) {
            console.log('🍪 Google Consent Mode v2 initialized');
        }
    }

    /**
     * Update Google Analytics consent
     */
    updateGoogleConsent() {
        if (window.gtag && window.gtag_consent_initialized) {
            const consentUpdate = {
                'ad_storage': this.consentData.marketing ? 'granted' : 'denied',
                'ad_user_data': this.consentData.marketing ? 'granted' : 'denied',
                'ad_personalization': this.consentData.marketing ? 'granted' : 'denied',
                'analytics_storage': this.consentData.analytics ? 'granted' : 'denied',
                'functionality_storage': this.consentData.functional ? 'granted' : 'denied',
                'personalization_storage': this.consentData.marketing ? 'granted' : 'denied',
                'security_storage': 'granted' // Always granted for security
            };

            gtag('consent', 'update', consentUpdate);
            
            // Track consent interaction with compliance data
            if (this.consentData.analytics) {
                gtag('event', 'consent_update', {
                    event_category: 'compliance',
                    event_label: 'user_interaction',
                    custom_map: {
                        analytics: this.consentData.analytics,
                        marketing: this.consentData.marketing,
                        functional: this.consentData.functional,
                        compliance_version: this.consentData.version,
                        gdpr_applicable: this.region?.requiresGDPR || false,
                        ccpa_applicable: this.region?.requiresCCPA || false,
                        method: this.consentData.method
                    }
                });
            }
            
            if (this.options.debug) {
                console.log('🍪 Google Consent Mode v2 updated:', consentUpdate);
            }
        }
    }

    /**
     * Update compliance manager
     */
    updateComplianceManager() {
        if (window.dampCompliance) {
            window.dampCompliance.updateConsent(this.consentData);
        }
        
        // Update other analytics systems
        if (window.DAMP_Analytics) {
            window.DAMP_Analytics.updateConsent(this.consentData);
        }
    }

    /**
     * Dispatch consent event for other systems
     */
    dispatchConsentEvent() {
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: {
                consent: this.consentData,
                timestamp: Date.now(),
                complianceVersion: this.consentData.version,
                region: this.region,
                hasAnalytics: this.consentData.analytics,
                hasMarketing: this.consentData.marketing,
                hasFunctional: this.consentData.functional
            }
        }));
    }

    /**
     * Create all UI elements
     */
    createElements() {
        this.createSimpleBanner();
        this.createDetailedModal();
        this.createSettingsModal();
        this.createShowAgainButton();
        this.addStyles();
    }

    /**
     * Create simple banner (default UI)
     */
    createSimpleBanner() {
        if (!this.options.enableSimpleBanner) return;
        
        const texts = this.texts[this.options.language];
        let message = texts.bannerMessage;
        let additionalLinks = '';
        
        // Customize message and links based on region
        if (this.region?.requiresGDPR) {
            message = texts.bannerMessageGDPR;
            additionalLinks = `
                <a href="${this.options.privacyPolicyUrl}" target="_blank">${texts.privacyPolicy}</a> | 
                <a href="${this.options.cookiePolicyUrl}" target="_blank">${texts.cookiePolicy}</a> |
                <a href="/pages/user-rights.html" target="_blank">${texts.yourRights}</a>
            `;
        } else if (this.region?.requiresCCPA) {
            message = texts.bannerMessageCCPA;
            additionalLinks = `
                <a href="${this.options.privacyPolicyUrl}" target="_blank">${texts.privacyPolicy}</a> | 
                <a href="/pages/ccpa-rights.html" target="_blank">${texts.caPrivacyRights}</a>
            `;
        } else {
            additionalLinks = `
                <a href="${this.options.privacyPolicyUrl}" target="_blank">${texts.privacyPolicy}</a> | 
                <a href="${this.options.cookiePolicyUrl}" target="_blank">${texts.cookiePolicy}</a>
            `;
        }
        
        this.banner = document.createElement('div');
        this.banner.className = 'damp-cookie-banner';
        this.banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <strong>${texts.bannerTitle}</strong> ${message}
                    <div class="cookie-banner-links">${additionalLinks}</div>
                </div>
                <div class="cookie-banner-actions">
                    <button class="cookie-btn cookie-btn-accept" data-action="accept-all">
                        ${texts.acceptAll}
                    </button>
                    <button class="cookie-btn cookie-btn-essential" data-action="essential-only">
                        ${texts.essentialOnly}
                    </button>
                    <button class="cookie-btn cookie-btn-settings" data-action="show-settings">
                        ${texts.managePreferences}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.banner);
    }

    /**
     * Create detailed modal
     */
    createDetailedModal() {
        if (!this.options.enableDetailedModal) return;
        
        const texts = this.texts[this.options.language];
        
        this.modal = document.createElement('div');
        this.modal.className = 'damp-cookie-modal';
        this.modal.innerHTML = `
            <div class="cookie-modal-backdrop"></div>
            <div class="cookie-modal-content">
                <div class="cookie-modal-header">
                    <div class="cookie-modal-icon">🍪</div>
                    <h3 class="cookie-modal-title">${texts.modalTitle}</h3>
                    <button class="cookie-modal-close" data-action="close-modal">×</button>
                </div>
                <div class="cookie-modal-body">
                    <p class="cookie-modal-message">${texts.modalMessage}</p>
                    <div class="cookie-types">
                        ${Object.entries(this.cookieTypes).map(([key, type]) => `
                            <div class="cookie-type ${type.required ? 'required' : ''}" data-type="${key}">
                                <div class="cookie-type-header">
                                    <label class="cookie-toggle">
                                        <input type="checkbox" 
                                               data-type="${key}" 
                                               ${type.required ? 'checked disabled' : ''}
                                               ${this.consentData[key] ? 'checked' : ''}>
                                        <span class="cookie-toggle-slider"></span>
                                    </label>
                                    <div class="cookie-type-info">
                                        <h4>${type.name}</h4>
                                        <p>${type.description}</p>
                                    </div>
                                    <button class="cookie-type-expand" data-expand="${key}">
                                        <span class="expand-icon">⌄</span>
                                    </button>
                                </div>
                                <div class="cookie-type-details" data-details="${key}">
                                    <div class="cookie-list">
                                        ${type.cookies.map(cookie => `
                                            <div class="cookie-item">
                                                <strong>${typeof cookie === 'string' ? cookie : cookie.name}</strong>
                                                ${typeof cookie === 'object' ? `
                                                    <span class="cookie-purpose">${cookie.purpose}</span>
                                                    <span class="cookie-duration">Duration: ${cookie.duration}</span>
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="cookie-modal-footer">
                    <div class="cookie-modal-links">
                        <a href="${this.options.privacyPolicyUrl}" target="_blank">${texts.privacyPolicy}</a>
                        <a href="${this.options.cookiePolicyUrl}" target="_blank">${texts.cookiePolicy}</a>
                    </div>
                    <div class="cookie-modal-actions">
                        <button class="cookie-btn cookie-btn-secondary" data-action="reject-all">
                            ${texts.rejectAll}
                        </button>
                        <button class="cookie-btn cookie-btn-primary" data-action="accept-selected">
                            ${texts.acceptSelected}
                        </button>
                        <button class="cookie-btn cookie-btn-success" data-action="accept-all">
                            ${texts.acceptAll}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }

    /**
     * Create settings modal for later preference management
     */
    createSettingsModal() {
        const texts = this.texts[this.options.language];
        
        this.settingsModal = document.createElement('div');
        this.settingsModal.className = 'damp-cookie-settings-modal';
        this.settingsModal.innerHTML = `
            <div class="cookie-modal-backdrop"></div>
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h3>${texts.modalTitle}</h3>
                    <button class="cookie-settings-close" data-action="close-settings">×</button>
                </div>
                <div class="cookie-settings-body">
                    <div class="cookie-settings-tabs">
                        <button class="cookie-tab active" data-tab="preferences">${texts.tabPreferences}</button>
                        <button class="cookie-tab" data-tab="details">${texts.tabDetails}</button>
                        <button class="cookie-tab" data-tab="about">${texts.tabAbout}</button>
                    </div>
                    <div class="cookie-tab-content">
                        <div class="cookie-tab-pane active" data-pane="preferences">
                            <div class="cookie-preferences">
                                ${Object.entries(this.cookieTypes).map(([key, type]) => `
                                    <div class="cookie-preference-item">
                                        <label class="cookie-toggle">
                                            <input type="checkbox" 
                                                   data-type="${key}" 
                                                   ${type.required ? 'checked disabled' : ''}
                                                   ${this.consentData[key] ? 'checked' : ''}>
                                            <span class="cookie-toggle-slider"></span>
                                        </label>
                                        <div class="cookie-preference-info">
                                            <h4>${type.name}</h4>
                                            <p>${type.description}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="cookie-tab-pane" data-pane="details">
                            <h4>Cookie Details</h4>
                            <p>Below you can see detailed information about all cookies used on this website.</p>
                            <div class="cookie-details-list">
                                ${Object.entries(this.cookieTypes).map(([key, type]) => `
                                    <div class="cookie-detail-category">
                                        <h5>${type.name}</h5>
                                        ${type.cookies.map(cookie => `
                                            <div class="cookie-detail-item">
                                                <strong>${typeof cookie === 'string' ? cookie : cookie.name}</strong>
                                                ${typeof cookie === 'object' ? `
                                                    <p>Purpose: ${cookie.purpose}</p>
                                                    <p>Duration: ${cookie.duration}</p>
                                                ` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="cookie-tab-pane" data-pane="about">
                            <h4>About Cookies</h4>
                            <p>${texts.aboutText}</p>
                            <p>You can manage your cookie preferences at any time by clicking the "${texts.settingsButton}" button.</p>
                        </div>
                    </div>
                </div>
                <div class="cookie-settings-footer">
                    <button class="cookie-btn cookie-btn-secondary" data-action="close-settings">${texts.close}</button>
                    <button class="cookie-btn cookie-btn-primary" data-action="save-settings">${texts.savePreferences}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.settingsModal);
    }

    /**
     * Create floating "Show Again" button
     */
    createShowAgainButton() {
        if (!this.options.showAgain) return;
        
        const texts = this.texts[this.options.language];
        
        this.showAgainButton = document.createElement('button');
        this.showAgainButton.className = 'damp-cookie-show-again';
        this.showAgainButton.innerHTML = `🍪 ${texts.settingsButton}`;
        this.showAgainButton.title = texts.managePreferences;
        this.showAgainButton.setAttribute('data-action', 'show-settings');
        
        document.body.appendChild(this.showAgainButton);
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Banner events
        if (this.banner) {
            this.banner.addEventListener('click', this.handleBannerClick.bind(this));
        }

        // Modal events
        if (this.modal) {
            this.modal.addEventListener('click', this.handleModalClick.bind(this));
            this.modal.addEventListener('change', this.handleModalChange.bind(this));
        }

        // Settings modal events
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', this.handleSettingsClick.bind(this));
            this.settingsModal.addEventListener('change', this.handleSettingsChange.bind(this));
        }

        // Show again button
        if (this.showAgainButton) {
            this.showAgainButton.addEventListener('click', () => this.showSettings());
        }

        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isModalVisible(this.modal)) {
                    // Don't close consent modal with escape - require explicit choice
                } else if (this.isModalVisible(this.settingsModal)) {
                    this.hideSettings();
                }
            }
        });
    }

    /**
     * Handle banner click events
     */
    handleBannerClick(e) {
        const action = e.target.dataset.action;
        
        switch (action) {
            case 'accept-all':
                this.acceptAll('banner');
                break;
            case 'essential-only':
                this.acceptEssential('banner');
                break;
            case 'show-settings':
                this.showDetailedModal();
                break;
        }
    }

    /**
     * Handle modal click events
     */
    handleModalClick(e) {
        const action = e.target.dataset.action;
        const expand = e.target.dataset.expand;
        
        if (action) {
            switch (action) {
                case 'accept-all':
                    this.acceptAll('modal');
                    break;
                case 'accept-selected':
                    this.acceptSelected('modal');
                    break;
                case 'reject-all':
                    this.rejectAll('modal');
                    break;
                case 'close-modal':
                    this.hideDetailedModal();
                    break;
            }
        } else if (expand) {
            this.toggleCookieDetails(expand);
        } else if (e.target.classList.contains('cookie-modal-backdrop')) {
            // Don't close modal on backdrop click - require explicit choice
        }
    }

    /**
     * Handle modal checkbox changes
     */
    handleModalChange(e) {
        if (e.target.type === 'checkbox' && e.target.dataset.type) {
            const type = e.target.dataset.type;
            if (!this.cookieTypes[type].required) {
                this.consentData[type] = e.target.checked;
            }
        }
    }

    /**
     * Handle settings modal events
     */
    handleSettingsClick(e) {
        const action = e.target.dataset.action;
        const tab = e.target.dataset.tab;
        
        if (action) {
            switch (action) {
                case 'close-settings':
                    this.hideSettings();
                    break;
                case 'save-settings':
                    this.saveSettings();
                    break;
            }
        } else if (tab) {
            this.switchSettingsTab(tab);
        } else if (e.target.classList.contains('cookie-modal-backdrop')) {
            this.hideSettings();
        }
    }

    /**
     * Handle settings modal checkbox changes
     */
    handleSettingsChange(e) {
        if (e.target.type === 'checkbox' && e.target.dataset.type) {
            const type = e.target.dataset.type;
            if (!this.cookieTypes[type].required) {
                this.consentData[type] = e.target.checked;
            }
        }
    }

    /**
     * Check if modal is visible
     */
    isModalVisible(modal) {
        return modal && modal.style.display !== 'none' && modal.classList.contains('visible');
    }

    /**
     * Show simple banner
     */
    showBanner() {
        if (this.banner && !this.isConsentGiven) {
            this.banner.style.display = 'block';
            setTimeout(() => {
                this.banner.classList.add('visible');
            }, 100);
        }
    }

    /**
     * Hide simple banner
     */
    hideBanner() {
        if (this.banner) {
            this.banner.classList.remove('visible');
            setTimeout(() => {
                this.banner.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Show detailed modal
     */
    showDetailedModal() {
        if (this.modal) {
            this.hideBanner();
            this.modal.style.display = 'block';
            document.body.classList.add('cookie-modal-open');
            
            setTimeout(() => {
                this.modal.classList.add('visible');
            }, 10);
            
            // Update checkbox states
            this.updateModalCheckboxes();
        }
    }

    /**
     * Hide detailed modal
     */
    hideDetailedModal() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            document.body.classList.remove('cookie-modal-open');
            
            setTimeout(() => {
                this.modal.style.display = 'none';
                if (!this.isConsentGiven) {
                    this.showBanner(); // Show banner again if consent not given
                }
            }, 300);
        }
    }

    /**
     * Show settings modal
     */
    showSettings() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'block';
            document.body.classList.add('cookie-modal-open');
            
            setTimeout(() => {
                this.settingsModal.classList.add('visible');
            }, 10);
            
            // Update checkbox states
            this.updateSettingsCheckboxes();
        }
    }

    /**
     * Hide settings modal
     */
    hideSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('visible');
            document.body.classList.remove('cookie-modal-open');
            
            setTimeout(() => {
                this.settingsModal.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Update modal checkbox states
     */
    updateModalCheckboxes() {
        if (this.modal) {
            Object.entries(this.consentData).forEach(([key, value]) => {
                if (typeof value === 'boolean') {
                    const checkbox = this.modal.querySelector(`input[data-type="${key}"]`);
                    if (checkbox) {
                        checkbox.checked = value;
                    }
                }
            });
        }
    }

    /**
     * Update settings checkbox states
     */
    updateSettingsCheckboxes() {
        if (this.settingsModal) {
            Object.entries(this.consentData).forEach(([key, value]) => {
                if (typeof value === 'boolean') {
                    const checkbox = this.settingsModal.querySelector(`input[data-type="${key}"]`);
                    if (checkbox) {
                        checkbox.checked = value;
                    }
                }
            });
        }
    }

    /**
     * Toggle cookie details expansion
     */
    toggleCookieDetails(type) {
        const details = this.modal.querySelector(`[data-details="${type}"]`);
        const expand = this.modal.querySelector(`[data-expand="${type}"] .expand-icon`);
        
        if (details && expand) {
            const isExpanded = details.classList.contains('expanded');
            
            if (isExpanded) {
                details.classList.remove('expanded');
                expand.style.transform = 'rotate(0deg)';
            } else {
                details.classList.add('expanded');
                expand.style.transform = 'rotate(180deg)';
            }
        }
    }

    /**
     * Switch settings tab
     */
    switchSettingsTab(tabName) {
        // Update tab buttons
        const tabs = this.settingsModal.querySelectorAll('.cookie-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update tab panes
        const panes = this.settingsModal.querySelectorAll('.cookie-tab-pane');
        panes.forEach(pane => {
            if (pane.dataset.pane === tabName) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }

    /**
     * Check consent status and show appropriate UI
     */
    checkConsentStatus() {
        if (!this.isConsentGiven && this.options.autoShow) {
            this.showBanner();
        } else if (this.isConsentGiven && this.showAgainButton) {
            this.showAgainButton.style.display = 'block';
        }
    }

    /**
     * Accept all cookies
     */
    acceptAll(method = 'unknown') {
        Object.keys(this.cookieTypes).forEach(type => {
            this.consentData[type] = true;
        });
        
        this.consentData.method = method;
        this.saveConsentData();
        this.hideAllModals();
        this.showNotification(this.texts[this.options.language].allAccepted);
        this.showSettingsButton();
        
        this.trackEvent('cookie_consent_accept_all', { method });
    }

    /**
     * Accept only essential cookies
     */
    acceptEssential(method = 'unknown') {
        Object.keys(this.cookieTypes).forEach(type => {
            this.consentData[type] = this.cookieTypes[type].required;
        });
        
        this.consentData.method = method;
        this.saveConsentData();
        this.hideAllModals();
        this.showNotification(this.texts[this.options.language].essentialAccepted);
        this.showSettingsButton();
        
        this.trackEvent('cookie_consent_essential_only', { method });
    }

    /**
     * Accept selected cookies
     */
    acceptSelected(method = 'unknown') {
        this.consentData.method = method;
        this.saveConsentData();
        this.hideAllModals();
        this.showNotification(this.texts[this.options.language].preferencesUpdated);
        this.showSettingsButton();
        
        this.trackEvent('cookie_consent_accept_selected', { 
            method,
            functional: this.consentData.functional,
            analytics: this.consentData.analytics,
            marketing: this.consentData.marketing
        });
    }

    /**
     * Reject all non-essential cookies
     */
    rejectAll(method = 'unknown') {
        Object.keys(this.cookieTypes).forEach(type => {
            this.consentData[type] = this.cookieTypes[type].required;
        });
        
        this.consentData.method = method;
        this.saveConsentData();
        this.hideAllModals();
        this.showNotification(this.texts[this.options.language].essentialAccepted);
        this.showSettingsButton();
        
        this.trackEvent('cookie_consent_reject_all', { method });
    }

    /**
     * Save settings from settings modal
     */
    saveSettings() {
        this.consentData.method = 'settings';
        this.saveConsentData();
        this.hideSettings();
        this.showNotification(this.texts[this.options.language].preferencesUpdated);
        
        this.trackEvent('cookie_consent_settings_saved', {
            functional: this.consentData.functional,
            analytics: this.consentData.analytics,
            marketing: this.consentData.marketing
        });
    }

    /**
     * Hide all modals
     */
    hideAllModals() {
        this.hideBanner();
        this.hideDetailedModal();
        this.hideSettings();
    }

    /**
     * Show settings button
     */
    showSettingsButton() {
        if (this.showAgainButton) {
            this.showAgainButton.style.display = 'block';
        }
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
            version: '3.0.0',
            region: this.region,
            method: null
        };
        this.isConsentGiven = false;
        
        if (this.showAgainButton) {
            this.showAgainButton.style.display = 'none';
        }
        
        if (this.options.autoShow) {
            this.showBanner();
        }
    }

    /**
     * Show notification
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'damp-cookie-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✓</span>
                <span class="notification-message">${message}</span>
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
     * Track events (only if analytics consent given)
     */
    trackEvent(event, data = {}) {
        if (window.gtag && this.consentData.analytics) {
            gtag('event', event, {
                event_category: 'cookie_consent',
                compliance_version: this.consentData.version,
                gdpr_applicable: this.region?.requiresGDPR || false,
                ccpa_applicable: this.region?.requiresCCPA || false,
                ...data
            });
        }
    }

    /**
     * Get current consent status (Public API)
     */
    getConsentStatus() {
        return {
            hasConsent: this.isConsentGiven,
            preferences: { ...this.consentData },
            canUseAnalytics: this.consentData.analytics,
            canUseMarketing: this.consentData.marketing,
            canUseFunctional: this.consentData.functional,
            region: this.region,
            version: this.consentData.version
        };
    }

    /**
     * Public API: Force show consent modal
     */
    showConsentModal() {
        this.showDetailedModal();
    }

    /**
     * Public API: Force show settings
     */
    showSettingsModal() {
        this.showSettings();
    }

    /**
     * Add comprehensive styles
     */
    addStyles() {
        if (document.getElementById('damp-cookie-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'damp-cookie-styles';
        style.textContent = `
            /* DAMP Cookie Policy Styles - Comprehensive */
            
            /* Banner Styles */
            .damp-cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(15, 15, 35, 0.98);
                backdrop-filter: blur(20px);
                border-top: 2px solid #00d4ff;
                padding: 20px;
                z-index: 999999;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
            }

            .damp-cookie-banner.visible {
                transform: translateY(0);
            }

            .cookie-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 30px;
                flex-wrap: wrap;
            }

            .cookie-banner-text {
                flex: 1;
                color: #ffffff;
                font-size: 15px;
                line-height: 1.5;
                min-width: 320px;
            }

            .cookie-banner-links {
                margin-top: 8px;
                opacity: 0.9;
            }

            .cookie-banner-links a {
                color: #00d4ff;
                text-decoration: none;
                font-size: 13px;
                margin-right: 15px;
            }

            .cookie-banner-links a:hover {
                text-decoration: underline;
            }

            .cookie-banner-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                align-items: center;
            }

            /* Button Styles */
            .cookie-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
                white-space: nowrap;
            }

            .cookie-btn-accept {
                background: #00d4ff;
                color: #0f0f23;
            }

            .cookie-btn-accept:hover {
                background: #00bce6;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
            }

            .cookie-btn-essential {
                background: transparent;
                color: #ffffff;
                border: 2px solid #666;
            }

            .cookie-btn-essential:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: #999;
            }

            .cookie-btn-settings {
                background: transparent;
                color: #00d4ff;
                border: 2px solid #00d4ff;
            }

            .cookie-btn-settings:hover {
                background: rgba(0, 212, 255, 0.1);
                transform: translateY(-1px);
            }

            .cookie-btn-primary {
                background: #00d4ff;
                color: white;
            }

            .cookie-btn-primary:hover {
                background: #00bce6;
                transform: translateY(-1px);
            }

            .cookie-btn-secondary {
                background: transparent;
                color: #666;
                border: 2px solid #666;
            }

            .cookie-btn-secondary:hover {
                background: rgba(102, 102, 102, 0.1);
                border-color: #999;
            }

            .cookie-btn-success {
                background: #00ff88;
                color: #0f0f23;
            }

            .cookie-btn-success:hover {
                background: #00e676;
                transform: translateY(-1px);
            }

            /* Modal Styles */
            .damp-cookie-modal,
            .damp-cookie-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000000;
                display: none;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .damp-cookie-modal.visible,
            .damp-cookie-settings-modal.visible {
                opacity: 1;
            }

            .cookie-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
            }

            .cookie-modal-content,
            .cookie-settings-content {
                background: #ffffff;
                border-radius: 16px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .damp-cookie-modal.visible .cookie-modal-content,
            .damp-cookie-settings-modal.visible .cookie-settings-content {
                transform: scale(1);
            }

            .cookie-modal-header,
            .cookie-settings-header {
                display: flex;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid #eee;
                gap: 15px;
            }

            .cookie-modal-icon {
                font-size: 2rem;
                filter: grayscale(0);
            }

            .cookie-modal-title {
                flex: 1;
                margin: 0;
                font-size: 1.5rem;
                font-weight: 700;
                color: #333;
            }

            .cookie-modal-close,
            .cookie-settings-close {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: #666;
                padding: 4px;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .cookie-modal-close:hover,
            .cookie-settings-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #333;
                transform: rotate(90deg);
            }

            .cookie-modal-body,
            .cookie-settings-body {
                padding: 24px;
            }

            .cookie-modal-message {
                margin: 0 0 24px 0;
                font-size: 16px;
                line-height: 1.6;
                color: #555;
            }

            /* Cookie Types */
            .cookie-types {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .cookie-type {
                border: 2px solid #eee;
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.2s ease;
            }

            .cookie-type:hover {
                border-color: #00d4ff;
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.1);
            }

            .cookie-type.required {
                border-color: #00ff88;
                background: rgba(0, 255, 136, 0.02);
            }

            .cookie-type-header {
                display: flex;
                align-items: flex-start;
                padding: 20px;
                gap: 16px;
            }

            .cookie-type-info {
                flex: 1;
            }

            .cookie-type-info h4 {
                margin: 0 0 8px 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
            }

            .cookie-type-info p {
                margin: 0;
                font-size: 14px;
                color: #666;
                line-height: 1.5;
            }

            .cookie-type-expand {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                transition: all 0.2s ease;
            }

            .cookie-type-expand:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #333;
            }

            .expand-icon {
                font-size: 18px;
                transition: transform 0.2s ease;
            }

            .cookie-type-details {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
                background: rgba(0, 0, 0, 0.02);
            }

            .cookie-type-details.expanded {
                max-height: 400px;
            }

            .cookie-list {
                padding: 20px;
                border-top: 1px solid #eee;
            }

            .cookie-item {
                margin-bottom: 16px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #eee;
            }

            .cookie-item strong {
                display: block;
                font-size: 14px;
                color: #333;
                margin-bottom: 4px;
            }

            .cookie-purpose,
            .cookie-duration {
                display: block;
                font-size: 13px;
                color: #666;
                margin-bottom: 2px;
            }

            /* Toggle Switch */
            .cookie-toggle {
                position: relative;
                display: block;
                width: 56px;
                height: 32px;
                margin: 0;
                flex-shrink: 0;
            }

            .cookie-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .cookie-toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.3s;
                border-radius: 32px;
            }

            .cookie-toggle-slider:before {
                position: absolute;
                content: "";
                height: 24px;
                width: 24px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .cookie-toggle input:checked + .cookie-toggle-slider {
                background-color: #00d4ff;
            }

            .cookie-toggle input:checked + .cookie-toggle-slider:before {
                transform: translateX(24px);
            }

            .cookie-toggle input:disabled + .cookie-toggle-slider {
                background-color: #00ff88;
                opacity: 0.8;
                cursor: not-allowed;
            }

            .cookie-toggle input:disabled + .cookie-toggle-slider:before {
                cursor: not-allowed;
            }

            /* Modal Footer */
            .cookie-modal-footer {
                padding: 24px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 16px;
            }

            .cookie-modal-links {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }

            .cookie-modal-links a {
                color: #00d4ff;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
            }

            .cookie-modal-links a:hover {
                text-decoration: underline;
            }

            .cookie-modal-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            /* Settings Modal Specific */
            .cookie-settings-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
                margin-bottom: 24px;
            }

            .cookie-tab {
                flex: 1;
                padding: 12px 16px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #666;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
            }

            .cookie-tab:hover {
                color: #333;
                background: rgba(0, 0, 0, 0.02);
            }

            .cookie-tab.active {
                color: #00d4ff;
                border-bottom-color: #00d4ff;
            }

            .cookie-tab-pane {
                display: none;
            }

            .cookie-tab-pane.active {
                display: block;
            }

            .cookie-preferences {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .cookie-preference-item {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                padding: 16px;
                border: 2px solid #eee;
                border-radius: 12px;
                transition: all 0.2s ease;
            }

            .cookie-preference-item:hover {
                border-color: #00d4ff;
                background: rgba(0, 212, 255, 0.02);
            }

            .cookie-preference-info h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }

            .cookie-preference-info p {
                margin: 0;
                font-size: 14px;
                color: #666;
                line-height: 1.5;
            }

            .cookie-settings-footer {
                padding: 24px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            /* Show Again Button */
            .damp-cookie-show-again {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #00d4ff;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 50px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
                transition: all 0.3s ease;
                z-index: 999998;
                display: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .damp-cookie-show-again:hover {
                background: #00bce6;
                transform: translateY(-2px);
                box-shadow: 0 6px 24px rgba(0, 212, 255, 0.4);
            }

            /* Notification */
            .damp-cookie-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #00ff88;
                color: #0f0f23;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
                z-index: 1000001;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .damp-cookie-notification.show {
                transform: translateX(0);
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .notification-icon {
                font-size: 18px;
                color: #0f0f23;
            }

            .notification-message {
                font-size: 14px;
                font-weight: 600;
            }

            /* Body States */
            .cookie-modal-open {
                overflow: hidden;
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                .cookie-banner-content {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 20px;
                }

                .cookie-banner-text {
                    min-width: unset;
                    text-align: center;
                }

                .cookie-banner-actions {
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .cookie-btn {
                    flex: 1;
                    min-width: 120px;
                }

                .cookie-modal-content,
                .cookie-settings-content {
                    width: 95%;
                    max-height: 95vh;
                }

                .cookie-modal-header,
                .cookie-settings-header,
                .cookie-modal-body,
                .cookie-settings-body,
                .cookie-modal-footer,
                .cookie-settings-footer {
                    padding: 16px;
                }

                .cookie-modal-footer {
                    flex-direction: column;
                    align-items: stretch;
                }

                .cookie-modal-actions {
                    flex-direction: column;
                }

                .cookie-btn {
                    width: 100%;
                    justify-content: center;
                }

                .damp-cookie-show-again {
                    bottom: 10px;
                    right: 10px;
                    padding: 10px 16px;
                    font-size: 13px;
                }

                .damp-cookie-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    transform: translateY(-100px);
                }

                .damp-cookie-notification.show {
                    transform: translateY(0);
                }
            }

            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .damp-cookie-banner,
                .cookie-modal-content,
                .cookie-settings-content,
                .damp-cookie-notification {
                    transition: none !important;
                }
            }

            @media (prefers-contrast: high) {
                .cookie-type {
                    border-color: #000;
                }
                
                .cookie-btn {
                    border: 2px solid currentColor;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the comprehensive cookie policy system
    window.dampCookiePolicy = new DAMPCookiePolicy();
    
    // Legacy compatibility
    window.simpleCookieConsent = window.dampCookiePolicy;
    window.dampCookieConsent = window.dampCookiePolicy;
    
    // Global convenience functions
    window.acceptCookies = function() {
        if (window.dampCookiePolicy) {
            window.dampCookiePolicy.acceptAll('legacy_function');
        }
    };
    
    window.showCookieSettings = function() {
        if (window.dampCookiePolicy) {
            window.dampCookiePolicy.showSettingsModal();
        }
    };
    
    if (window.dampCookiePolicy.options.debug) {
        console.log('🍪 DAMP Cookie Policy System Ready', {
            version: '3.0.0',
            features: ['Simple Banner', 'Detailed Modal', 'GDPR/CCPA Compliant', 'Google Consent Mode v2'],
            instance: window.dampCookiePolicy
        });
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPCookiePolicy;
} 