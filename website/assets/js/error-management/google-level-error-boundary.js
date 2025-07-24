// DAMP Smart Drinkware - Google-Level Error Boundary System
// Advanced Error Handling with Auto-Recovery & User Experience Preservation
// Copyright 2025 WeCr8 Solutions LLC

class DAMPErrorBoundary {
    constructor() {
        this.errorQueue = [];
        this.recoveryStrategies = new Map();
        this.componentStates = new Map();
        this.retryAttempts = new Map();
        this.userNotifications = new Set();
        this.criticalErrors = [];
        this.maxRetries = 3;
        this.errorThreshold = 5; // Max errors per minute
        this.recoveryMode = false;
        
        this.init();
    }

    async init() {
        console.log('[DAMP Error Boundary] Initializing Google-level error management...');
        
        try {
            this.setupGlobalErrorHandlers();
            this.setupPromiseRejectionHandler();
            this.setupComponentErrorBoundaries();
            this.setupNetworkErrorRecovery();
            this.setupMemoryLeakPrevention();
            this.initializeRecoveryStrategies();
            this.startErrorMonitoring();
            
            console.log('[DAMP Error Boundary] Advanced error boundary system active');
        } catch (error) {
            console.error('[DAMP Error Boundary] System initialization failed:', error);
            this.handleCriticalError(error, 'system-init');
        }
    }

    // === GLOBAL ERROR HANDLERS ===
    setupGlobalErrorHandlers() {
        // JavaScript runtime errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise-rejection',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                reason: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now(),
                url: window.location.href
            });

            // Prevent default browser behavior
            event.preventDefault();
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event);
            }
        }, true);
    }

    setupPromiseRejectionHandler() {
        // Override Promise.prototype.catch for better tracking
        const originalCatch = Promise.prototype.catch;
        
        Promise.prototype.catch = function(onRejected) {
            return originalCatch.call(this, (reason) => {
                // Track promise rejections that are caught
                window.dampErrorBoundary?.trackCaughtError({
                    type: 'caught-promise-rejection',
                    reason: reason,
                    timestamp: Date.now()
                });
                
                if (onRejected) {
                    return onRejected(reason);
                }
                throw reason;
            });
        };
    }

    // === COMPONENT ERROR BOUNDARIES ===
    setupComponentErrorBoundaries() {
        // Monitor DOM mutations for component failures
        if ('MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    this.checkComponentHealth(mutation);
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'data-error']
            });
        }

        // Set up component-specific error boundaries
        this.setupCustomElementErrorBoundaries();
        this.setupReactLikeErrorBoundaries();
    }

    setupCustomElementErrorBoundaries() {
        // Wrap custom element constructors with error boundaries
        const originalDefine = customElements.define;
        
        customElements.define = function(name, constructor, options) {
            const WrappedConstructor = class extends constructor {
                constructor() {
                    try {
                        super();
                        window.dampErrorBoundary?.registerComponent(name, this);
                    } catch (error) {
                        window.dampErrorBoundary?.handleComponentError(error, name, 'constructor');
                        // Create a fallback element
                        return window.dampErrorBoundary?.createFallbackComponent(name);
                    }
                }
                
                connectedCallback() {
                    try {
                        if (super.connectedCallback) {
                            super.connectedCallback();
                        }
                    } catch (error) {
                        window.dampErrorBoundary?.handleComponentError(error, name, 'connected');
                        this.innerHTML = window.dampErrorBoundary?.getFallbackHTML(name);
                    }
                }
                
                disconnectedCallback() {
                    try {
                        if (super.disconnectedCallback) {
                            super.disconnectedCallback();
                        }
                        window.dampErrorBoundary?.unregisterComponent(name, this);
                    } catch (error) {
                        window.dampErrorBoundary?.handleComponentError(error, name, 'disconnected');
                    }
                }
            };
            
            return originalDefine.call(this, name, WrappedConstructor, options);
        };
    }

    setupReactLikeErrorBoundaries() {
        // For React-like component patterns
        const componentSelectors = [
            '[data-component]',
            '.component',
            '.widget',
            '.module'
        ];

        componentSelectors.forEach(selector => {
            const components = document.querySelectorAll(selector);
            components.forEach(component => {
                this.wrapComponentWithBoundary(component);
            });
        });
    }

    wrapComponentWithBoundary(element) {
        const componentName = element.dataset.component || element.className;
        
        // Store original content as fallback
        const originalHTML = element.innerHTML;
        this.componentStates.set(element, {
            name: componentName,
            originalHTML: originalHTML,
            errorCount: 0,
            lastError: null
        });

        // Wrap element methods with error handling
        const originalAddEventListener = element.addEventListener;
        element.addEventListener = function(type, listener, options) {
            const wrappedListener = function(event) {
                try {
                    return listener.call(this, event);
                } catch (error) {
                    window.dampErrorBoundary?.handleComponentError(error, componentName, `event-${type}`);
                }
            };
            return originalAddEventListener.call(this, type, wrappedListener, options);
        };
    }

    // === ERROR HANDLING LOGIC ===
    handleError(errorInfo) {
        // Check if we're in recovery mode
        if (this.recoveryMode && !this.isCriticalError(errorInfo)) {
            this.queueError(errorInfo);
            return;
        }

        // Rate limiting - prevent error spam
        if (this.isErrorRateLimited()) {
            console.warn('[DAMP Error Boundary] Error rate limit exceeded, entering recovery mode');
            this.enterRecoveryMode();
            return;
        }

        console.error('[DAMP Error Boundary] Handling error:', errorInfo);
        
        // Add to error queue
        this.errorQueue.push(errorInfo);

        // Determine error severity
        const severity = this.determineErrorSeverity(errorInfo);
        
        // Apply recovery strategy
        this.applyRecoveryStrategy(errorInfo, severity);
        
        // Update user if necessary
        this.updateUserExperience(errorInfo, severity);
        
        // Report error for monitoring
        this.reportError(errorInfo, severity);
    }

    handleResourceError(event) {
        const element = event.target;
        const resourceType = element.tagName.toLowerCase();
        
        const errorInfo = {
            type: 'resource-error',
            resourceType: resourceType,
            src: element.src || element.href,
            message: `Failed to load ${resourceType}`,
            element: element,
            timestamp: Date.now()
        };

        // Apply resource-specific recovery
        this.recoverFromResourceError(errorInfo);
    }

    handleComponentError(error, componentName, phase) {
        console.error(`[DAMP Error Boundary] Component error in ${componentName} (${phase}):`, error);
        
        const errorInfo = {
            type: 'component-error',
            componentName: componentName,
            phase: phase,
            message: error.message,
            stack: error.stack,
            timestamp: Date.now()
        };

        // Attempt component recovery
        this.recoverComponent(componentName, errorInfo);
    }

    // === RECOVERY STRATEGIES ===
    initializeRecoveryStrategies() {
        // JavaScript errors
        this.recoveryStrategies.set('javascript', [
            { strategy: 'retry', maxAttempts: 2 },
            { strategy: 'graceful-degradation', fallback: 'basic-functionality' },
            { strategy: 'component-isolation', isolate: true }
        ]);

        // Promise rejections
        this.recoveryStrategies.set('promise-rejection', [
            { strategy: 'retry-with-backoff', maxAttempts: 3 },
            { strategy: 'fallback-data', useCache: true },
            { strategy: 'user-notification', type: 'warning' }
        ]);

        // Resource errors
        this.recoveryStrategies.set('resource-error', [
            { strategy: 'retry-with-delay', delay: 1000 },
            { strategy: 'fallback-resource', useCDN: true },
            { strategy: 'graceful-degradation', removeFeature: true }
        ]);

        // Component errors
        this.recoveryStrategies.set('component-error', [
            { strategy: 'component-restart', preserveState: true },
            { strategy: 'fallback-ui', showBasic: true },
            { strategy: 'feature-disable', temporary: true }
        ]);

        // Network errors
        this.recoveryStrategies.set('network-error', [
            { strategy: 'offline-mode', useCache: true },
            { strategy: 'retry-exponential', maxDelay: 30000 },
            { strategy: 'queue-for-sync', backgroundSync: true }
        ]);
    }

    async applyRecoveryStrategy(errorInfo, severity) {
        const strategies = this.recoveryStrategies.get(errorInfo.type) || [];
        
        for (const strategyConfig of strategies) {
            try {
                const success = await this.executeRecoveryStrategy(errorInfo, strategyConfig);
                if (success) {
                    console.log(`[DAMP Error Boundary] Recovery successful with strategy: ${strategyConfig.strategy}`);
                    return;
                }
            } catch (recoveryError) {
                console.warn(`[DAMP Error Boundary] Recovery strategy failed: ${strategyConfig.strategy}`, recoveryError);
            }
        }
        
        // If all strategies failed, use last resort
        this.useLastResortRecovery(errorInfo);
    }

    async executeRecoveryStrategy(errorInfo, config) {
        switch (config.strategy) {
            case 'retry':
                return await this.retryOperation(errorInfo, config.maxAttempts);
            
            case 'retry-with-backoff':
                return await this.retryWithBackoff(errorInfo, config.maxAttempts);
            
            case 'graceful-degradation':
                return this.gracefulDegradation(errorInfo, config);
            
            case 'component-restart':
                return this.restartComponent(errorInfo, config.preserveState);
            
            case 'fallback-resource':
                return this.useFallbackResource(errorInfo, config);
            
            case 'offline-mode':
                return this.enterOfflineMode(errorInfo);
            
            case 'queue-for-sync':
                return this.queueForBackgroundSync(errorInfo);
            
            default:
                console.warn(`[DAMP Error Boundary] Unknown recovery strategy: ${config.strategy}`);
                return false;
        }
    }

    // === SPECIFIC RECOVERY IMPLEMENTATIONS ===
    async retryOperation(errorInfo, maxAttempts = 3) {
        const operationKey = this.getOperationKey(errorInfo);
        const currentAttempts = this.retryAttempts.get(operationKey) || 0;
        
        if (currentAttempts >= maxAttempts) {
            return false;
        }
        
        this.retryAttempts.set(operationKey, currentAttempts + 1);
        
        // Wait before retry
        await this.delay(Math.pow(2, currentAttempts) * 1000);
        
        try {
            // Attempt to re-execute the failed operation
            return await this.reExecuteOperation(errorInfo);
        } catch (error) {
            console.warn(`[DAMP Error Boundary] Retry attempt ${currentAttempts + 1} failed:`, error);
            return false;
        }
    }

    gracefulDegradation(errorInfo, config) {
        console.log('[DAMP Error Boundary] Applying graceful degradation...');
        
        switch (errorInfo.type) {
            case 'javascript':
                return this.degradeJavaScriptFeatures(errorInfo);
            
            case 'component-error':
                return this.degradeComponent(errorInfo.componentName);
            
            case 'resource-error':
                return this.degradeResourceFeatures(errorInfo);
            
            default:
                return this.enableBasicMode();
        }
    }

    restartComponent(errorInfo, preserveState = true) {
        const componentName = errorInfo.componentName;
        console.log(`[DAMP Error Boundary] Restarting component: ${componentName}`);
        
        // Find component elements
        const elements = document.querySelectorAll(`[data-component="${componentName}"], ${componentName}`);
        
        elements.forEach(element => {
            try {
                // Save state if requested
                let savedState = null;
                if (preserveState && element.getState) {
                    savedState = element.getState();
                }
                
                // Restart the component
                if (element.restart) {
                    element.restart();
                } else {
                    // Manual restart
                    const componentState = this.componentStates.get(element);
                    if (componentState) {
                        element.innerHTML = componentState.originalHTML;
                        
                        // Re-initialize if possible
                        if (element.init) {
                            element.init();
                        }
                    }
                }
                
                // Restore state if available
                if (savedState && element.setState) {
                    element.setState(savedState);
                }
                
                return true;
            } catch (error) {
                console.error('[DAMP Error Boundary] Component restart failed:', error);
                return false;
            }
        });
        
        return elements.length > 0;
    }

    recoverFromResourceError(errorInfo) {
        const { element, resourceType, src } = errorInfo;
        
        console.log(`[DAMP Error Boundary] Recovering from ${resourceType} error: ${src}`);
        
        switch (resourceType) {
            case 'img':
                this.recoverImage(element);
                break;
            
            case 'script':
                this.recoverScript(element);
                break;
            
            case 'link':
                this.recoverStylesheet(element);
                break;
            
            default:
                this.hideFailedResource(element);
        }
    }

    recoverImage(img) {
        // Try fallback image
        const fallbackSrc = '/assets/images/fallback/image-placeholder.png';
        
        if (img.src !== fallbackSrc) {
            img.src = fallbackSrc;
            img.alt = 'Image temporarily unavailable';
            img.classList.add('error-fallback');
        } else {
            // Even fallback failed, hide the image
            img.style.display = 'none';
            
            // Create text fallback
            const textFallback = document.createElement('div');
            textFallback.className = 'image-text-fallback';
            textFallback.textContent = img.alt || 'Image unavailable';
            img.parentNode.insertBefore(textFallback, img);
        }
    }

    recoverScript(script) {
        console.log('[DAMP Error Boundary] Attempting script recovery:', script.src);
        
        // Try loading from CDN fallback
        const fallbackSources = this.getScriptFallbacks(script.src);
        
        for (const fallbackSrc of fallbackSources) {
            const newScript = document.createElement('script');
            newScript.src = fallbackSrc;
            newScript.onload = () => {
                console.log('[DAMP Error Boundary] Script recovered from fallback:', fallbackSrc);
            };
            newScript.onerror = () => {
                console.warn('[DAMP Error Boundary] Fallback script also failed:', fallbackSrc);
            };
            
            script.parentNode.insertBefore(newScript, script);
            break; // Try one fallback at a time
        }
        
        // Remove the failed script
        script.remove();
    }

    // === USER EXPERIENCE PRESERVATION ===
    updateUserExperience(errorInfo, severity) {
        switch (severity) {
            case 'critical':
                this.showCriticalErrorMessage(errorInfo);
                break;
            
            case 'major':
                this.showMajorErrorMessage(errorInfo);
                break;
            
            case 'minor':
                this.logMinorError(errorInfo);
                break;
        }
    }

    showCriticalErrorMessage(errorInfo) {
        if (this.userNotifications.has('critical')) return;
        
        const notification = this.createErrorNotification({
            type: 'critical',
            title: 'Service Temporarily Unavailable',
            message: 'We\'re experiencing technical difficulties. Please refresh the page or try again later.',
            actions: [
                { text: 'Refresh Page', action: () => window.location.reload() },
                { text: 'Report Issue', action: () => this.openErrorReport(errorInfo) }
            ],
            persistent: true
        });
        
        this.userNotifications.add('critical');
        this.displayNotification(notification);
    }

    showMajorErrorMessage(errorInfo) {
        if (this.userNotifications.has('major')) return;
        
        const notification = this.createErrorNotification({
            type: 'major',
            title: 'Some Features Unavailable',
            message: 'Some features may not work properly. We\'re working to fix this.',
            actions: [
                { text: 'Continue', action: () => this.dismissNotification('major') }
            ],
            autoHide: 8000
        });
        
        this.userNotifications.add('major');
        this.displayNotification(notification);
    }

    createErrorNotification(config) {
        const notification = document.createElement('div');
        notification.className = `error-notification error-${config.type}`;
        notification.innerHTML = `
            <div class="error-notification-content">
                <div class="error-notification-icon">⚠️</div>
                <div class="error-notification-text">
                    <h4>${config.title}</h4>
                    <p>${config.message}</p>
                </div>
                <div class="error-notification-actions">
                    ${config.actions.map(action => 
                        `<button class="error-notification-btn" data-action="${action.text}">
                            ${action.text}
                        </button>`
                    ).join('')}
                </div>
                ${!config.persistent ? '<button class="error-notification-close">×</button>' : ''}
            </div>
        `;
        
        // Add event listeners
        config.actions.forEach(action => {
            const button = notification.querySelector(`[data-action="${action.text}"]`);
            if (button) {
                button.addEventListener('click', action.action);
            }
        });
        
        if (!config.persistent) {
            const closeBtn = notification.querySelector('.error-notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.dismissNotification(config.type);
                });
            }
        }
        
        return notification;
    }

    // === MONITORING AND REPORTING ===
    determineErrorSeverity(errorInfo) {
        // Critical errors that break core functionality
        if (this.isCriticalError(errorInfo)) {
            return 'critical';
        }
        
        // Major errors that affect user experience
        if (this.isMajorError(errorInfo)) {
            return 'major';
        }
        
        // Minor errors that don't significantly impact users
        return 'minor';
    }

    isCriticalError(errorInfo) {
        const criticalPatterns = [
            /^TypeError: Cannot read property.*of undefined$/,
            /^ReferenceError:.*is not defined$/,
            /^TypeError: Cannot set property.*of undefined$/,
            /Service Worker registration failed/,
            /Critical component initialization failed/
        ];
        
        return criticalPatterns.some(pattern => pattern.test(errorInfo.message));
    }

    isMajorError(errorInfo) {
        const majorPatterns = [
            /Network error/,
            /Failed to fetch/,
            /Component render failed/,
            /Resource load failed/
        ];
        
        return majorPatterns.some(pattern => pattern.test(errorInfo.message));
    }

    reportError(errorInfo, severity) {
        // Report to analytics
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: severity === 'critical',
                custom_map: {
                    error_type: errorInfo.type,
                    component: errorInfo.componentName || 'unknown',
                    severity: severity
                }
            });
        }
        
        // Report to error monitoring service
        if (window.Sentry) {
            window.Sentry.captureException(errorInfo.error || new Error(errorInfo.message), {
                level: severity,
                tags: {
                    component: errorInfo.componentName,
                    error_type: errorInfo.type
                }
            });
        }
        
        // Custom event for other systems
        window.dispatchEvent(new CustomEvent('damp:error:reported', {
            detail: { errorInfo, severity }
        }));
    }

    // === UTILITY METHODS ===
    isErrorRateLimited() {
        const oneMinuteAgo = Date.now() - 60000;
        const recentErrors = this.errorQueue.filter(error => error.timestamp > oneMinuteAgo);
        return recentErrors.length >= this.errorThreshold;
    }

    enterRecoveryMode() {
        this.recoveryMode = true;
        console.log('[DAMP Error Boundary] Entering recovery mode - throttling error handling');
        
        // Exit recovery mode after 2 minutes
        setTimeout(() => {
            this.recoveryMode = false;
            console.log('[DAMP Error Boundary] Exiting recovery mode');
        }, 120000);
    }

    getOperationKey(errorInfo) {
        return `${errorInfo.type}-${errorInfo.filename || errorInfo.componentName || 'unknown'}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // === PUBLIC API ===
    getErrorStats() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        const recentErrors = this.errorQueue.filter(error => error.timestamp > oneHourAgo);
        
        return {
            totalErrors: this.errorQueue.length,
            recentErrors: recentErrors.length,
            criticalErrors: this.criticalErrors.length,
            recoveryMode: this.recoveryMode,
            componentStates: Array.from(this.componentStates.keys()).length
        };
    }

    clearErrorHistory() {
        this.errorQueue = [];
        this.criticalErrors = [];
        this.retryAttempts.clear();
        console.log('[DAMP Error Boundary] Error history cleared');
    }

    // Manual error simulation for testing
    simulateError(type = 'javascript') {
        const testErrors = {
            javascript: () => { throw new Error('Test JavaScript error'); },
            promise: () => { Promise.reject(new Error('Test promise rejection')); },
            component: () => { this.handleComponentError(new Error('Test component error'), 'test-component', 'manual'); },
            resource: () => { 
                const img = document.createElement('img');
                img.src = 'nonexistent-image.jpg';
                document.body.appendChild(img);
            }
        };
        
        if (testErrors[type]) {
            console.log(`[DAMP Error Boundary] Simulating ${type} error for testing`);
            testErrors[type]();
        }
    }
}

// Initialize the error boundary system
const dampErrorBoundary = new DAMPErrorBoundary();

// Export for global access
window.dampErrorBoundary = dampErrorBoundary;

// Global functions for developer tools
window.getDampErrorStats = () => dampErrorBoundary.getErrorStats();
window.clearDampErrors = () => dampErrorBoundary.clearErrorHistory();
window.simulateDampError = (type) => dampErrorBoundary.simulateError(type);

// CSS for error notifications
const errorNotificationCSS = `
.error-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
}

.error-critical {
    border-left: 4px solid #dc3545;
}

.error-major {
    border-left: 4px solid #ffc107;
}

.error-notification-content {
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.error-notification-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.error-notification-text h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
}

.error-notification-text p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
}

.error-notification-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
}

.error-notification-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.error-notification-btn:hover {
    background: #f8f9fa;
    border-color: #007bff;
}

.error-notification-close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
    padding: 4px;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Inject CSS
const styleElement = document.createElement('style');
styleElement.textContent = errorNotificationCSS;
document.head.appendChild(styleElement);

console.log('[DAMP Error Boundary] Google-level error boundary system initialized'); 