/**
 * Stripe Integration Module
 * Google Engineering Standards Implementation
 * Payment Processing & Subscription Management
 * 
 * @fileoverview Stripe module for payment processing and subscription management
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { loadStripe } from '@stripe/stripe-js';
import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { SecurityValidator } from '../utils/security-validator.js';

/**
 * Stripe Module Class
 * Handles all Stripe operations with enterprise-level patterns
 */
export class StripeModule {
    #config = null;
    #stripe = null;
    #elements = null;
    #logger = null;
    #errorHandler = null;
    #securityValidator = null;
    #initialized = false;
    #publishableKey = null;
    #currentPaymentIntent = null;
    
    /**
     * Initialize Stripe module
     * @param {Object} config - Stripe configuration
     */
    constructor(config) {
        this.#config = this.#validateConfig(config);
        this.#publishableKey = config.publishableKey;
        this.#logger = new Logger('StripeModule');
        this.#errorHandler = new ErrorHandler();
        this.#securityValidator = new SecurityValidator();
    }
    
    /**
     * Initialize Stripe services
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            this.#logger.info('Initializing Stripe Module');
            
            // Load Stripe.js
            this.#stripe = await loadStripe(this.#publishableKey);
            
            if (!this.#stripe) {
                throw new Error('Failed to initialize Stripe');
            }
            
            // Initialize Elements
            this.#elements = this.#stripe.elements({
                appearance: this.#getElementsAppearance(),
                loader: 'auto'
            });
            
            this.#initialized = true;
            this.#logger.info('Stripe Module initialized successfully');
            
        } catch (error) {
            this.#errorHandler.handleError('STRIPE_INITIALIZATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Payment Processing Methods
     */
    
    /**
     * Create payment intent for one-time payment
     * @param {Object} paymentData - Payment information
     * @param {number} paymentData.amount - Amount in cents
     * @param {string} paymentData.currency - Currency code
     * @param {Object} paymentData.metadata - Additional metadata
     * @returns {Promise<Object>} Payment intent data
     */
    async createPaymentIntent(paymentData) {
        try {
            this.#securityValidator.validatePaymentData(paymentData);
            
            // Call your backend API to create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.#getAuthToken()}`
                },
                body: JSON.stringify({
                    amount: paymentData.amount,
                    currency: paymentData.currency || 'usd',
                    metadata: {
                        ...paymentData.metadata,
                        source: 'damp_web_app',
                        timestamp: Date.now()
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const paymentIntent = await response.json();
            this.#currentPaymentIntent = paymentIntent;
            
            this.#logger.info('Payment intent created', { 
                id: paymentIntent.id,
                amount: paymentData.amount 
            });
            
            return paymentIntent;
            
        } catch (error) {
            this.#errorHandler.handleError('PAYMENT_INTENT_CREATION_FAILED', error);
            throw this.#normalizeStripeError(error);
        }
    }
    
    /**
     * Confirm payment with payment method
     * @param {string} clientSecret - Payment intent client secret
     * @param {Object} paymentMethodData - Payment method information
     * @returns {Promise<Object>} Payment result
     */
    async confirmPayment(clientSecret, paymentMethodData) {
        try {
            this.#securityValidator.validateClientSecret(clientSecret);
            
            const result = await this.#stripe.confirmPayment({
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/pages/payment-success.html`,
                    payment_method_data: paymentMethodData
                },
                redirect: 'if_required'
            });
            
            if (result.error) {
                throw result.error;
            }
            
            this.#logger.info('Payment confirmed', { 
                paymentIntentId: result.paymentIntent?.id 
            });
            
            return {
                success: true,
                paymentIntent: result.paymentIntent,
                redirectUrl: result.redirectUrl
            };
            
        } catch (error) {
            this.#errorHandler.handleError('PAYMENT_CONFIRMATION_FAILED', error);
            throw this.#normalizeStripeError(error);
        }
    }
    
    /**
     * Create payment method
     * @param {string} type - Payment method type (card, sepa_debit, etc.)
     * @param {Object} elementOrDetails - Stripe element or payment details
     * @param {Object} billingDetails - Billing information
     * @returns {Promise<Object>} Payment method
     */
    async createPaymentMethod(type, elementOrDetails, billingDetails = {}) {
        try {
            const result = await this.#stripe.createPaymentMethod({
                type,
                [type]: elementOrDetails,
                billing_details: {
                    name: billingDetails.name,
                    email: billingDetails.email,
                    phone: billingDetails.phone,
                    address: {
                        line1: billingDetails.address?.line1,
                        line2: billingDetails.address?.line2,
                        city: billingDetails.address?.city,
                        state: billingDetails.address?.state,
                        postal_code: billingDetails.address?.postal_code,
                        country: billingDetails.address?.country || 'US'
                    }
                }
            });
            
            if (result.error) {
                throw result.error;
            }
            
            this.#logger.info('Payment method created', { 
                id: result.paymentMethod.id,
                type: result.paymentMethod.type 
            });
            
            return result.paymentMethod;
            
        } catch (error) {
            this.#errorHandler.handleError('PAYMENT_METHOD_CREATION_FAILED', error);
            throw this.#normalizeStripeError(error);
        }
    }
    
    /**
     * Subscription Management Methods
     */
    
    /**
     * Create subscription checkout session
     * @param {Object} subscriptionData - Subscription information
     * @returns {Promise<Object>} Checkout session
     */
    async createSubscriptionCheckout(subscriptionData) {
        try {
            this.#securityValidator.validateSubscriptionData(subscriptionData);
            
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.#getAuthToken()}`
                },
                body: JSON.stringify({
                    priceId: subscriptionData.priceId,
                    customerId: subscriptionData.customerId,
                    successUrl: subscriptionData.successUrl || `${window.location.origin}/pages/subscription-success.html`,
                    cancelUrl: subscriptionData.cancelUrl || `${window.location.origin}/pages/subscription-cancelled.html`,
                    metadata: {
                        ...subscriptionData.metadata,
                        source: 'damp_web_app'
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const session = await response.json();
            
            this.#logger.info('Checkout session created', { 
                sessionId: session.id,
                priceId: subscriptionData.priceId 
            });
            
            return session;
            
        } catch (error) {
            this.#errorHandler.handleError('CHECKOUT_SESSION_CREATION_FAILED', error);
            throw this.#normalizeStripeError(error);
        }
    }
    
    /**
     * Redirect to Stripe Checkout
     * @param {string} sessionId - Checkout session ID
     * @returns {Promise<void>}
     */
    async redirectToCheckout(sessionId) {
        try {
            const result = await this.#stripe.redirectToCheckout({
                sessionId: sessionId
            });
            
            if (result.error) {
                throw result.error;
            }
            
        } catch (error) {
            this.#errorHandler.handleError('CHECKOUT_REDIRECT_FAILED', error);
            throw this.#normalizeStripeError(error);
        }
    }
    
    /**
     * Get customer subscription details
     * @param {string} customerId - Stripe customer ID
     * @returns {Promise<Object>} Subscription details
     */
    async getCustomerSubscriptions(customerId) {
        try {
            const response = await fetch(`/api/customer-subscriptions/${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${await this.#getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const subscriptions = await response.json();
            
            return subscriptions;
            
        } catch (error) {
            this.#errorHandler.handleError('SUBSCRIPTION_FETCH_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Cancel subscription
     * @param {string} subscriptionId - Subscription ID
     * @param {Object} options - Cancellation options
     * @returns {Promise<Object>} Cancellation result
     */
    async cancelSubscription(subscriptionId, options = {}) {
        try {
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.#getAuthToken()}`
                },
                body: JSON.stringify({
                    subscriptionId,
                    cancelAtPeriodEnd: options.cancelAtPeriodEnd !== false,
                    reason: options.reason || 'customer_request'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.#logger.info('Subscription cancelled', { 
                subscriptionId,
                cancelAtPeriodEnd: options.cancelAtPeriodEnd 
            });
            
            return result;
            
        } catch (error) {
            this.#errorHandler.handleError('SUBSCRIPTION_CANCELLATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Update subscription
     * @param {string} subscriptionId - Subscription ID
     * @param {Object} updates - Subscription updates
     * @returns {Promise<Object>} Updated subscription
     */
    async updateSubscription(subscriptionId, updates) {
        try {
            const response = await fetch('/api/update-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.#getAuthToken()}`
                },
                body: JSON.stringify({
                    subscriptionId,
                    updates
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.#logger.info('Subscription updated', { subscriptionId });
            
            return result;
            
        } catch (error) {
            this.#errorHandler.handleError('SUBSCRIPTION_UPDATE_FAILED', error);
            throw error;
        }
    }
    
    /**
     * UI Element Creation Methods
     */
    
    /**
     * Create card element
     * @param {Object} options - Element options
     * @returns {Object} Card element
     */
    createCardElement(options = {}) {
        const defaultOptions = {
            style: this.#getCardElementStyle(),
            hidePostalCode: false,
            iconStyle: 'default',
            ...options
        };
        
        return this.#elements.create('card', defaultOptions);
    }
    
    /**
     * Create payment element (unified payment UI)
     * @param {Object} options - Element options
     * @returns {Object} Payment element
     */
    createPaymentElement(options = {}) {
        const defaultOptions = {
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            ...options
        };
        
        return this.#elements.create('payment', defaultOptions);
    }
    
    /**
     * Create address element
     * @param {Object} options - Element options
     * @returns {Object} Address element
     */
    createAddressElement(options = {}) {
        const defaultOptions = {
            mode: 'billing',
            allowedCountries: ['US', 'CA'],
            ...options
        };
        
        return this.#elements.create('address', defaultOptions);
    }
    
    /**
     * Webhook Processing Methods
     */
    
    /**
     * Verify webhook signature
     * @param {string} payload - Webhook payload
     * @param {string} signature - Webhook signature
     * @param {string} secret - Webhook secret
     * @returns {Object} Verified event
     */
    verifyWebhookSignature(payload, signature, secret) {
        try {
            // Note: This should be done on your backend for security
            // This is just for reference
            return this.#stripe.webhooks.constructEvent(payload, signature, secret);
            
        } catch (error) {
            this.#errorHandler.handleError('WEBHOOK_VERIFICATION_FAILED', error);
            throw error;
        }
    }
    
    /**
     * Utility Methods
     */
    
    /**
     * Format amount for display
     * @param {number} amount - Amount in cents
     * @param {string} currency - Currency code
     * @returns {string} Formatted amount
     */
    formatAmount(amount, currency = 'usd') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2
        }).format(amount / 100);
    }
    
    /**
     * Get payment method display name
     * @param {Object} paymentMethod - Stripe payment method
     * @returns {string} Display name
     */
    getPaymentMethodDisplayName(paymentMethod) {
        switch (paymentMethod.type) {
            case 'card':
                return `•••• •••• •••• ${paymentMethod.card.last4}`;
            case 'sepa_debit':
                return `•••• •••• •••• ${paymentMethod.sepa_debit.last4}`;
            case 'us_bank_account':
                return `•••• •••• •••• ${paymentMethod.us_bank_account.last4}`;
            default:
                return paymentMethod.type.replace('_', ' ').toUpperCase();
        }
    }
    
    // Private methods
    
    /**
     * @private
     */
    #validateConfig(config) {
        if (!config.publishableKey) {
            throw new Error('Missing required Stripe publishable key');
        }
        
        if (!config.publishableKey.startsWith('pk_')) {
            throw new Error('Invalid Stripe publishable key format');
        }
        
        return config;
    }
    
    /**
     * @private
     */
    async #getAuthToken() {
        // Get Firebase ID token for backend authentication
        if (window.firebaseAuth?.currentUser) {
            return await window.firebaseAuth.currentUser.getIdToken();
        }
        throw new Error('User not authenticated');
    }
    
    /**
     * @private
     */
    #getElementsAppearance() {
        return {
            theme: 'stripe',
            variables: {
                colorPrimary: '#00d4ff',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px'
            },
            rules: {
                '.Tab': {
                    padding: '12px 16px',
                    backgroundColor: '#f6f8fa'
                },
                '.Tab:hover': {
                    backgroundColor: '#e1e7ec'
                },
                '.Tab--selected': {
                    backgroundColor: '#00d4ff',
                    color: '#ffffff'
                }
            }
        };
    }
    
    /**
     * @private
     */
    #getCardElementStyle() {
        return {
            base: {
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#30313d',
                backgroundColor: '#ffffff',
                '::placeholder': {
                    color: '#8898aa'
                },
                iconColor: '#00d4ff'
            },
            invalid: {
                color: '#df1b41',
                iconColor: '#df1b41'
            },
            complete: {
                color: '#00d4ff',
                iconColor: '#00d4ff'
            }
        };
    }
    
    /**
     * @private
     */
    #normalizeStripeError(error) {
        const errorMap = {
            'card_declined': 'Your card was declined. Please try a different payment method.',
            'expired_card': 'Your card has expired. Please use a different card.',
            'incorrect_cvc': 'Your card\'s security code is incorrect.',
            'processing_error': 'An error occurred while processing your card.',
            'incorrect_number': 'Your card number is incorrect.',
            'invalid_expiry_month': 'Your card\'s expiration month is invalid.',
            'invalid_expiry_year': 'Your card\'s expiration year is invalid.',
            'invalid_cvc': 'Your card\'s security code is invalid.',
            'insufficient_funds': 'Your card has insufficient funds.',
            'withdrawal_count_limit_exceeded': 'You have exceeded the balance or credit limit on your card.',
            'charge_exceeds_source_limit': 'The payment exceeds the maximum amount for your card.',
            'instant_payouts_unsupported': 'Your debit card is not supported for instant payouts.',
            'duplicate_transaction': 'A payment with identical amount and details was recently submitted.',
            'fraudulent': 'The payment has been declined as it appears to be fraudulent.',
            'generic_decline': 'Your card was declined for an unknown reason.',
            'invalid_account': 'The account number provided is invalid.',
            'lost_card': 'The payment has been declined because the card is reported lost.',
            'merchant_blacklist': 'The payment has been declined by your bank.',
            'new_account_information_available': 'The card has been declined for an unknown reason.',
            'no_action_taken': 'The bank did not return any information about the payment.',
            'not_permitted': 'The payment is not permitted by your bank.',
            'pickup_card': 'The bank requests that the card be retained.',
            'restricted_card': 'The bank has restricted the card.',
            'revoked_authorization': 'The payment has been declined by your bank.',
            'security_violation': 'The bank has declined the payment due to a security issue.',
            'service_not_allowed': 'The bank has declined the payment.',
            'stolen_card': 'The payment has been declined because the card is reported stolen.',
            'stop_payment_order': 'The bank has declined the payment due to a stop payment order.',
            'testmode_decline': 'A Stripe-generated decline for testing purposes.',
            'transaction_not_allowed': 'The bank has declined the payment.',
            'try_again_later': 'The bank could not process the payment. Please try again later.',
            'withdrawal_count_limit_exceeded': 'The customer has exceeded the balance or credit limit available on their card.'
        };
        
        let message = error.message;
        
        if (error.decline_code && errorMap[error.decline_code]) {
            message = errorMap[error.decline_code];
        } else if (error.code && errorMap[error.code]) {
            message = errorMap[error.code];
        }
        
        return {
            code: error.code || error.type,
            message,
            decline_code: error.decline_code,
            originalError: error
        };
    }
    
    /**
     * Public getters
     */
    get initialized() {
        return this.#initialized;
    }
    
    get stripe() {
        return this.#stripe;
    }
    
    get elements() {
        return this.#elements;
    }
}

export default StripeModule; 