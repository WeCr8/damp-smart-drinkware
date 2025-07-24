/**
 * Professional Security Validator Utility
 * Google Engineering Standards Implementation
 * Comprehensive Security Validation & Protection
 * 
 * @fileoverview Security validator utility for input validation and security checks
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { Logger } from './logger.js';

/**
 * Validation Result
 */
export class ValidationResult {
    constructor(isValid, errors = [], warnings = []) {
        this.isValid = isValid;
        this.errors = errors;
        this.warnings = warnings;
    }
    
    /**
     * Add error to result
     * @param {string} message - Error message
     * @param {string} field - Field name
     */
    addError(message, field = null) {
        this.errors.push({ message, field, timestamp: Date.now() });
        this.isValid = false;
    }
    
    /**
     * Add warning to result
     * @param {string} message - Warning message
     * @param {string} field - Field name
     */
    addWarning(message, field = null) {
        this.warnings.push({ message, field, timestamp: Date.now() });
    }
}

/**
 * Professional Security Validator Class
 * Provides comprehensive security validation and protection
 */
export class SecurityValidator {
    #logger = null;
    #config = {};
    #rateLimits = new Map();
    #blockedIPs = new Set();
    #suspiciousPatterns = [];
    #validationHistory = [];
    
    /**
     * Create a new security validator instance
     * @param {Object} config - Security configuration
     */
    constructor(config = {}) {
        this.#logger = new Logger('SecurityValidator');
        this.#config = {
            maxStringLength: config.maxStringLength || 10000,
            maxObjectDepth: config.maxObjectDepth || 10,
            allowedDomains: config.allowedDomains || [],
            blockedPatterns: config.blockedPatterns || [],
            rateLimitWindow: config.rateLimitWindow || 60000, // 1 minute
            rateLimitRequests: config.rateLimitRequests || 100,
            enableCSPValidation: config.enableCSPValidation !== false,
            enableXSSProtection: config.enableXSSProtection !== false,
            enableSQLInjectionProtection: config.enableSQLInjectionProtection !== false,
            ...config
        };
        
        this.#initializeSuspiciousPatterns();
    }
    
    /**
     * Email Validation
     */
    
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {ValidationResult} Validation result
     */
    validateEmail(email) {
        const result = new ValidationResult(true);
        
        if (!email || typeof email !== 'string') {
            result.addError('Email is required and must be a string', 'email');
            return result;
        }
        
        // Length check
        if (email.length > 254) {
            result.addError('Email address is too long', 'email');
        }
        
        // Basic format validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(email)) {
            result.addError('Please enter a valid email address', 'email');
        }
        
        // Check for suspicious patterns
        if (this.#containsSuspiciousPatterns(email)) {
            result.addError('Email contains invalid characters', 'email');
        }
        
        // Domain validation
        const domain = email.split('@')[1];
        if (domain && !this.#isValidDomain(domain)) {
            result.addError('Email domain is not valid', 'email');
        }
        
        // Disposable email check
        if (this.#isDisposableEmail(domain)) {
            result.addWarning('Disposable email addresses may not receive important notifications', 'email');
        }
        
        this.#logValidation('email', result);
        return result;
    }
    
    /**
     * Password Validation
     */
    
    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @param {Object} options - Validation options
     * @returns {ValidationResult} Validation result
     */
    validatePassword(password, options = {}) {
        const result = new ValidationResult(true);
        
        const config = {
            minLength: options.minLength || 8,
            maxLength: options.maxLength || 128,
            requireUppercase: options.requireUppercase !== false,
            requireLowercase: options.requireLowercase !== false,
            requireNumbers: options.requireNumbers !== false,
            requireSpecialChars: options.requireSpecialChars !== false,
            preventCommon: options.preventCommon !== false,
            preventPersonalInfo: options.preventPersonalInfo !== false,
            ...options
        };
        
        if (!password || typeof password !== 'string') {
            result.addError('Password is required and must be a string', 'password');
            return result;
        }
        
        // Length validation
        if (password.length < config.minLength) {
            result.addError(`Password must be at least ${config.minLength} characters long`, 'password');
        }
        
        if (password.length > config.maxLength) {
            result.addError(`Password must not exceed ${config.maxLength} characters`, 'password');
        }
        
        // Character requirements
        if (config.requireUppercase && !/[A-Z]/.test(password)) {
            result.addError('Password must contain at least one uppercase letter', 'password');
        }
        
        if (config.requireLowercase && !/[a-z]/.test(password)) {
            result.addError('Password must contain at least one lowercase letter', 'password');
        }
        
        if (config.requireNumbers && !/\d/.test(password)) {
            result.addError('Password must contain at least one number', 'password');
        }
        
        if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            result.addError('Password must contain at least one special character', 'password');
        }
        
        // Common password check
        if (config.preventCommon && this.#isCommonPassword(password)) {
            result.addError('This password is too common. Please choose a more unique password', 'password');
        }
        
        // Repeated characters check
        if (this.#hasRepeatedChars(password)) {
            result.addWarning('Password contains repeated characters', 'password');
        }
        
        // Sequential characters check
        if (this.#hasSequentialChars(password)) {
            result.addWarning('Password contains sequential characters', 'password');
        }
        
        this.#logValidation('password', result);
        return result;
    }
    
    /**
     * Input Sanitization & Validation
     */
    
    /**
     * Sanitize and validate user input
     * @param {*} input - Input to validate
     * @param {Object} schema - Validation schema
     * @returns {ValidationResult} Validation result
     */
    validateInput(input, schema) {
        const result = new ValidationResult(true);
        
        try {
            this.#validateInputRecursive(input, schema, result, '', 0);
        } catch (error) {
            result.addError(`Validation error: ${error.message}`);
        }
        
        this.#logValidation('input', result);
        return result;
    }
    
    /**
     * Sanitize string input
     * @param {string} input - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove null bytes
        let sanitized = input.replace(/\0/g, '');
        
        // Limit length
        if (sanitized.length > this.#config.maxStringLength) {
            sanitized = sanitized.substring(0, this.#config.maxStringLength);
        }
        
        // Remove control characters (except newlines and tabs)
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        return sanitized;
    }
    
    /**
     * XSS Protection
     */
    
    /**
     * Validate input against XSS attacks
     * @param {string} input - Input to validate
     * @returns {ValidationResult} Validation result
     */
    validateXSS(input) {
        const result = new ValidationResult(true);
        
        if (!this.#config.enableXSSProtection) {
            return result;
        }
        
        if (typeof input !== 'string') {
            return result;
        }
        
        // Check for script tags
        if (/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(input)) {
            result.addError('Input contains potentially malicious script tags', 'xss');
        }
        
        // Check for event handlers
        if (/on\w+\s*=\s*["'][^"']*["']/gi.test(input)) {
            result.addError('Input contains potentially malicious event handlers', 'xss');
        }
        
        // Check for javascript: protocol
        if (/javascript\s*:/gi.test(input)) {
            result.addError('Input contains potentially malicious JavaScript protocol', 'xss');
        }
        
        // Check for data: protocol with base64
        if (/data:.*base64/gi.test(input)) {
            result.addWarning('Input contains base64 data URLs', 'xss');
        }
        
        // Check for iframe tags
        if (/<iframe[\s\S]*?>/gi.test(input)) {
            result.addError('Input contains potentially malicious iframe tags', 'xss');
        }
        
        this.#logValidation('xss', result);
        return result;
    }
    
    /**
     * SQL Injection Protection
     */
    
    /**
     * Validate input against SQL injection attacks
     * @param {string} input - Input to validate
     * @returns {ValidationResult} Validation result
     */
    validateSQLInjection(input) {
        const result = new ValidationResult(true);
        
        if (!this.#config.enableSQLInjectionProtection) {
            return result;
        }
        
        if (typeof input !== 'string') {
            return result;
        }
        
        const sqlPatterns = [
            /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|declare)\b)/gi,
            /(--|#|\/\*|\*\/)/g,
            /('|(\\')|(;))/g,
            /(\b(or|and)\b.*=.*)/gi
        ];
        
        for (const pattern of sqlPatterns) {
            if (pattern.test(input)) {
                result.addError('Input contains potentially malicious SQL patterns', 'sql_injection');
                break;
            }
        }
        
        this.#logValidation('sql_injection', result);
        return result;
    }
    
    /**
     * Rate Limiting & Abuse Protection
     */
    
    /**
     * Check rate limits for a client
     * @param {string} clientId - Client identifier
     * @param {string} action - Action being performed
     * @returns {boolean} Whether request is allowed
     */
    checkRateLimit(clientId, action = 'default') {
        const key = `${clientId}:${action}`;
        const now = Date.now();
        const window = this.#config.rateLimitWindow;
        
        if (!this.#rateLimits.has(key)) {
            this.#rateLimits.set(key, { count: 1, firstRequest: now });
            return true;
        }
        
        const limit = this.#rateLimits.get(key);
        
        // Reset if window has passed
        if (now - limit.firstRequest > window) {
            limit.count = 1;
            limit.firstRequest = now;
            return true;
        }
        
        // Check if limit exceeded
        if (limit.count >= this.#config.rateLimitRequests) {
            this.#logger.warn('Rate limit exceeded', { clientId, action, count: limit.count });
            return false;
        }
        
        limit.count++;
        return true;
    }
    
    /**
     * Payment & Financial Data Validation
     */
    
    /**
     * Validate payment data
     * @param {Object} paymentData - Payment data to validate
     * @returns {ValidationResult} Validation result
     */
    validatePaymentData(paymentData) {
        const result = new ValidationResult(true);
        
        if (!paymentData || typeof paymentData !== 'object') {
            result.addError('Payment data is required and must be an object', 'payment');
            return result;
        }
        
        // Amount validation
        if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
            result.addError('Payment amount must be a positive number', 'amount');
        }
        
        if (paymentData.amount > 999999) { // $9,999.99 limit
            result.addError('Payment amount exceeds maximum allowed', 'amount');
        }
        
        // Currency validation
        if (paymentData.currency && typeof paymentData.currency === 'string') {
            if (!/^[A-Z]{3}$/.test(paymentData.currency)) {
                result.addError('Currency must be a valid 3-letter ISO code', 'currency');
            }
        }
        
        // Metadata validation
        if (paymentData.metadata && typeof paymentData.metadata === 'object') {
            if (JSON.stringify(paymentData.metadata).length > 2000) {
                result.addError('Payment metadata is too large', 'metadata');
            }
        }
        
        this.#logValidation('payment', result);
        return result;
    }
    
    /**
     * Validate subscription data
     * @param {Object} subscriptionData - Subscription data to validate
     * @returns {ValidationResult} Validation result
     */
    validateSubscriptionData(subscriptionData) {
        const result = new ValidationResult(true);
        
        if (!subscriptionData || typeof subscriptionData !== 'object') {
            result.addError('Subscription data is required and must be an object', 'subscription');
            return result;
        }
        
        // Price ID validation
        if (!subscriptionData.priceId || typeof subscriptionData.priceId !== 'string') {
            result.addError('Price ID is required and must be a string', 'priceId');
        } else if (!subscriptionData.priceId.startsWith('price_')) {
            result.addError('Price ID must be a valid Stripe price ID', 'priceId');
        }
        
        // URLs validation
        if (subscriptionData.successUrl && !this.#isValidURL(subscriptionData.successUrl)) {
            result.addError('Success URL is not valid', 'successUrl');
        }
        
        if (subscriptionData.cancelUrl && !this.#isValidURL(subscriptionData.cancelUrl)) {
            result.addError('Cancel URL is not valid', 'cancelUrl');
        }
        
        this.#logValidation('subscription', result);
        return result;
    }
    
    /**
     * Generic Validation Methods
     */
    
    /**
     * Validate client secret
     * @param {string} clientSecret - Client secret to validate
     * @returns {ValidationResult} Validation result
     */
    validateClientSecret(clientSecret) {
        const result = new ValidationResult(true);
        
        if (!clientSecret || typeof clientSecret !== 'string') {
            result.addError('Client secret is required and must be a string', 'clientSecret');
            return result;
        }
        
        // Check format (Stripe client secrets have specific format)
        if (!clientSecret.includes('_secret_')) {
            result.addError('Client secret format is invalid', 'clientSecret');
        }
        
        this.#logValidation('client_secret', result);
        return result;
    }
    
    /**
     * Validate action object
     * @param {Object} action - Action to validate
     * @returns {ValidationResult} Validation result
     */
    validateAction(action) {
        const result = new ValidationResult(true);
        
        if (!action || typeof action !== 'object') {
            result.addError('Action is required and must be an object', 'action');
            return result;
        }
        
        if (!action.type || typeof action.type !== 'string') {
            result.addError('Action type is required and must be a string', 'type');
        }
        
        // Validate action type format
        if (action.type && !/^[A-Z_]+$/.test(action.type)) {
            result.addError('Action type must be uppercase with underscores', 'type');
        }
        
        this.#logValidation('action', result);
        return result;
    }
    
    /**
     * Validate state access
     * @param {string} key - State key to validate
     * @returns {ValidationResult} Validation result
     */
    validateStateAccess(key) {
        const result = new ValidationResult(true);
        
        if (!key || typeof key !== 'string') {
            result.addError('State key is required and must be a string', 'key');
            return result;
        }
        
        // Check for path traversal attempts
        if (key.includes('..') || key.includes('//')) {
            result.addError('State key contains invalid path characters', 'key');
        }
        
        // Check for excessive nesting
        if ((key.match(/\//g) || []).length > 5) {
            result.addError('State key nesting is too deep', 'key');
        }
        
        this.#logValidation('state_access', result);
        return result;
    }
    
    /**
     * Validate state update
     * @param {string} key - State key
     * @param {*} value - State value
     * @returns {ValidationResult} Validation result
     */
    validateStateUpdate(key, value) {
        const result = new ValidationResult(true);
        
        // Validate key
        const keyValidation = this.validateStateAccess(key);
        if (!keyValidation.isValid) {
            result.errors.push(...keyValidation.errors);
        }
        
        // Validate value
        if (value !== null && value !== undefined) {
            const valueSize = this.#getObjectSize(value);
            if (valueSize > 1000000) { // 1MB limit
                result.addError('State value is too large', 'value');
            }
            
            const depth = this.#getObjectDepth(value);
            if (depth > this.#config.maxObjectDepth) {
                result.addError('State value nesting is too deep', 'value');
            }
        }
        
        this.#logValidation('state_update', result);
        return result;
    }
    
    /**
     * Validate operation
     * @param {string} type - Operation type
     * @param {*} data - Operation data
     * @returns {ValidationResult} Validation result
     */
    validateOperation(type, data) {
        const result = new ValidationResult(true);
        
        if (!type || typeof type !== 'string') {
            result.addError('Operation type is required and must be a string', 'type');
        }
        
        // Check for suspicious operation patterns
        if (this.#containsSuspiciousPatterns(type)) {
            result.addError('Operation type contains suspicious patterns', 'type');
        }
        
        this.#logValidation('operation', result);
        return result;
    }
    
    // Private methods
    
    /**
     * @private
     */
    #validateInputRecursive(input, schema, result, path, depth) {
        if (depth > this.#config.maxObjectDepth) {
            result.addError(`Object nesting too deep at ${path}`);
            return;
        }
        
        if (schema.type) {
            if (typeof input !== schema.type) {
                result.addError(`Expected ${schema.type} at ${path || 'root'}`);
                return;
            }
        }
        
        if (schema.required && (input === null || input === undefined)) {
            result.addError(`Required field missing at ${path || 'root'}`);
            return;
        }
        
        if (typeof input === 'string') {
            if (schema.maxLength && input.length > schema.maxLength) {
                result.addError(`String too long at ${path}. Max: ${schema.maxLength}`);
            }
            
            if (schema.pattern && !schema.pattern.test(input)) {
                result.addError(`String pattern mismatch at ${path}`);
            }
            
            // XSS check for strings
            const xssResult = this.validateXSS(input);
            if (!xssResult.isValid) {
                result.errors.push(...xssResult.errors.map(e => ({
                    ...e,
                    field: path || e.field
                })));
            }
        }
        
        if (typeof input === 'object' && input !== null && schema.properties) {
            for (const [key, subSchema] of Object.entries(schema.properties)) {
                const newPath = path ? `${path}.${key}` : key;
                this.#validateInputRecursive(input[key], subSchema, result, newPath, depth + 1);
            }
        }
    }
    
    /**
     * @private
     */
    #isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain) && domain.length <= 253;
    }
    
    /**
     * @private
     */
    #isDisposableEmail(domain) {
        const disposableDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org'
        ];
        
        return disposableDomains.includes(domain?.toLowerCase());
    }
    
    /**
     * @private
     */
    #isCommonPassword(password) {
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        
        return commonPasswords.includes(password.toLowerCase());
    }
    
    /**
     * @private
     */
    #hasRepeatedChars(password) {
        return /(.)\1{2,}/.test(password);
    }
    
    /**
     * @private
     */
    #hasSequentialChars(password) {
        const sequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
        const lowerPassword = password.toLowerCase();
        
        return sequences.some(seq => lowerPassword.includes(seq));
    }
    
    /**
     * @private
     */
    #isValidURL(url) {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    }
    
    /**
     * @private
     */
    #containsSuspiciousPatterns(input) {
        return this.#suspiciousPatterns.some(pattern => pattern.test(input));
    }
    
    /**
     * @private
     */
    #initializeSuspiciousPatterns() {
        this.#suspiciousPatterns = [
            // Common attack patterns
            /<script/gi,
            /javascript:/gi,
            /data:text\/html/gi,
            /vbscript:/gi,
            /onload\s*=/gi,
            /onerror\s*=/gi,
            // SQL injection patterns
            /union\s+select/gi,
            /drop\s+table/gi,
            /insert\s+into/gi,
            // Path traversal
            /\.\.\//g,
            /\.\.\\/g,
            // Command injection
            /;\s*(rm|del|format|shutdown)/gi
        ];
    }
    
    /**
     * @private
     */
    #getObjectSize(obj) {
        try {
            return JSON.stringify(obj).length;
        } catch {
            return 0;
        }
    }
    
    /**
     * @private
     */
    #getObjectDepth(obj, depth = 0) {
        if (depth > 20) return depth; // Prevent infinite recursion
        
        if (obj === null || typeof obj !== 'object') {
            return depth;
        }
        
        if (Array.isArray(obj)) {
            return Math.max(depth, ...obj.map(item => this.#getObjectDepth(item, depth + 1)));
        }
        
        return Math.max(depth, ...Object.values(obj).map(value => this.#getObjectDepth(value, depth + 1)));
    }
    
    /**
     * @private
     */
    #logValidation(type, result) {
        if (!result.isValid) {
            this.#logger.warn(`Validation failed: ${type}`, {
                errors: result.errors,
                warnings: result.warnings
            });
        }
        
        // Add to history
        this.#validationHistory.push({
            type,
            isValid: result.isValid,
            errorCount: result.errors.length,
            warningCount: result.warnings.length,
            timestamp: Date.now()
        });
        
        // Keep history manageable
        if (this.#validationHistory.length > 1000) {
            this.#validationHistory = this.#validationHistory.slice(-1000);
        }
    }
    
    /**
     * Get validation statistics
     * @returns {Object} Validation statistics
     */
    getValidationStats() {
        const recentValidations = this.#validationHistory.filter(
            v => Date.now() - v.timestamp < 3600000 // Last hour
        );
        
        return {
            total: this.#validationHistory.length,
            lastHour: recentValidations.length,
            failed: this.#validationHistory.filter(v => !v.isValid).length,
            byType: this.#validationHistory.reduce((acc, v) => {
                acc[v.type] = (acc[v.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

/**
 * Create a default security validator instance
 */
export const securityValidator = new SecurityValidator();

/**
 * Create security validator for specific component
 * @param {Object} config - Security configuration
 * @returns {SecurityValidator} Security validator instance
 */
export function createSecurityValidator(config = {}) {
    return new SecurityValidator(config);
}

export default SecurityValidator; 