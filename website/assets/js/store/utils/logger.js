/**
 * Professional Logger Utility
 * Google Engineering Standards Implementation
 * Cross-Platform Logging with Analytics Integration
 * 
 * @fileoverview Logger utility for structured logging and debugging
 * @author WeCr8 Solutions LLC
 * @version 2.0.0
 */

/**
 * Log Levels
 */
export const LogLevel = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
};

/**
 * Log Level Names
 */
const LOG_LEVEL_NAMES = {
    [LogLevel.TRACE]: 'TRACE',
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.FATAL]: 'FATAL'
};

/**
 * Professional Logger Class
 * Provides structured logging with multiple output targets
 */
export class Logger {
    #name = '';
    #minLevel = LogLevel.INFO;
    #outputs = [];
    #metadata = {};
    #enabled = true;
    #environment = 'production';
    #seenObjects = null;
    
    /**
     * Create a new logger instance
     * @param {string} name - Logger name/component
     * @param {Object} options - Logger configuration
     */
    constructor(name, options = {}) {
        this.#name = name;
        this.#minLevel = options.level || this.#detectLogLevel();
        this.#metadata = options.metadata || {};
        this.#enabled = options.enabled !== false;
        this.#environment = options.environment || this.#detectEnvironment();
        
        // Initialize default outputs
        this.#initializeOutputs(options.outputs);
    }
    
    /**
     * Log trace message
     * @param {string} message - Log message
     * @param {*} data - Additional data
     */
    trace(message, data = null) {
        this.#log(LogLevel.TRACE, message, data);
    }
    
    /**
     * Log debug message
     * @param {string} message - Log message
     * @param {*} data - Additional data
     */
    debug(message, data = null) {
        this.#log(LogLevel.DEBUG, message, data);
    }
    
    /**
     * Log info message
     * @param {string} message - Log message
     * @param {*} data - Additional data
     */
    info(message, data = null) {
        this.#log(LogLevel.INFO, message, data);
    }
    
    /**
     * Log warning message
     * @param {string} message - Log message
     * @param {*} data - Additional data
     */
    warn(message, data = null) {
        this.#log(LogLevel.WARN, message, data);
    }
    
    /**
     * Log error message
     * @param {string} message - Log message
     * @param {Error|*} error - Error object or additional data
     */
    error(message, error = null) {
        this.#log(LogLevel.ERROR, message, error);
    }
    
    /**
     * Log fatal error message
     * @param {string} message - Log message
     * @param {Error|*} error - Error object or additional data
     */
    fatal(message, error = null) {
        this.#log(LogLevel.FATAL, message, error);
    }
    
    /**
     * Create a child logger with additional context
     * @param {string} childName - Child logger name
     * @param {Object} metadata - Additional metadata
     * @returns {Logger} Child logger instance
     */
    child(childName, metadata = {}) {
        return new Logger(`${this.#name}:${childName}`, {
            level: this.#minLevel,
            metadata: { ...this.#metadata, ...metadata },
            enabled: this.#enabled,
            environment: this.#environment,
            outputs: this.#outputs
        });
    }
    
    /**
     * Set log level
     * @param {number} level - Log level
     */
    setLevel(level) {
        this.#minLevel = level;
    }
    
    /**
     * Enable/disable logging
     * @param {boolean} enabled - Enable logging
     */
    setEnabled(enabled) {
        this.#enabled = enabled;
    }
    
    /**
     * Add log output
     * @param {Object} output - Log output configuration
     */
    addOutput(output) {
        this.#outputs.push(output);
    }
    
    /**
     * Get logger metrics
     * @returns {Object} Logger metrics
     */
    getMetrics() {
        return {
            name: this.#name,
            level: this.#minLevel,
            levelName: LOG_LEVEL_NAMES[this.#minLevel],
            enabled: this.#enabled,
            outputCount: this.#outputs.length,
            environment: this.#environment,
            metadata: this.#metadata
        };
    }
    
    // Private methods
    
    /**
     * @private
     */
    #log(level, message, data) {
        if (!this.#enabled || level < this.#minLevel) {
            return;
        }
        
        const logEntry = this.#createLogEntry(level, message, data);
        
        // Send to all outputs
        this.#outputs.forEach(output => {
            try {
                output.write(logEntry);
            } catch (error) {
                // Fallback to console if output fails
                console.error('Logger output error:', error);
                console.log(logEntry);
            }
        });
    }
    
    /**
     * @private
     */
    #createLogEntry(level, message, data) {
        const timestamp = new Date().toISOString();
        const levelName = LOG_LEVEL_NAMES[level];
        
        const entry = {
            timestamp,
            level,
            levelName,
            logger: this.#name,
            message,
            environment: this.#environment,
            ...this.#metadata
        };
        
        // Add data if provided
        if (data !== null && data !== undefined) {
            if (data instanceof Error) {
                entry.error = {
                    name: data.name,
                    message: data.message,
                    stack: data.stack,
                    code: data.code
                };
            } else if (typeof data === 'object') {
                entry.data = this.#sanitizeData(data);
            } else {
                entry.data = data;
            }
        }
        
        // Add browser/platform info for web environments
        if (typeof window !== 'undefined') {
            entry.platform = {
                userAgent: navigator.userAgent,
                url: window.location.href,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
        }
        
        return entry;
    }
    
    /**
     * @private
     */
    #sanitizeData(data) {
        try {
            // Remove sensitive data and circular references
            return JSON.parse(JSON.stringify(data, (key, value) => {
                // Remove sensitive keys
                if (this.#isSensitiveKey(key)) {
                    return '[REDACTED]';
                }
                
                // Handle circular references
                if (typeof value === 'object' && value !== null) {
                    if (this.#seenObjects?.has(value)) {
                        return '[Circular]';
                    }
                    if (!this.#seenObjects) {
                        this.#seenObjects = new WeakSet();
                    }
                    this.#seenObjects.add(value);
                }
                
                return value;
            }));
        } catch (error) {
            return '[Serialization Error]';
        } finally {
            this.#seenObjects = null;
        }
    }
    
    /**
     * @private
     */
    #isSensitiveKey(key) {
        const sensitiveKeys = [
            'password', 'token', 'secret', 'key', 'auth', 'authorization',
            'cookie', 'session', 'credential', 'private', 'confidential',
            'ssn', 'social', 'creditcard', 'cc', 'cvv', 'pin'
        ];
        
        return sensitiveKeys.some(sensitive => 
            key.toLowerCase().includes(sensitive)
        );
    }
    
    /**
     * @private
     */
    #detectLogLevel() {
        if (typeof window !== 'undefined') {
            // Browser environment
            const urlParams = new URLSearchParams(window.location.search);
            const debugParam = urlParams.get('debug');
            
            if (debugParam === 'true' || localStorage.getItem('dampDebug') === 'true') {
                return LogLevel.DEBUG;
            }
            
            return window.location.hostname === 'localhost' ? LogLevel.DEBUG : LogLevel.INFO;
        } else if (typeof process !== 'undefined') {
            // Node.js environment
            return process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
        }
        
        return LogLevel.INFO;
    }
    
    /**
     * @private
     */
    #detectEnvironment() {
        if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'development';
            } else if (window.location.hostname.includes('staging') || window.location.hostname.includes('dev')) {
                return 'staging';
            } else {
                return 'production';
            }
        } else if (typeof process !== 'undefined') {
            return process.env.NODE_ENV || 'production';
        }
        
        return 'production';
    }
    
    /**
     * @private
     */
    #initializeOutputs(customOutputs = []) {
        // Always include console output
        this.#outputs.push(new ConsoleOutput());
        
        // Add browser-specific outputs
        if (typeof window !== 'undefined') {
            // Add analytics output for production
            if (this.#environment === 'production') {
                this.#outputs.push(new AnalyticsOutput());
            }
            
            // Add local storage output for debugging
            if (this.#environment === 'development') {
                this.#outputs.push(new LocalStorageOutput());
            }
        }
        
        // Add custom outputs
        customOutputs.forEach(output => this.#outputs.push(output));
    }
}

/**
 * Console Output Handler
 */
class ConsoleOutput {
    write(logEntry) {
        const { levelName, logger, message, data, error } = logEntry;
        
        const prefix = `[${new Date(logEntry.timestamp).toLocaleTimeString()}] ${levelName} (${logger}):`;
        
        switch (logEntry.level) {
            case LogLevel.TRACE:
            case LogLevel.DEBUG:
                console.debug(prefix, message, data || '');
                break;
            case LogLevel.INFO:
                console.info(prefix, message, data || '');
                break;
            case LogLevel.WARN:
                console.warn(prefix, message, data || '');
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(prefix, message, error || data || '');
                if (error?.stack) {
                    console.error(error.stack);
                }
                break;
        }
    }
}

/**
 * Analytics Output Handler
 */
class AnalyticsOutput {
    write(logEntry) {
        // Only send ERROR and FATAL to analytics
        if (logEntry.level < LogLevel.ERROR) {
            return;
        }
        
        try {
            // Send to Google Analytics
            if (window.gtag) {
                window.gtag('event', 'exception', {
                    description: `${logEntry.logger}: ${logEntry.message}`,
                    fatal: logEntry.level === LogLevel.FATAL,
                    custom_map: {
                        logger: logEntry.logger,
                        level: logEntry.levelName,
                        environment: logEntry.environment
                    }
                });
            }
            
            // Send to Firebase Analytics
            if (window.firebase?.analytics) {
                window.firebase.analytics().logEvent('app_error', {
                    logger: logEntry.logger,
                    level: logEntry.levelName,
                    message: logEntry.message,
                    environment: logEntry.environment
                });
            }
        } catch (error) {
            // Fail silently to prevent logging loops
        }
    }
}

/**
 * Local Storage Output Handler (Development)
 */
class LocalStorageOutput {
    constructor() {
        this.maxEntries = 1000;
        this.storageKey = 'dampLogs';
    }
    
    write(logEntry) {
        try {
            let logs = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            
            logs.push(logEntry);
            
            // Keep only recent entries
            if (logs.length > this.maxEntries) {
                logs = logs.slice(-this.maxEntries);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(logs));
        } catch (error) {
            // Storage might be full, clear old logs
            try {
                localStorage.removeItem(this.storageKey);
                localStorage.setItem(this.storageKey, JSON.stringify([logEntry]));
            } catch (clearError) {
                // Fail silently
            }
        }
    }
    
    /**
     * Get stored logs
     * @returns {Array} Stored log entries
     */
    getLogs() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (error) {
            return [];
        }
    }
    
    /**
     * Clear stored logs
     */
    clearLogs() {
        localStorage.removeItem(this.storageKey);
    }
}

/**
 * Create a default logger instance
 */
export const logger = new Logger('DAMP');

/**
 * Create logger for specific component
 * @param {string} name - Component name
 * @param {Object} options - Logger options
 * @returns {Logger} Logger instance
 */
export function createLogger(name, options = {}) {
    return new Logger(name, options);
}

/**
 * Get logs from local storage (development)
 * @returns {Array} Stored logs
 */
export function getStoredLogs() {
    const storage = new LocalStorageOutput();
    return storage.getLogs();
}

/**
 * Clear stored logs (development)
 */
export function clearStoredLogs() {
    const storage = new LocalStorageOutput();
    storage.clearLogs();
}

export default Logger; 