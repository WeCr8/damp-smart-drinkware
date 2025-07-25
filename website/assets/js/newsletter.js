// DAMP Smart Drinkware - Newsletter Subscription Handler
// Enhanced with Firebase integration, validation, and analytics
// Copyright 2025 WeCr8 Solutions LLC

class DAMPNewsletter {
    constructor() {
        this.form = null;
        this.emailInput = null;
        this.submitButton = null;
        this.successMessage = null;
        this.errorMessage = null;
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM and Firebase services to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupForm());
        } else {
            this.setupForm();
        }
    }
    
    setupForm() {
        // Get form elements
        this.form = document.getElementById('newsletterForm');
        this.emailInput = document.getElementById('newsletterEmail');
        this.submitButton = this.form?.querySelector('.newsletter-button');
        this.successMessage = document.getElementById('newsletterSuccess');
        this.errorMessage = document.getElementById('newsletterError');
        
        if (!this.form || !this.emailInput || !this.submitButton) {
            console.warn('Newsletter form elements not found');
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check if Firebase services are available
        this.waitForFirebaseServices();
        
        console.log('✅ DAMP Newsletter system initialized');
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time email validation
        this.emailInput.addEventListener('input', () => this.validateEmailInput());
        this.emailInput.addEventListener('blur', () => this.validateEmailInput());
        
        // Enter key handling
        this.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSubmit(e);
            }
        });
        
        // Clear error states on focus
        this.emailInput.addEventListener('focus', () => this.clearErrorState());
    }
    
    async waitForFirebaseServices() {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkServices = () => {
            if (window.firebaseServices?.emailService) {
                console.log('✅ Firebase email services ready');
                return;
            } else if (attempts >= maxAttempts) {
                console.warn('⚠️ Firebase services not available - using fallback mode');
                return;
            } else {
                attempts++;
                setTimeout(checkServices, 100);
            }
        };
        
        checkServices();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const email = this.emailInput.value.trim();
        
        // Client-side validation
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            this.emailInput.focus();
            return;
        }
        
        // Check for disposable email (basic check)
        if (this.isDisposableEmail(email)) {
            this.showError('Please use a permanent email address');
            this.emailInput.focus();
            return;
        }
        
        // Get user preferences
        const preferences = this.getFormPreferences();
        
        try {
            this.setLoadingState(true);
            
            // Submit to Firebase
            await this.submitSubscription(email, preferences);
            
            // Show success
            this.showSuccess();
            
            // Reset form
            this.resetForm();
            
            // Track successful subscription
            this.trackSubscription(email, preferences);
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showError(error.message || 'Failed to subscribe. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async submitSubscription(email, preferences) {
        if (window.firebaseServices?.emailService) {
            // Use Firebase email service
            const result = await window.firebaseServices.emailService.subscribeToNewsletter(email, {
                ...preferences,
                source: 'homepage_newsletter',
                tags: ['homepage_subscriber', 'early_adopter']
            });
            
            console.log('✅ Newsletter subscription successful:', result);
            return result;
        } else {
            // Fallback: Store in localStorage and show success
            console.warn('⚠️ Firebase not available - using fallback storage');
            
            const subscriptionData = {
                email,
                preferences,
                subscribedAt: new Date().toISOString(),
                source: 'homepage_newsletter_fallback'
            };
            
            // Store in localStorage for later sync
            const existingSubscriptions = JSON.parse(localStorage.getItem('damp_newsletter_fallback') || '[]');
            existingSubscriptions.push(subscriptionData);
            localStorage.setItem('damp_newsletter_fallback', JSON.stringify(existingSubscriptions));
            
            return { id: 'fallback_' + Date.now(), action: 'subscribed' };
        }
    }
    
    getFormPreferences() {
        const form = new FormData(this.form);
        return {
            productUpdates: form.get('productUpdates') === 'on',
            launchAlerts: form.get('launchAlerts') === 'on',
            marketingEmails: true,
            weeklyDigest: false
        };
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254 && email.length >= 3;
    }
    
    isDisposableEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        const disposableDomains = [
            'tempmail.org', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com', 'throwaway.email',
            'temp-mail.org', 'fake-mail.org'
        ];
        return disposableDomains.includes(domain);
    }
    
    validateEmailInput() {
        const email = this.emailInput.value.trim();
        
        if (email === '') {
            this.clearValidationState();
            return;
        }
        
        if (this.validateEmail(email)) {
            this.setValidState();
        } else {
            this.setInvalidState();
        }
    }
    
    setValidState() {
        this.emailInput.style.borderColor = '#00ff88';
        this.emailInput.style.boxShadow = '0 0 0 3px rgba(0, 255, 136, 0.1)';
        this.updateInputIcon('✓');
    }
    
    setInvalidState() {
        this.emailInput.style.borderColor = '#ff4757';
        this.emailInput.style.boxShadow = '0 0 0 3px rgba(255, 71, 87, 0.1)';
        this.updateInputIcon('⚠️');
    }
    
    clearValidationState() {
        this.emailInput.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        this.emailInput.style.boxShadow = 'none';
        this.updateInputIcon('📧');
    }
    
    clearErrorState() {
        this.clearValidationState();
        this.hideError();
    }
    
    updateInputIcon(icon) {
        const inputIcon = this.form.querySelector('.input-icon');
        if (inputIcon) {
            inputIcon.textContent = icon;
        }
    }
    
    setLoadingState(loading) {
        this.isSubmitting = loading;
        
        if (loading) {
            this.submitButton.classList.add('loading');
            this.submitButton.disabled = true;
            this.submitButton.querySelector('.button-text').textContent = 'Subscribing...';
            this.submitButton.querySelector('.button-icon').textContent = '⏳';
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.disabled = false;
            this.submitButton.querySelector('.button-text').textContent = 'Subscribe';
            this.submitButton.querySelector('.button-icon').textContent = '→';
        }
    }
    
    showSuccess() {
        this.hideError();
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideSuccess();
        }, 10000);
    }
    
    hideSuccess() {
        this.successMessage.style.display = 'none';
        this.form.style.display = 'block';
    }
    
    showError(message) {
        this.hideSuccess();
        const errorText = document.getElementById('newsletterErrorText');
        if (errorText) {
            errorText.textContent = message;
        }
        this.errorMessage.style.display = 'block';
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            this.hideError();
        }, 8000);
    }
    
    hideError() {
        this.errorMessage.style.display = 'none';
    }
    
    resetForm() {
        this.form.reset();
        this.clearValidationState();
        this.emailInput.value = '';
    }
    
    trackSubscription(email, preferences) {
        try {
            // Google Analytics
            if (window.gtag) {
                gtag('event', 'newsletter_subscribe', {
                    event_category: 'engagement',
                    event_label: 'homepage_newsletter',
                    value: 1
                });
            }
            
            // Firebase Analytics
            if (window.firebaseServices?.analyticsService) {
                window.firebaseServices.analyticsService.trackEvent('newsletter_subscribe_success', {
                    source: 'homepage',
                    email_domain: email.split('@')[1],
                    product_updates: preferences.productUpdates,
                    launch_alerts: preferences.launchAlerts
                });
            }
            
            console.log('✅ Newsletter subscription tracked');
        } catch (error) {
            console.warn('⚠️ Analytics tracking failed:', error);
        }
    }
    
    // Public API for external integration
    async subscribeEmail(email, preferences = {}) {
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email address');
        }
        
        return await this.submitSubscription(email, {
            productUpdates: true,
            launchAlerts: true,
            marketingEmails: true,
            weeklyDigest: false,
            ...preferences
        });
    }
    
    // Get subscription status
    async getSubscriptionStatus(email) {
        if (window.firebaseServices?.emailService) {
            return await window.firebaseServices.emailService.getSubscriberByEmail(email);
        }
        return null;
    }
    
    // Unsubscribe method
    async unsubscribe(email, reason = 'user_request') {
        if (window.firebaseServices?.emailService) {
            return await window.firebaseServices.emailService.unsubscribeFromNewsletter(email, reason);
        }
        throw new Error('Email service not available');
    }
}

// Initialize newsletter system
let dampNewsletter;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dampNewsletter = new DAMPNewsletter();
    });
} else {
    dampNewsletter = new DAMPNewsletter();
}

// Make available globally
window.DAMPNewsletter = DAMPNewsletter;
window.dampNewsletter = dampNewsletter;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPNewsletter;
} 