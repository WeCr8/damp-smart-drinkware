/**
 * Simple DAMP Cookie Consent - Non-blocking, Navigation-friendly
 */
class SimpleCookieConsent {
    constructor(options = {}) {
        this.options = {
            autoShow: true,
            consentDuration: 365, // Days
            companyName: 'DAMP Smart Drinkware',
            privacyPolicyUrl: '/pages/privacy.html',
            cookiePolicyUrl: '/pages/cookie-policy.html',
            ...options
        };

        this.consentData = {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false,
            timestamp: null,
            version: '2.1.0'
        };

        this.isConsentGiven = false;
        this.banner = null;
        
        this.init();
    }

    init() {
        this.loadConsentData();
        
        if (!this.isConsentGiven && this.options.autoShow) {
            this.showBanner();
        }
    }

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
            console.warn('Cookie consent: Error loading data', error);
        }
    }

    saveConsentData() {
        try {
            this.consentData.timestamp = Date.now();
            localStorage.setItem('damp_cookie_consent', JSON.stringify(this.consentData));
            this.isConsentGiven = true;
            this.updateAnalyticsConsent();
        } catch (error) {
            console.warn('Cookie consent: Error saving data', error);
        }
    }

    showBanner() {
        if (this.banner) return;
        
        // Get region-specific compliance requirements
        const requiresGDPR = window.dampCompliance?.getComplianceStatus().region?.requiresGDPR;
        const requiresCCPA = window.dampCompliance?.getComplianceStatus().region?.requiresCCPA;
        
        let complianceText = 'We use cookies to enhance your experience and analyze site usage.';
        let additionalLinks = '';
        
        if (requiresGDPR) {
            complianceText = 'We use cookies with your consent to enhance your experience, analyze site usage, and assist with marketing efforts.';
            additionalLinks = `
                <a href="${this.options.privacyPolicyUrl}" target="_blank">Privacy Policy</a> | 
                <a href="${this.options.cookiePolicyUrl}" target="_blank">Cookie Policy</a> |
                <a href="/pages/user-rights.html" target="_blank">Your Rights</a>
            `;
        } else if (requiresCCPA) {
            complianceText = 'We use cookies to enhance your experience. California residents have additional privacy rights.';
            additionalLinks = `
                <a href="${this.options.privacyPolicyUrl}" target="_blank">Privacy Policy</a> | 
                <a href="/pages/ccpa-rights.html" target="_blank">CA Privacy Rights</a>
            `;
        } else {
            additionalLinks = `
                <a href="${this.options.privacyPolicyUrl}" target="_blank">Privacy Policy</a> | 
                <a href="${this.options.cookiePolicyUrl}" target="_blank">Cookie Policy</a>
            `;
        }
        
        this.banner = document.createElement('div');
        this.banner.className = 'simple-cookie-banner';
        this.banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <strong>🍪 Cookie Notice</strong> ${complianceText}
                    ${additionalLinks}
                </div>
                <div class="cookie-banner-actions">
                    <button class="cookie-btn cookie-btn-accept" onclick="window.simpleCookieConsent?.acceptAll()">Accept All</button>
                    <button class="cookie-btn cookie-btn-essential" onclick="window.simpleCookieConsent?.acceptEssential()">Essential Only</button>
                    <button class="cookie-btn cookie-btn-settings" onclick="window.simpleCookieConsent?.showSettings()">Manage Preferences</button>
                </div>
            </div>
        `;
        
        // Add CSS
        this.addStyles();
        
        document.body.appendChild(this.banner);
        
        // Animate in
        setTimeout(() => {
            this.banner.classList.add('cookie-banner-visible');
        }, 100);
    }

    hideBanner() {
        if (this.banner) {
            this.banner.classList.remove('cookie-banner-visible');
            setTimeout(() => {
                if (this.banner && this.banner.parentNode) {
                    this.banner.parentNode.removeChild(this.banner);
                }
                this.banner = null;
            }, 300);
        }
    }

    acceptAll() {
        this.consentData = {
            ...this.consentData,
            functional: true,
            analytics: true,
            marketing: true
        };
        
        this.saveConsentData();
        this.hideBanner();
        
        // Track acceptance
        this.trackEvent('cookie_consent_accept_all');
    }

    acceptEssential() {
        this.consentData = {
            ...this.consentData,
            functional: false,
            analytics: false,
            marketing: false
        };
        
        this.saveConsentData();
        this.hideBanner();
        
        // Track acceptance
        this.trackEvent('cookie_consent_essential_only');
    }

    showSettings() {
        if (document.querySelector('.cookie-settings-modal')) return;
        
        const modal = document.createElement('div');
        modal.className = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="cookie-settings-backdrop" onclick="window.simpleCookieConsent?.closeSettings()"></div>
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h3>Cookie Preferences</h3>
                    <button class="cookie-settings-close" onclick="window.simpleCookieConsent?.closeSettings()">×</button>
                </div>
                <div class="cookie-settings-body">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-toggle">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                            <div>
                                <h4>Essential Cookies</h4>
                                <p>Required for website functionality. Cannot be disabled.</p>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-toggle">
                                <input type="checkbox" id="functional-toggle" ${this.consentData.functional ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                            <div>
                                <h4>Functional Cookies</h4>
                                <p>Enhance your experience with personalized features.</p>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-toggle">
                                <input type="checkbox" id="analytics-toggle" ${this.consentData.analytics ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                            <div>
                                <h4>Analytics Cookies</h4>
                                <p>Help us improve our website and user experience.</p>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-toggle">
                                <input type="checkbox" id="marketing-toggle" ${this.consentData.marketing ? 'checked' : ''}>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                            <div>
                                <h4>Marketing Cookies</h4>
                                <p>Personalize ads and measure campaign effectiveness.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cookie-settings-footer">
                    <button class="cookie-btn cookie-btn-save" onclick="window.simpleCookieConsent?.saveSettings()">Save Preferences</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('cookie-settings-visible'), 10);
    }

    closeSettings() {
        const modal = document.querySelector('.cookie-settings-modal');
        if (modal) {
            modal.classList.remove('cookie-settings-visible');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    saveSettings() {
        const functional = document.getElementById('functional-toggle')?.checked || false;
        const analytics = document.getElementById('analytics-toggle')?.checked || false;
        const marketing = document.getElementById('marketing-toggle')?.checked || false;
        
        this.consentData = {
            ...this.consentData,
            functional,
            analytics,
            marketing
        };
        
        this.saveConsentData();
        this.closeSettings();
        this.hideBanner();
        
        // Track settings save
        this.trackEvent('cookie_consent_settings_saved', {
            functional,
            analytics,
            marketing
        });
    }

    resetConsent() {
        localStorage.removeItem('damp_cookie_consent');
        this.isConsentGiven = false;
        this.consentData = {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false,
            timestamp: null,
            version: '2.1.0'
        };
    }

    /**
     * Update analytics consent and notify analytics system
     * ENHANCED: Full compliance integration with GDPR/CCPA
     */
    updateAnalyticsConsent() {
        // Update Google Analytics consent mode v2 (Google's Advanced Mode)
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
            gtag('event', 'consent_update', {
                event_category: 'compliance',
                event_label: 'user_interaction',
                custom_map: {
                    analytics: this.consentData.analytics,
                    marketing: this.consentData.marketing,
                    functional: this.consentData.functional,
                    compliance_version: '2.1.0',
                    gdpr_applicable: window.dampCompliance?.getComplianceStatus().region?.requiresGDPR || false,
                    ccpa_applicable: window.dampCompliance?.getComplianceStatus().region?.requiresCCPA || false
                }
            });
            
            console.log('🍪 Google Consent Mode v2 updated (Advanced Mode):', consentUpdate);
        }
        
        // Update compliance manager
        if (window.dampCompliance) {
            window.dampCompliance.updateConsent(this.consentData);
        }
        
        // Notify other systems
        if (window.DAMP_Analytics) {
            window.DAMP_Analytics.updateConsent(this.consentData);
        }
        
        // Dispatch enhanced compliance event
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: {
                consent: this.consentData,
                timestamp: Date.now(),
                complianceVersion: '2.1.0',
                region: window.dampCompliance?.getComplianceStatus().region
            }
        }));
    }

    trackEvent(event, data = {}) {
        if (window.gtag && this.consentData.analytics) {
            gtag('event', event, {
                event_category: 'cookie_consent',
                ...data
            });
        }
    }

    addStyles() {
        if (document.getElementById('simple-cookie-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'simple-cookie-styles';
        style.textContent = `
            .simple-cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(15, 15, 35, 0.98);
                backdrop-filter: blur(10px);
                border-top: 2px solid #00d4ff;
                padding: 15px 20px;
                z-index: 999999;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .simple-cookie-banner.cookie-banner-visible {
                transform: translateY(0);
            }

            .cookie-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                flex-wrap: wrap;
            }

            .cookie-banner-text {
                flex: 1;
                color: #ffffff;
                font-size: 14px;
                line-height: 1.4;
                min-width: 300px;
            }

            .cookie-banner-text a {
                color: #00d4ff;
                text-decoration: none;
            }

            .cookie-banner-text a:hover {
                text-decoration: underline;
            }

            .cookie-banner-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .cookie-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
            }

            .cookie-btn-accept {
                background: #00d4ff;
                color: #0f0f23;
            }

            .cookie-btn-accept:hover {
                background: #00bce6;
                transform: translateY(-1px);
            }

            .cookie-btn-essential {
                background: transparent;
                color: #ffffff;
                border: 1px solid #666;
            }

            .cookie-btn-essential:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .cookie-btn-settings {
                background: transparent;
                color: #00d4ff;
                border: 1px solid #00d4ff;
            }

            .cookie-btn-settings:hover {
                background: rgba(0, 212, 255, 0.1);
            }

            .cookie-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .cookie-settings-modal.cookie-settings-visible {
                opacity: 1;
            }

            .cookie-settings-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
            }

            .cookie-settings-content {
                background: #ffffff;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .cookie-settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }

            .cookie-settings-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .cookie-settings-body {
                padding: 20px;
            }

            .cookie-category {
                margin-bottom: 20px;
            }

            .cookie-category-header {
                display: flex;
                align-items: flex-start;
                gap: 15px;
            }

            .cookie-toggle {
                position: relative;
                display: block;
                width: 50px;
                height: 24px;
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
                transition: 0.2s;
                border-radius: 24px;
            }

            .cookie-toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.2s;
                border-radius: 50%;
            }

            .cookie-toggle input:checked + .cookie-toggle-slider {
                background-color: #00d4ff;
            }

            .cookie-toggle input:checked + .cookie-toggle-slider:before {
                transform: translateX(26px);
            }

            .cookie-toggle input:disabled + .cookie-toggle-slider {
                background-color: #00d4ff;
                opacity: 0.6;
                cursor: not-allowed;
            }

            .cookie-category h4 {
                margin: 0 0 5px 0;
                font-size: 16px;
                color: #333;
            }

            .cookie-category p {
                margin: 0;
                font-size: 14px;
                color: #666;
                line-height: 1.4;
            }

            .cookie-settings-footer {
                padding: 20px;
                border-top: 1px solid #eee;
                text-align: right;
            }

            .cookie-btn-save {
                background: #00d4ff;
                color: white;
                padding: 10px 20px;
                font-size: 14px;
            }

            .cookie-btn-save:hover {
                background: #00bce6;
            }

            @media (max-width: 768px) {
                .cookie-banner-content {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 15px;
                }

                .cookie-banner-text {
                    min-width: unset;
                    text-align: center;
                }

                .cookie-banner-actions {
                    justify-content: center;
                }

                .cookie-btn {
                    flex: 1;
                    min-width: 80px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    window.simpleCookieConsent = new SimpleCookieConsent();
    
    // Legacy compatibility
    window.acceptCookies = function() {
        if (window.simpleCookieConsent) {
            window.simpleCookieConsent.acceptAll();
        }
    };
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleCookieConsent;
} 