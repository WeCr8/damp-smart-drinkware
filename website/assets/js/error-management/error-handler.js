/**
 * DAMP Enterprise Error Handler
 * Google Engineering Standards Implementation
 * 
 * Features:
 * - Centralized error management
 * - Automatic error recovery
 * - User-friendly error reporting
 * - Performance impact monitoring
 * - Privacy-compliant error tracking
 */

class DAMPErrorHandler {
    constructor(config = {}) {
        this.config = {
            // Core configuration
            enableReporting: window.location.hostname !== 'localhost',
            enableRecovery: true,
            enableUserNotifications: true,
            enableConsoleLogging: true,
            
            // Retry configuration
            maxRetries: 3,
            retryDelay: 1000, // ms
            retryMultiplier: 2,
            
            // Reporting configuration
            reportingEndpoint: '/api/errors',
            sampleRate: 1.0, // 100% sampling
            batchSize: 10,
            flushDelay: 5000, // ms
            
            // User experience
            notificationDuration: 5000, // ms
            maxNotificationsPerSession: 3,
            
            // Privacy and security
            enableStackTrace: true,
            sanitizeUrls: true,
            excludePersonalData: true,
            
            ...config
        };

        // Internal state
        this.errorQueue = [];
        this.retryQueue = new Map();
        this.errorCount = 0;
        this.sessionErrors = new Set();
        this.isOnline = navigator.onLine;
        this.notificationCount = 0;
        
        // Performance tracking
        this.startTime = performance.now();
        this.lastErrorTime = null;
        
        this.init();
    }

    init() {
        this.setupGlobalHandlers();
        this.setupNetworkHandlers();
        this.setupResourceHandlers();
        this.setupPromiseHandlers();
        this.setupVisibilityHandlers();
        this.setupRecoveryMechanisms();
        
        // Start error processing
        this.startErrorProcessor();
        
        if (this.config.enableConsoleLogging) {
            console.log('✅ DAMP Error Handler initialized', {
                reporting: this.config.enableReporting,
                recovery: this.config.enableRecovery,
                userNotifications: this.config.enableUserNotifications
            });
        }
    }

    // === CORE ERROR HANDLING ===

    handleError(error, context = {}, options = {}) {
        try {
            const errorInfo = this.enrichError(error, context);
            
            // Check if this is a duplicate error
            if (this.isDuplicateError(errorInfo)) {
                return;
            }
            
            // Increment error count
            this.errorCount++;
            this.lastErrorTime = Date.now();
            
            // Log error locally
            this.logError(errorInfo);
            
            // Queue for reporting
            if (this.config.enableReporting) {
                this.queueError(errorInfo);
            }
            
            // Attempt automatic recovery
            if (this.config.enableRecovery && !options.skipRecovery) {
                this.attemptRecovery(errorInfo);
            }
            
            // Show user notification
            if (this.config.enableUserNotifications && !options.silent) {
                this.showUserNotification(errorInfo);
            }
            
            // Fire custom event for application-level handling
            this.dispatchErrorEvent(errorInfo);
            
        } catch (handlingError) {
            // Prevent infinite loops in error handler
            console.error('Error in error handler:', handlingError);
        }
    }

    enrichError(error, context = {}) {
        const timestamp = Date.now();
        const url = this.sanitizeUrl(window.location.href);
        
        return {
            // Error details
            message: error.message || 'Unknown error',
            stack: this.config.enableStackTrace ? error.stack : null,
            name: error.name || 'Error',
            
            // Context information
            timestamp,
            url,
            userAgent: navigator.userAgent,
            
            // Application context
            context: {
                section: this.getCurrentSection(),
                action: context.action || 'unknown',
                userId: context.userId || null,
                sessionId: this.getSessionId(),
                ...context
            },
            
            // Technical details
            technical: {
                isOnline: this.isOnline,
                errorCount: this.errorCount,
                timeSinceStart: timestamp - this.startTime,
                timeSinceLastError: this.lastErrorTime ? timestamp - this.lastErrorTime : null,
                performance: this.getPerformanceSnapshot(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            },
            
            // Error fingerprint for deduplication
            fingerprint: this.generateFingerprint(error, context),
            
            // Severity level
            severity: this.calculateSeverity(error, context)
        };
    }

    // === ERROR RECOVERY ===

    attemptRecovery(errorInfo) {
        const recoveryStrategies = [
            () => this.retryFailedRequests(errorInfo),
            () => this.refreshStaleData(errorInfo),
            () => this.restoreFromCache(errorInfo),
            () => this.fallbackToOfflineMode(errorInfo),
            () => this.suggestPageRefresh(errorInfo)
        ];

        for (const strategy of recoveryStrategies) {
            try {
                if (strategy(errorInfo)) {
                    this.logRecovery(errorInfo, strategy.name);
                    break;
                }
            } catch (recoveryError) {
                console.warn('Recovery strategy failed:', strategy.name, recoveryError);
            }
        }
    }

    retryFailedRequests(errorInfo) {
        if (errorInfo.context.type === 'network' && errorInfo.context.url) {
            const retryKey = errorInfo.context.url;
            const currentRetries = this.retryQueue.get(retryKey) || 0;
            
            if (currentRetries < this.config.maxRetries) {
                const delay = this.config.retryDelay * Math.pow(this.config.retryMultiplier, currentRetries);
                
                setTimeout(() => {
                    this.retryQueue.set(retryKey, currentRetries + 1);
                    
                    // Attempt to retry the request
                    if (errorInfo.context.retryCallback) {
                        errorInfo.context.retryCallback();
                    }
                }, delay);
                
                return true;
            }
        }
        return false;
    }

    refreshStaleData(errorInfo) {
        if (errorInfo.context.type === 'data' && errorInfo.context.refreshCallback) {
            try {
                errorInfo.context.refreshCallback();
                return true;
            } catch (refreshError) {
                console.warn('Data refresh failed:', refreshError);
            }
        }
        return false;
    }

    restoreFromCache(errorInfo) {
        if (errorInfo.context.cacheKey && window.localStorage) {
            try {
                const cachedData = localStorage.getItem(errorInfo.context.cacheKey);
                if (cachedData && errorInfo.context.restoreCallback) {
                    errorInfo.context.restoreCallback(JSON.parse(cachedData));
                    return true;
                }
            } catch (cacheError) {
                console.warn('Cache restore failed:', cacheError);
            }
        }
        return false;
    }

    fallbackToOfflineMode(errorInfo) {
        if (errorInfo.context.type === 'network' && !this.isOnline) {
            if (window.DAMP && window.DAMP.OfflineManager) {
                window.DAMP.OfflineManager.enableOfflineMode();
                return true;
            }
        }
        return false;
    }

    suggestPageRefresh(errorInfo) {
        if (errorInfo.severity === 'critical' && this.errorCount > 5) {
            this.showRefreshSuggestion();
            return true;
        }
        return false;
    }

    // === USER NOTIFICATIONS ===

    showUserNotification(errorInfo) {
        if (this.notificationCount >= this.config.maxNotificationsPerSession) {
            return;
        }

        const message = this.getUserFriendlyMessage(errorInfo);
        const notification = this.createNotificationElement(message, errorInfo.severity);
        
        document.body.appendChild(notification);
        this.notificationCount++;
        
        // Auto-dismiss notification
        setTimeout(() => {
            this.dismissNotification(notification);
        }, this.config.notificationDuration);
    }

    getUserFriendlyMessage(errorInfo) {
        const messages = {
            network: 'Connection issue detected. Retrying automatically...',
            data: 'Unable to load data. Please try refreshing the page.',
            script: 'A technical error occurred. Our team has been notified.',
            resource: 'Some content failed to load. Please check your connection.',
            critical: 'A serious error occurred. Please refresh the page or contact support.'
        };
        
        return messages[errorInfo.context.type] || messages.script;
    }

    createNotificationElement(message, severity) {
        const notification = document.createElement('div');
        notification.className = `damp-error-notification damp-error-${severity}`;
        notification.innerHTML = `
            <div class="damp-error-content">
                <span class="damp-error-icon">⚠️</span>
                <span class="damp-error-message">${message}</span>
                <button class="damp-error-dismiss" aria-label="Dismiss">×</button>
            </div>
        `;
        
        // Add dismiss handler
        notification.querySelector('.damp-error-dismiss').addEventListener('click', () => {
            this.dismissNotification(notification);
        });
        
        return notification;
    }

    dismissNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    showRefreshSuggestion() {
        if (confirm('Multiple errors have occurred. Would you like to refresh the page?')) {
            window.location.reload();
        }
    }

    // === ERROR REPORTING ===

    queueError(errorInfo) {
        this.errorQueue.push(errorInfo);
        
        if (this.errorQueue.length >= this.config.batchSize) {
            this.flushErrors();
        }
    }

    startErrorProcessor() {
        setInterval(() => {
            if (this.errorQueue.length > 0) {
                this.flushErrors();
            }
        }, this.config.flushDelay);
    }

    async flushErrors() {
        if (this.errorQueue.length === 0 || !this.isOnline) {
            return;
        }
        
        const errors = this.errorQueue.splice(0, this.config.batchSize);
        
        try {
            await this.sendErrors(errors);
        } catch (reportingError) {
            console.warn('Error reporting failed:', reportingError);
            // Re-queue errors for retry
            this.errorQueue.unshift(...errors);
        }
    }

    async sendErrors(errors) {
        const payload = {
            errors: this.sanitizeErrors(errors),
            metadata: {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: this.sanitizeUrl(window.location.href),
                sessionId: this.getSessionId()
            }
        };
        
        const response = await fetch(this.config.reportingEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Reporting failed: ${response.status}`);
        }
    }

    // === EVENT HANDLING SETUP ===

    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error || new Error(event.message), {
                type: 'script',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                action: 'script_error'
            });
        });
    }

    setupPromiseHandlers() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(
                event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
                {
                    type: 'promise',
                    action: 'unhandled_rejection'
                }
            );
        });
    }

    setupNetworkHandlers() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.flushErrors(); // Flush queued errors when back online
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    setupResourceHandlers() {
        // Monitor failed resource loads
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(new Error(`Resource failed to load: ${event.target.src || event.target.href}`), {
                    type: 'resource',
                    resource: event.target.tagName,
                    src: event.target.src || event.target.href,
                    action: 'resource_error'
                });
            }
        }, true);
    }

    setupVisibilityHandlers() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.errorQueue.length > 0) {
                this.flushErrors(); // Flush errors when user returns to tab
            }
        });
    }

    setupRecoveryMechanisms() {
        // Set up periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // 30 seconds
    }

    // === UTILITY METHODS ===

    isDuplicateError(errorInfo) {
        const isDuplicate = this.sessionErrors.has(errorInfo.fingerprint);
        this.sessionErrors.add(errorInfo.fingerprint);
        return isDuplicate;
    }

    generateFingerprint(error, context) {
        const key = `${error.name}-${error.message}-${context.action || ''}`;
        return btoa(key).substring(0, 16);
    }

    calculateSeverity(error, context) {
        if (context.type === 'network' && !this.isOnline) return 'warning';
        if (context.type === 'resource') return 'warning';
        if (error.name === 'TypeError' || error.name === 'ReferenceError') return 'error';
        if (this.errorCount > 10) return 'critical';
        return 'info';
    }

    getCurrentSection() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        if (path.includes('/products')) return 'products';
        if (path.includes('/about')) return 'about';
        if (path.includes('/cart')) return 'cart';
        return 'unknown';
    }

    getSessionId() {
        if (!window.sessionStorage) return 'no-storage';
        
        let sessionId = sessionStorage.getItem('damp-session-id');
        if (!sessionId) {
            sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('damp-session-id', sessionId);
        }
        return sessionId;
    }

    getPerformanceSnapshot() {
        if (!window.performance) return null;
        
        return {
            navigation: performance.navigation?.type || null,
            timing: {
                loadEventEnd: performance.timing?.loadEventEnd || null,
                domContentLoadedEventEnd: performance.timing?.domContentLoadedEventEnd || null
            },
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            } : null
        };
    }

    sanitizeUrl(url) {
        if (!this.config.sanitizeUrls) return url;
        
        try {
            const urlObj = new URL(url);
            // Remove sensitive query parameters
            const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth'];
            sensitiveParams.forEach(param => urlObj.searchParams.delete(param));
            return urlObj.toString();
        } catch {
            return '[invalid-url]';
        }
    }

    sanitizeErrors(errors) {
        if (!this.config.excludePersonalData) return errors;
        
        return errors.map(error => ({
            ...error,
            message: this.sanitizeMessage(error.message),
            stack: this.sanitizeStack(error.stack),
            context: {
                ...error.context,
                userId: error.context.userId ? '[user-id]' : null
            }
        }));
    }

    sanitizeMessage(message) {
        // Remove potential personal data patterns
        return message
            .replace(/\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, '[email]')
            .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[card-number]')
            .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]');
    }

    sanitizeStack(stack) {
        if (!stack || !this.config.enableStackTrace) return null;
        return stack.split('\n').slice(0, 5).join('\n'); // Limit stack trace length
    }

    performHealthCheck() {
        try {
            // Check if critical functions are available
            if (typeof fetch === 'undefined' || typeof localStorage === 'undefined') {
                this.handleError(new Error('Critical browser features unavailable'), {
                    type: 'environment',
                    action: 'health_check'
                });
            }
        } catch (healthError) {
            this.handleError(healthError, {
                type: 'health_check',
                action: 'health_check_failed'
            });
        }
    }

    logError(errorInfo) {
        if (!this.config.enableConsoleLogging) return;
        
        const style = {
            error: 'color: #ff4757; font-weight: bold;',
            warning: 'color: #ffa502; font-weight: bold;',
            info: 'color: #3742fa; font-weight: bold;'
        };
        
        console.group(`%c🚨 DAMP Error [${errorInfo.severity}]`, style[errorInfo.severity] || style.error);
        console.log('Message:', errorInfo.message);
        console.log('Context:', errorInfo.context);
        console.log('Technical:', errorInfo.technical);
        if (errorInfo.stack && this.config.enableStackTrace) {
            console.log('Stack:', errorInfo.stack);
        }
        console.groupEnd();
    }

    logRecovery(errorInfo, strategyName) {
        if (this.config.enableConsoleLogging) {
            console.log(`%c✅ Recovery successful: ${strategyName}`, 'color: #2ed573; font-weight: bold;');
        }
    }

    dispatchErrorEvent(errorInfo) {
        const event = new CustomEvent('damp:error', {
            detail: errorInfo
        });
        window.dispatchEvent(event);
    }

    // === PUBLIC API ===

    // Manual error reporting
    reportError(error, context = {}) {
        this.handleError(error, context);
    }

    // Silent error reporting (no user notification)
    reportSilentError(error, context = {}) {
        this.handleError(error, context, { silent: true });
    }

    // Get error statistics
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            queuedErrors: this.errorQueue.length,
            notificationsShown: this.notificationCount,
            sessionDuration: Date.now() - this.startTime,
            isOnline: this.isOnline
        };
    }

    // Force flush queued errors
    flush() {
        return this.flushErrors();
    }

    // Disable error handler
    disable() {
        this.config.enableReporting = false;
        this.config.enableRecovery = false;
        this.config.enableUserNotifications = false;
    }
}

// Initialize global error handler
window.DAMP = window.DAMP || {};
window.DAMP.ErrorHandler = new DAMPErrorHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPErrorHandler;
}

// CSS for error notifications (inject into page)
const errorStyles = `
<style id="damp-error-styles">
.damp-error-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    z-index: 10000;
    opacity: 0;
    transform: translateY(-100%);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.damp-error-notification.damp-error-info {
    background: linear-gradient(135deg, #3742fa, #2f3542);
    border-left: 4px solid #3742fa;
}

.damp-error-notification.damp-error-warning {
    background: linear-gradient(135deg, #ffa502, #ff6348);
    border-left: 4px solid #ffa502;
}

.damp-error-notification.damp-error-error {
    background: linear-gradient(135deg, #ff4757, #c44569);
    border-left: 4px solid #ff4757;
}

.damp-error-notification.damp-error-critical {
    background: linear-gradient(135deg, #ff3838, #ff4757);
    border-left: 4px solid #ff3838;
    animation: pulse 1s infinite;
}

.damp-error-content {
    display: flex;
    align-items: center;
    padding: 16px;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.damp-error-icon {
    font-size: 20px;
    margin-right: 12px;
}

.damp-error-message {
    flex: 1;
    font-size: 14px;
    line-height: 1.4;
}

.damp-error-dismiss {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    margin-left: 12px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.damp-error-dismiss:hover {
    opacity: 1;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

/* Show notification after creation */
.damp-error-notification {
    opacity: 1 !important;
    transform: translateY(0) !important;
}

@media (max-width: 768px) {
    .damp-error-notification {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}
</style>
`;

// Inject styles
if (!document.getElementById('damp-error-styles')) {
    document.head.insertAdjacentHTML('beforeend', errorStyles);
} 