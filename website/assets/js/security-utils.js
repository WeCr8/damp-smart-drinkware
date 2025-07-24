/**
 * DAMP Security Utilities - Professional Security Implementation
 * Provides secure DOM manipulation and input validation
 */

class DAMPSecurityUtils {
    constructor() {
        this.allowedTags = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'strong', 'em', 'span', 'div',
            'ul', 'ol', 'li', 'a', 'img', 'button'
        ];
        
        this.allowedAttributes = {
            'a': ['href', 'title', 'target', 'rel'],
            'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
            'button': ['type', 'class', 'id', 'disabled'],
            '*': ['class', 'id', 'data-*']
        };
        
        this.trustedDomains = [
            'dampdrink.com',
            'www.dampdrink.com',
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ];
    }

    /**
     * Sanitize HTML content before inserting into DOM
     * @param {string} html - HTML content to sanitize
     * @returns {string} - Sanitized HTML
     */
    sanitizeHTML(html) {
        if (!html || typeof html !== 'string') return '';
        
        // Create a temporary DOM element
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove all script tags
        const scripts = temp.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Remove dangerous attributes
        const allElements = temp.querySelectorAll('*');
        allElements.forEach(element => {
            // Remove dangerous attributes
            const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover', 'javascript:'];
            dangerousAttrs.forEach(attr => {
                if (element.hasAttribute(attr) || element.outerHTML.includes(attr)) {
                    element.removeAttribute(attr);
                }
            });
            
            // Sanitize href attributes
            if (element.tagName === 'A' && element.href) {
                if (element.href.startsWith('javascript:') || element.href.startsWith('data:')) {
                    element.removeAttribute('href');
                }
            }
        });
        
        return temp.innerHTML;
    }

    /**
     * Safely set innerHTML with sanitization
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content
     */
    safeSetInnerHTML(element, html) {
        if (!element || !html) return;
        
        const sanitizedHTML = this.sanitizeHTML(html);
        element.innerHTML = sanitizedHTML;
    }

    /**
     * Validate and sanitize form inputs
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} - Validated data
     */
    validateForm(form) {
        const formData = new FormData(form);
        const validatedData = {};
        
        for (let [key, value] of formData.entries()) {
            // Sanitize input values
            validatedData[key] = this.sanitizeInput(value);
        }
        
        return validatedData;
    }

    /**
     * Sanitize user input
     * @param {string} input - User input
     * @returns {string} - Sanitized input
     */
    sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Validate email address
     * @param {string} email - Email address
     * @returns {boolean} - Valid email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} - Valid URL
     */
    validateURL(url) {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    }

    /**
     * Create secure event listener
     * @param {HTMLElement} element - Element to bind to
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    secureEventListener(element, event, handler) {
        if (!element || !event || typeof handler !== 'function') return;
        
        element.addEventListener(event, (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error('DAMP Security: Event handler error:', error);
            }
        });
    }

    /**
     * Rate limiting for API calls
     * @param {Function} func - Function to rate limit
     * @param {number} limit - Calls per minute
     * @returns {Function} - Rate limited function
     */
    rateLimit(func, limit = 60) {
        const calls = [];
        
        return function(...args) {
            const now = Date.now();
            const recentCalls = calls.filter(time => now - time < 60000);
            
            if (recentCalls.length >= limit) {
                console.warn('DAMP Security: Rate limit exceeded');
                return;
            }
            
            calls.push(now);
            return func.apply(this, args);
        };
    }

    /**
     * Secure local storage operations
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    secureSetItem(key, value) {
        try {
            const sanitizedKey = this.sanitizeInput(key);
            const sanitizedValue = typeof value === 'string' ? 
                this.sanitizeInput(value) : 
                JSON.stringify(value);
            
            localStorage.setItem(sanitizedKey, sanitizedValue);
        } catch (error) {
            console.error('DAMP Security: Storage error:', error);
        }
    }

    /**
     * Secure local storage retrieval
     * @param {string} key - Storage key
     * @returns {any} - Stored value
     */
    secureGetItem(key) {
        try {
            const sanitizedKey = this.sanitizeInput(key);
            const item = localStorage.getItem(sanitizedKey);
            
            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (error) {
            console.error('DAMP Security: Storage retrieval error:', error);
            return null;
        }
    }
}

// Initialize security utils
window.DAMPSecurityUtils = new DAMPSecurityUtils();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPSecurityUtils;
} 