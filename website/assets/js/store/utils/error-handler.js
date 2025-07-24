/**
 * Professional Error Handler Utility
 * Google Engineering Standards Implementation
 * Comprehensive Error Management & Recovery
 * 
 * @fileoverview Error handler utility for structured error management
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

import { Logger } from './logger.js';

/**
 * Error Types
 */
export const ErrorType = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    NETWORK: 'network',
    PAYMENT: 'payment',
    DATABASE: 'database',
    EXTERNAL_API: 'external_api',
    USER_INPUT: 'user_input',
    SYSTEM: 'system',
    UNKNOWN: 'unknown'
};

/**
 * Error Severity Levels
 */
export const ErrorSeverity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Professional Error Handler Class
 * Provides comprehensive error management and recovery
 */
export class ErrorHandler {
    #logger = null;
    #errorReporting = null;
    #recoveryStrategies = new Map();
    #errorHistory = [];
    #maxHistorySize = 100;
    #retryConfigs = new Map();
    
    /**
     * Create a new error handler instance
     * @param {Object} options - Error handler configuration
     */
    constructor(options = {}) {
        this.#logger = options.logger || new Logger('ErrorHandler');
        this.#errorReporting = options.errorReporting || null;
        this.#maxHistorySize = options.maxHistorySize || 100;
        
        // Initialize default recovery strategies
        this.#initializeRecoveryStrategies();
        
        // Initialize default retry configurations
        this.#initializeRetryConfigs();
        
        // Set up global error handlers
        this.#setupGlobalErrorHandlers();
    }
    
    /**
     * Handle an error with comprehensive processing
     * @param {string} errorCode - Error code/identifier
     * @param {Error} error - Error object
     * @param {Object} context - Additional context
     * @param {Object} options - Handling options
     * @returns {Object} Error handling result
     */
    handleError(errorCode, error, context = {}, options = {}) {
        try {
            // Create structured error entry
            const errorEntry = this.#createErrorEntry(errorCode, error, context);
            
            // Add to error history
            this.#addToHistory(errorEntry);
            
            // Log the error
            this.#logError(errorEntry);
            
            // Report to external services if configured
            this.#reportError(errorEntry);
            
            // Attempt recovery if strategy exists
            const recoveryResult = this.#attemptRecovery(errorEntry, options);
            
            // Track error metrics
            this.#trackErrorMetrics(errorEntry);
            
            return {
                errorId: errorEntry.id,
                handled: true,
                recovered: recoveryResult.recovered,
                recoveryAction: recoveryResult.action,
                userMessage: this.#getUserMessage(errorEntry),
                technicalMessage: errorEntry.message,
                shouldRetry: this.#shouldRetry(errorEntry),
                timestamp: errorEntry.timestamp
            };
            
        } catch (handlingError) {
            // Fallback error handling
            this.#logger.fatal('Error handler failed', handlingError);
            return {
                errorId: null,
                handled: false,
                recovered: false,
                userMessage: 'An unexpected error occurred. Please try again.',
                technicalMessage: error?.message || 'Unknown error',
                shouldRetry: false,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Handle async operation with automatic retry
     * @param {Function} operation - Async operation to execute
     * @param {Object} options - Retry options
     * @returns {Promise<*>} Operation result
     */
    async withRetry(operation, options = {}) {
        const config = {
            maxAttempts: options.maxAttempts || 3,
            baseDelay: options.baseDelay || 1000,
            maxDelay: options.maxDelay || 10000,
            exponential: options.exponential !== false,
            retryCondition: options.retryCondition || this.#defaultRetryCondition,
            onRetry: options.onRetry || (() => {})
        };
        
        let lastError = null;
        
        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                const result = await operation();
                
                // Success - log recovery if this wasn't the first attempt
                if (attempt > 1) {
                    this.#logger.info(`Operation succeeded after ${attempt} attempts`);
                }
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                // Check if we should retry
                if (attempt === config.maxAttempts || !config.retryCondition(error, attempt)) {
                    break;
                }
                
                // Calculate delay
                const delay = config.exponential
                    ? Math.min(config.baseDelay * Math.pow(2, attempt - 1), config.maxDelay)
                    : config.baseDelay;
                
                // Log retry attempt
                this.#logger.warn(`Operation failed, retrying in ${delay}ms`, {
                    attempt,
                    maxAttempts: config.maxAttempts,
                    error: error.message
                });
                
                // Call retry callback
                await config.onRetry(error, attempt, delay);
                
                // Wait before retry
                await this.#delay(delay);
            }
        }
        
        // All retries failed
        const errorEntry = this.#createErrorEntry('RETRY_FAILED', lastError, {
            operation: operation.name || 'anonymous',
            attempts: config.maxAttempts
        });
        
        this.#addToHistory(errorEntry);
        throw lastError;
    }
    
    /**
     * Create a custom error with additional context
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Object} context - Additional context
     * @returns {Error} Custom error
     */
    createError(message, code, context = {}) {
        const error = new Error(message);
        error.code = code;
        error.context = context;
        error.timestamp = new Date().toISOString();
        
        return error;
    }
    
    /**
     * Add custom recovery strategy
     * @param {string} errorCode - Error code to handle
     * @param {Function} strategy - Recovery strategy function
     */
    addRecoveryStrategy(errorCode, strategy) {
        this.#recoveryStrategies.set(errorCode, strategy);
    }
    
    /**
     * Get error history
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered error history
     */
    getErrorHistory(filters = {}) {
        let history = [...this.#errorHistory];
        
        if (filters.type) {
            history = history.filter(entry => entry.type === filters.type);
        }
        
        if (filters.severity) {
            history = history.filter(entry => entry.severity === filters.severity);
        }
        
        if (filters.since) {
            const since = new Date(filters.since);
            history = history.filter(entry => new Date(entry.timestamp) >= since);
        }
        
        if (filters.limit) {
            history = history.slice(-filters.limit);
        }
        
        return history;
    }
    
    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const now = Date.now();
        const lastHour = now - (60 * 60 * 1000);
        const lastDay = now - (24 * 60 * 60 * 1000);
        
        const recentErrors = this.#errorHistory.filter(
            entry => new Date(entry.timestamp).getTime() > lastHour
        );
        
        const dailyErrors = this.#errorHistory.filter(
            entry => new Date(entry.timestamp).getTime() > lastDay
        );
        
        return {
            total: this.#errorHistory.length,
            lastHour: recentErrors.length,
            lastDay: dailyErrors.length,
            byType: this.#groupBy(this.#errorHistory, 'type'),
            bySeverity: this.#groupBy(this.#errorHistory, 'severity'),
            mostCommon: this.#getMostCommonErrors()
        };
    }
    
    /**
     * Clear error history
     */
    clearHistory() {
        this.#errorHistory = [];
    }
    
    // Private methods
    
    /**
     * @private
     */
    #createErrorEntry(errorCode, error, context) {
        const timestamp = new Date().toISOString();
        const errorType = this.#classifyError(error, context);
        const severity = this.#determineSeverity(error, errorType, context);
        
        return {
            id: this.#generateErrorId(),
            code: errorCode,
            type: errorType,
            severity,
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            context,
            timestamp,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            url: typeof window !== 'undefined' ? window.location.href : null,
            userId: context.userId || null,
            sessionId: context.sessionId || null
        };
    }
    
    /**
     * @private
     */
    #classifyError(error, context) {
        // Network errors
        if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
            return ErrorType.NETWORK;
        }
        
        // Authentication errors
        if (error?.code?.includes('auth') || context.type === 'auth') {
            return ErrorType.AUTHENTICATION;
        }
        
        // Payment errors
        if (error?.code?.includes('payment') || error?.code?.includes('stripe')) {
            return ErrorType.PAYMENT;
        }
        
        // Validation errors
        if (error?.name === 'ValidationError' || error?.code?.includes('validation')) {
            return ErrorType.VALIDATION;
        }
        
        // Firebase/Database errors
        if (error?.code?.includes('firestore') || error?.code?.includes('database')) {
            return ErrorType.DATABASE;
        }
        
        return ErrorType.UNKNOWN;
    }
    
    /**
     * @private
     */
    #determineSeverity(error, errorType, context) {
        // Critical system errors
        if (errorType === ErrorType.SYSTEM || error?.name === 'SecurityError') {
            return ErrorSeverity.CRITICAL;
        }
        
        // High severity for payment and auth issues
        if (errorType === ErrorType.PAYMENT || errorType === ErrorType.AUTHENTICATION) {
            return ErrorSeverity.HIGH;
        }
        
        // Medium severity for network and database issues
        if (errorType === ErrorType.NETWORK || errorType === ErrorType.DATABASE) {
            return ErrorSeverity.MEDIUM;
        }
        
        // Low severity for validation and user input
        if (errorType === ErrorType.VALIDATION || errorType === ErrorType.USER_INPUT) {
            return ErrorSeverity.LOW;
        }
        
        return ErrorSeverity.MEDIUM;
    }
    
    /**
     * @private
     */
    #logError(errorEntry) {
        const logMethod = this.#getLogMethod(errorEntry.severity);
        
        this.#logger[logMethod](`[${errorEntry.code}] ${errorEntry.message}`, {
            errorId: errorEntry.id,
            type: errorEntry.type,
            severity: errorEntry.severity,
            context: errorEntry.context
        });
    }
    
    /**
     * @private
     */
    #getLogMethod(severity) {
        switch (severity) {
            case ErrorSeverity.CRITICAL:
                return 'fatal';
            case ErrorSeverity.HIGH:
                return 'error';
            case ErrorSeverity.MEDIUM:
                return 'warn';
            case ErrorSeverity.LOW:
                return 'info';
            default:
                return 'error';
        }
    }
    
    /**
     * @private
     */
    #reportError(errorEntry) {
        if (!this.#errorReporting) return;
        
        try {
            this.#errorReporting.report(errorEntry);
        } catch (reportingError) {
            this.#logger.warn('Error reporting failed', reportingError);
        }
    }
    
    /**
     * @private
     */
    #attemptRecovery(errorEntry, options) {
        const strategy = this.#recoveryStrategies.get(errorEntry.code);
        
        if (!strategy || options.skipRecovery) {
            return { recovered: false, action: null };
        }
        
        try {
            const result = strategy(errorEntry, options);
            
            this.#logger.info(`Recovery attempted for ${errorEntry.code}`, {
                errorId: errorEntry.id,
                recovered: result.success
            });
            
            return {
                recovered: result.success,
                action: result.action
            };
            
        } catch (recoveryError) {
            this.#logger.error('Recovery strategy failed', recoveryError);
            return { recovered: false, action: null };
        }
    }
    
    /**
     * @private
     */
    #getUserMessage(errorEntry) {
        const userMessages = {
            [ErrorType.NETWORK]: 'Please check your internet connection and try again.',
            [ErrorType.AUTHENTICATION]: 'Please sign in again to continue.',
            [ErrorType.PAYMENT]: 'There was an issue processing your payment. Please try again.',
            [ErrorType.VALIDATION]: 'Please check your input and try again.',
            [ErrorType.DATABASE]: 'We\'re experiencing technical difficulties. Please try again in a moment.',
            [ErrorType.EXTERNAL_API]: 'A service we depend on is currently unavailable. Please try again later.'
        };
        
        return userMessages[errorEntry.type] || 'An unexpected error occurred. Please try again.';
    }
    
    /**
     * @private
     */
    #shouldRetry(errorEntry) {
        const retryableTypes = [
            ErrorType.NETWORK,
            ErrorType.DATABASE,
            ErrorType.EXTERNAL_API
        ];
        
        return retryableTypes.includes(errorEntry.type) && 
               errorEntry.severity !== ErrorSeverity.CRITICAL;
    }
    
    /**
     * @private
     */
    #addToHistory(errorEntry) {
        this.#errorHistory.push(errorEntry);
        
        // Keep history size manageable
        if (this.#errorHistory.length > this.#maxHistorySize) {
            this.#errorHistory = this.#errorHistory.slice(-this.#maxHistorySize);
        }
    }
    
    /**
     * @private
     */
    #trackErrorMetrics(errorEntry) {
        // Track error metrics for analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
                description: `${errorEntry.code}: ${errorEntry.message}`,
                fatal: errorEntry.severity === ErrorSeverity.CRITICAL,
                custom_map: {
                    error_type: errorEntry.type,
                    error_severity: errorEntry.severity,
                    error_code: errorEntry.code
                }
            });
        }
    }
    
    /**
     * @private
     */
    #generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * @private
     */
    #initializeRecoveryStrategies() {
        // Network error recovery
        this.#recoveryStrategies.set('NETWORK_ERROR', (errorEntry) => {
            // Attempt to retry after a delay
            return { success: true, action: 'retry_with_delay' };
        });
        
        // Authentication error recovery
        this.#recoveryStrategies.set('AUTH_TOKEN_EXPIRED', (errorEntry) => {
            // Trigger token refresh
            return { success: true, action: 'refresh_token' };
        });
        
        // Payment error recovery
        this.#recoveryStrategies.set('PAYMENT_FAILED', (errorEntry) => {
            // Suggest alternative payment method
            return { success: true, action: 'suggest_alternative_payment' };
        });
    }
    
    /**
     * @private
     */
    #initializeRetryConfigs() {
        this.#retryConfigs.set('network', {
            maxAttempts: 3,
            baseDelay: 1000,
            exponential: true
        });
        
        this.#retryConfigs.set('database', {
            maxAttempts: 5,
            baseDelay: 500,
            exponential: true
        });
        
        this.#retryConfigs.set('api', {
            maxAttempts: 3,
            baseDelay: 2000,
            exponential: false
        });
    }
    
    /**
     * @private
     */
    #setupGlobalErrorHandlers() {
        if (typeof window !== 'undefined') {
            // Unhandled JavaScript errors
            window.addEventListener('error', (event) => {
                this.handleError('UNHANDLED_ERROR', event.error, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });
            
            // Unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError('UNHANDLED_PROMISE_REJECTION', event.reason, {
                    promise: event.promise
                });
            });
        }
    }
    
    /**
     * @private
     */
    #defaultRetryCondition(error, attempt) {
        // Don't retry validation errors or authentication errors
        if (error?.name === 'ValidationError' || error?.code?.includes('auth')) {
            return false;
        }
        
        // Retry network errors and server errors
        return error?.name === 'NetworkError' || 
               error?.code === 'NETWORK_ERROR' ||
               (error?.status >= 500 && error?.status < 600);
    }
    
    /**
     * @private
     */
    #delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * @private
     */
    #groupBy(array, key) {
        return array.reduce((groups, item) => {
            const value = item[key];
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {});
    }
    
    /**
     * @private
     */
    #getMostCommonErrors() {
        const errorCounts = this.#groupBy(this.#errorHistory, 'code');
        
        return Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([code, count]) => ({ code, count }));
    }
}

/**
 * Create a default error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Create error handler for specific component
 * @param {Object} options - Error handler options
 * @returns {ErrorHandler} Error handler instance
 */
export function createErrorHandler(options = {}) {
    return new ErrorHandler(options);
}

export default ErrorHandler; 