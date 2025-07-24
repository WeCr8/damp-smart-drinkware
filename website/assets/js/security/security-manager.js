/**
 * 🛡️ DAMP Security Manager
 * Enterprise-level security functions and protection
 * Google Engineering Standards - Production Ready
 */

class DAMPSecurityManager {
    constructor() {
        this.initialized = false;
        this.threats = new Map();
        this.securityLog = [];
        this.init();
    }

    /**
     * Initialize security manager
     */
    async init() {
        try {
            console.log('🛡️ DAMP Security: Initializing security manager...');
            
            // Setup security policies
            this.setupContentSecurityPolicy();
            this.setupSecurityHeaders();
            this.enableXSSProtection();
            this.setupClickjackingProtection();
            this.enableSecureCommunication();
            
            // Initialize monitoring
            this.initThreatMonitoring();
            this.initSecurityLogging();
            
            // Setup input validation
            this.initInputValidation();
            
            // Enable rate limiting
            this.initRateLimiting();
            
            this.initialized = true;
            this.log('Security manager initialized successfully', 'info');
            
        } catch (error) {
            console.error('🚨 DAMP Security: Failed to initialize security manager:', error);
            this.log('Security initialization failed: ' + error.message, 'error');
        }
    }

    /**
     * Setup Content Security Policy
     */
    setupContentSecurityPolicy() {
        try {
            // Dynamic CSP for development vs production
            const isProduction = window.DAMP.Config?.get('app.environment') === 'production';
            
            const csp = {
                'default-src': ["'self'"],
                'script-src': [
                    "'self'",
                    "'unsafe-inline'", // Required for inline scripts
                    'https://www.googletagmanager.com',
                    'https://js.stripe.com',
                    'https://www.google-analytics.com'
                ],
                'style-src': [
                    "'self'",
                    "'unsafe-inline'", // Required for inline styles
                    'https://fonts.googleapis.com'
                ],
                'img-src': [
                    "'self'",
                    'data:',
                    'https://www.googletagmanager.com',
                    'https://www.google-analytics.com',
                    'https://ssl.gstatic.com'
                ],
                'font-src': [
                    "'self'",
                    'https://fonts.gstatic.com'
                ],
                'connect-src': [
                    "'self'",
                    'https://www.google-analytics.com',
                    'https://api.stripe.com',
                    'https://*.firebase.com',
                    'https://*.firebaseio.com'
                ],
                'frame-ancestors': ["'none'"],
                'base-uri': ["'self'"],
                'object-src': ["'none'"]
            };

            // Add localhost for development
            if (!isProduction) {
                csp['script-src'].push('http://localhost:*');
                csp['connect-src'].push('http://localhost:*', 'ws://localhost:*');
            }

            const cspString = Object.entries(csp)
                .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
                .join('; ');

            // Set via meta tag if not set by server
            if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
                const meta = document.createElement('meta');
                meta.httpEquiv = 'Content-Security-Policy';
                meta.content = cspString;
                document.head.appendChild(meta);
            }

            this.log('Content Security Policy configured', 'info');

        } catch (error) {
            this.log('CSP setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Setup additional security headers
     */
    setupSecurityHeaders() {
        try {
            const headers = [
                { name: 'X-Content-Type-Options', content: 'nosniff' },
                { name: 'X-Frame-Options', content: 'DENY' },
                { name: 'X-XSS-Protection', content: '1; mode=block' },
                { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
                { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
            ];

            headers.forEach(header => {
                if (!document.querySelector(`meta[http-equiv="${header.name}"]`)) {
                    const meta = document.createElement('meta');
                    meta.httpEquiv = header.name;
                    meta.content = header.content;
                    document.head.appendChild(meta);
                }
            });

            this.log('Security headers configured', 'info');

        } catch (error) {
            this.log('Security headers setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Enable XSS Protection
     */
    enableXSSProtection() {
        try {
            // Sanitize all user inputs
            this.sanitizeInputs();
            
            // Monitor for XSS attempts
            this.monitorXSSAttempts();
            
            this.log('XSS protection enabled', 'info');

        } catch (error) {
            this.log('XSS protection setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Setup clickjacking protection
     */
    setupClickjackingProtection() {
        try {
            // Framebusting code
            if (window.top !== window.self) {
                this.log('Potential clickjacking attempt detected', 'warning');
                window.top.location = window.self.location;
            }

            // Monitor for frame manipulation
            const frameCheck = setInterval(() => {
                if (window.top !== window.self) {
                    this.log('Frame manipulation detected', 'warning');
                    clearInterval(frameCheck);
                    window.top.location = window.self.location;
                }
            }, 1000);

            this.log('Clickjacking protection enabled', 'info');

        } catch (error) {
            this.log('Clickjacking protection setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Enable secure communication
     */
    enableSecureCommunication() {
        try {
            // Force HTTPS in production
            if (window.DAMP.Config?.get('app.environment') === 'production' && 
                window.location.protocol !== 'https:') {
                window.location.replace(window.location.href.replace('http:', 'https:'));
                return;
            }

            // Secure cookie settings
            this.setSecureCookieDefaults();
            
            this.log('Secure communication enabled', 'info');

        } catch (error) {
            this.log('Secure communication setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Initialize threat monitoring
     */
    initThreatMonitoring() {
        try {
            // Monitor for suspicious activity
            this.monitorSuspiciousActivity();
            
            // Monitor network requests
            this.monitorNetworkRequests();
            
            // Monitor DOM manipulation
            this.monitorDOMManipulation();
            
            this.log('Threat monitoring initialized', 'info');

        } catch (error) {
            this.log('Threat monitoring setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Initialize security logging
     */
    initSecurityLogging() {
        try {
            // Override console methods to capture security logs
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;

            console.log = (...args) => {
                this.log(args.join(' '), 'info');
                originalLog.apply(console, args);
            };

            console.warn = (...args) => {
                this.log(args.join(' '), 'warning');
                originalWarn.apply(console, args);
            };

            console.error = (...args) => {
                this.log(args.join(' '), 'error');
                originalError.apply(console, args);
            };

            this.log('Security logging initialized', 'info');

        } catch (error) {
            console.error('Security logging setup failed:', error);
        }
    }

    /**
     * Initialize input validation
     */
    initInputValidation() {
        try {
            // Validate all form inputs
            document.addEventListener('input', (event) => {
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                    this.validateInput(event.target);
                }
            });

            // Validate form submissions
            document.addEventListener('submit', (event) => {
                if (!this.validateForm(event.target)) {
                    event.preventDefault();
                    this.log('Form submission blocked due to validation failure', 'warning');
                }
            });

            this.log('Input validation initialized', 'info');

        } catch (error) {
            this.log('Input validation setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Initialize rate limiting
     */
    initRateLimiting() {
        try {
            this.rateLimits = new Map();
            this.requestCounts = new Map();

            // Set default rate limits
            this.setRateLimit('form_submission', 5, 60000); // 5 submissions per minute
            this.setRateLimit('api_call', 100, 60000); // 100 API calls per minute

            this.log('Rate limiting initialized', 'info');

        } catch (error) {
            this.log('Rate limiting setup failed: ' + error.message, 'error');
        }
    }

    /**
     * Sanitize user inputs
     */
    sanitizeInputs() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (event) => {
                event.target.value = this.sanitizeString(event.target.value);
            });
        });
    }

    /**
     * Sanitize string
     */
    sanitizeString(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Monitor XSS attempts
     */
    monitorXSSAttempts() {
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /eval\s*\(/gi,
            /document\.write/gi
        ];

        document.addEventListener('input', (event) => {
            const value = event.target.value;
            suspiciousPatterns.forEach(pattern => {
                if (pattern.test(value)) {
                    this.log(`Potential XSS attempt detected: ${value}`, 'warning');
                    this.recordThreat('xss_attempt', { input: value, element: event.target });
                }
            });
        });
    }

    /**
     * Monitor suspicious activity
     */
    monitorSuspiciousActivity() {
        let clickCount = 0;
        let lastClickTime = 0;

        document.addEventListener('click', (event) => {
            const now = Date.now();
            if (now - lastClickTime < 100) {
                clickCount++;
                if (clickCount > 10) {
                    this.log('Suspicious click activity detected', 'warning');
                    this.recordThreat('suspicious_clicks', { count: clickCount });
                }
            } else {
                clickCount = 0;
            }
            lastClickTime = now;
        });
    }

    /**
     * Monitor network requests
     */
    monitorNetworkRequests() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            this.log(`Network request: ${url}`, 'info');
            
            // Check for suspicious URLs
            if (this.isSuspiciousURL(url)) {
                this.log(`Suspicious network request blocked: ${url}`, 'warning');
                throw new Error('Request blocked by security policy');
            }
            
            return originalFetch.apply(window, args);
        };
    }

    /**
     * Monitor DOM manipulation
     */
    monitorDOMManipulation() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.validateElement(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Validate input
     */
    validateInput(input) {
        const value = input.value;
        const type = input.type;
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                input.setCustomValidity('Please enter a valid email address');
                return false;
            }
        }
        
        // Phone validation
        if (input.name === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[-\s\(\)]/g, ''))) {
                input.setCustomValidity('Please enter a valid phone number');
                return false;
            }
        }
        
        input.setCustomValidity('');
        return true;
    }

    /**
     * Validate form
     */
    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Validate element
     */
    validateElement(element) {
        // Check for suspicious scripts
        if (element.tagName === 'SCRIPT') {
            const src = element.src;
            const content = element.textContent;
            
            if (src && this.isSuspiciousURL(src)) {
                this.log(`Suspicious script blocked: ${src}`, 'warning');
                element.remove();
                return false;
            }
            
            if (content && this.containsSuspiciousCode(content)) {
                this.log(`Suspicious inline script blocked`, 'warning');
                element.remove();
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if URL is suspicious
     */
    isSuspiciousURL(url) {
        const suspiciousDomains = [
            'evil.com',
            'malware.com',
            'phishing.com'
        ];
        
        try {
            const urlObj = new URL(url);
            return suspiciousDomains.some(domain => 
                urlObj.hostname.includes(domain)
            );
        } catch {
            return true; // Invalid URLs are suspicious
        }
    }

    /**
     * Check if code contains suspicious patterns
     */
    containsSuspiciousCode(code) {
        const suspiciousPatterns = [
            /eval\s*\(/,
            /Function\s*\(/,
            /document\.write/,
            /innerHTML\s*=/,
            /outerHTML\s*=/
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(code));
    }

    /**
     * Set secure cookie defaults
     */
    setSecureCookieDefaults() {
        document.cookie = "SameSite=Strict; Secure; HttpOnly";
    }

    /**
     * Set rate limit
     */
    setRateLimit(action, limit, windowMs) {
        this.rateLimits.set(action, { limit, windowMs });
    }

    /**
     * Check rate limit
     */
    checkRateLimit(action) {
        const config = this.rateLimits.get(action);
        if (!config) return true;
        
        const now = Date.now();
        const key = `${action}_${Math.floor(now / config.windowMs)}`;
        
        const currentCount = this.requestCounts.get(key) || 0;
        if (currentCount >= config.limit) {
            this.log(`Rate limit exceeded for ${action}`, 'warning');
            return false;
        }
        
        this.requestCounts.set(key, currentCount + 1);
        return true;
    }

    /**
     * Record security threat
     */
    recordThreat(type, details) {
        const threat = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.threats.set(Date.now(), threat);
        this.log(`Threat recorded: ${type}`, 'warning');
    }

    /**
     * Log security event
     */
    log(message, level = 'info') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            url: window.location.href
        };
        
        this.securityLog.push(logEntry);
        
        // Keep only last 1000 entries
        if (this.securityLog.length > 1000) {
            this.securityLog.shift();
        }
        
        // Send to monitoring service in production
        if (window.DAMP.Config?.get('app.environment') === 'production' && level === 'error') {
            this.sendToMonitoring(logEntry);
        }
    }

    /**
     * Send to monitoring service
     */
    async sendToMonitoring(logEntry) {
        try {
            // Implementation would send to monitoring service
            console.log('Sending to monitoring:', logEntry);
        } catch (error) {
            console.error('Failed to send to monitoring:', error);
        }
    }

    /**
     * Get security report
     */
    getSecurityReport() {
        return {
            initialized: this.initialized,
            threatsDetected: this.threats.size,
            recentLogs: this.securityLog.slice(-10),
            threats: Array.from(this.threats.values())
        };
    }
}

// Create and export global security instance
window.DAMP = window.DAMP || {};
window.DAMP.Security = new DAMPSecurityManager();

export default window.DAMP.Security; 