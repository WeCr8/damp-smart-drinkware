/**
 * Professional Application Monitoring
 * Real-time performance and error tracking
 */

class DAMPMonitoring {
    constructor() {
        this.config = {
            enableErrorTracking: true,
            enablePerformanceTracking: true,
            enableUserTracking: true,
            sampleRate: 1.0,
            endpoint: '/api/monitoring'
        };
        
        this.errors = [];
        this.performance = {};
        this.userActions = [];
        
        this.init();
    }

    init() {
        this.setupErrorTracking();
        this.setupPerformanceTracking();
        this.setupUserTracking();
        this.startReporting();
        
        console.log('🔍 DAMP Monitoring initialized');
    }

    setupErrorTracking() {
        if (!this.config.enableErrorTracking) return;
        
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                timestamp: Date.now(),
                url: window.location.href
            });
        });
    }

    trackError(error) {
        this.errors.push(error);
        
        // Immediate reporting for critical errors
        if (this.isCriticalError(error)) {
            this.reportImmediately({ errors: [error] });
        }
        
        console.error('Error tracked:', error);
    }

    isCriticalError(error) {
        const criticalPatterns = [
            /payment/i,
            /checkout/i,
            /order/i,
            /security/i
        ];
        
        return criticalPatterns.some(pattern => 
            pattern.test(error.message) || pattern.test(error.filename)
        );
    }

    async reportImmediately(data) {
        try {
            await fetch(this.config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    priority: 'high',
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.warn('Failed to report critical error:', error);
        }
    }

    // Export monitoring data for debugging
    getReport() {
        return {
            errors: this.errors,
            performance: this.performance,
            userActions: this.userActions,
            timestamp: Date.now(),
            session: this.getSessionId()
        };
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('damp_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('damp_session_id', sessionId);
        }
        return sessionId;
    }
}

// Initialize monitoring
window.dampMonitoring = new DAMPMonitoring();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPMonitoring;
} 