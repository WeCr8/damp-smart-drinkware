// DAMP Performance Monitor - Google Engineering Best Practices
// Monitors Core Web Vitals, performance metrics, and user experience

class DAMPPerformanceMonitor {
    constructor(options = {}) {
        this.options = {
            enableAnalytics: true,
            enableConsoleLogging: true,
            enableBeaconAPI: true,
            sampleRate: 1.0,
            endpoint: '/api/analytics/performance',
            debug: window.location.hostname === 'localhost',
            ...options
        };

        this.metrics = {
            // Core Web Vitals
            LCP: null,
            FID: null,
            CLS: null,
            
            // Other Performance Metrics
            FCP: null,
            TTFB: null,
            TTI: null,
            
            // Custom Metrics
            navigationStart: null,
            loadComplete: null,
            
            // Resource Timing
            resources: [],
            
            // User Experience
            visibilityChanges: 0,
            scrollDepth: 0,
            timeOnPage: 0,
            
            // Device Info
            deviceType: null,
            connectionType: null,
            
            // Errors
            jsErrors: [],
            
            timestamp: Date.now()
        };

        this.observers = [];
        this.startTime = performance.now();
        this.isHidden = document.hidden;
        this.pageLoadTime = null;
        
        this.init();
    }

    init() {
        this.detectDevice();
        this.detectConnection();
        this.setupCoreWebVitals();
        this.setupNavigationTiming();
        this.setupResourceTiming();
        this.setupUserExperience();
        this.setupErrorTracking();
        this.setupVisibilityAPI();
        this.setupBeforeUnload();
        
        if (this.options.debug) {
            this.setupDebugMode();
        }
    }

    // Core Web Vitals Monitoring
    setupCoreWebVitals() {
        if (!('PerformanceObserver' in window)) {
            console.warn('PerformanceObserver not supported');
            return;
        }

        try {
            // Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.LCP = {
                    value: lastEntry.startTime,
                    element: lastEntry.element,
                    url: lastEntry.url,
                    timestamp: Date.now()
                };
                
                this.trackWebVital('LCP', lastEntry.startTime);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(lcpObserver);

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.FID = {
                        value: entry.processingStart - entry.startTime,
                        startTime: entry.startTime,
                        processingStart: entry.processingStart,
                        timestamp: Date.now()
                    };
                    
                    this.trackWebVital('FID', entry.processingStart - entry.startTime);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.push(fidObserver);

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            let clsEntries = [];
            
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                });
                
                this.metrics.CLS = {
                    value: clsValue,
                    entries: clsEntries,
                    timestamp: Date.now()
                };
                
                this.trackWebVital('CLS', clsValue);
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(clsObserver);

            // First Contentful Paint (FCP)
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.FCP = {
                            value: entry.startTime,
                            timestamp: Date.now()
                        };
                        
                        this.trackWebVital('FCP', entry.startTime);
                    }
                });
            });
            
            fcpObserver.observe({ entryTypes: ['paint'] });
            this.observers.push(fcpObserver);

        } catch (error) {
            console.error('Failed to setup Core Web Vitals monitoring:', error);
        }
    }

    // Navigation Timing
    setupNavigationTiming() {
        if (!('performance' in window) || !performance.timing) {
            return;
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const navigation = performance.navigation;
                
                this.metrics.navigationStart = timing.navigationStart;
                this.metrics.loadComplete = timing.loadEventEnd;
                this.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                
                // Calculate TTFB
                this.metrics.TTFB = {
                    value: timing.responseStart - timing.navigationStart,
                    timestamp: Date.now()
                };
                
                // Track navigation type
                this.metrics.navigationType = this.getNavigationType(navigation.type);
                
                // Calculate additional metrics
                this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
                this.metrics.domInteractive = timing.domInteractive - timing.navigationStart;
                this.metrics.domComplete = timing.domComplete - timing.navigationStart;
                
                this.trackMetric('PageLoad', this.pageLoadTime);
                this.trackMetric('TTFB', this.metrics.TTFB.value);
                
            }, 0);
        });
    }

    // Resource Timing
    setupResourceTiming() {
        if (!('performance' in window) || !performance.getEntriesByType) {
            return;
        }

        const resourceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            
            entries.forEach(entry => {
                const resourceData = {
                    name: entry.name,
                    type: entry.initiatorType,
                    startTime: entry.startTime,
                    duration: entry.duration,
                    size: entry.transferSize,
                    cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
                    timestamp: Date.now()
                };
                
                this.metrics.resources.push(resourceData);
                
                // Track slow resources
                if (entry.duration > 1000) {
                    this.trackMetric('SlowResource', entry.duration, {
                        resource: entry.name,
                        type: entry.initiatorType
                    });
                }
                
                // Track large resources
                if (entry.transferSize > 500000) { // 500KB
                    this.trackMetric('LargeResource', entry.transferSize, {
                        resource: entry.name,
                        type: entry.initiatorType
                    });
                }
            });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
    }

    // User Experience Monitoring
    setupUserExperience() {
        let scrollDepth = 0;
        let maxScrollDepth = 0;
        
        // Scroll depth tracking
        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollDepth = Math.round((scrollTop / documentHeight) * 100);
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.metrics.scrollDepth = maxScrollDepth;
                
                // Track milestone scroll depths
                if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
                    this.trackMetric('ScrollDepth', 25);
                } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
                    this.trackMetric('ScrollDepth', 50);
                } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
                    this.trackMetric('ScrollDepth', 75);
                } else if (maxScrollDepth >= 100) {
                    this.trackMetric('ScrollDepth', 100);
                }
            }
        };
        
        // Throttled scroll event
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(trackScrollDepth, 100);
        });
        
        // Click tracking
        document.addEventListener('click', (event) => {
            const target = event.target;
            const tagName = target.tagName.toLowerCase();
            
            if (['a', 'button', 'input'].includes(tagName)) {
                this.trackMetric('Click', 1, {
                    element: tagName,
                    text: target.textContent?.substring(0, 100),
                    href: target.href,
                    id: target.id,
                    className: target.className
                });
            }
        });
        
        // Form interactions
        document.addEventListener('submit', (event) => {
            this.trackMetric('FormSubmit', 1, {
                form: event.target.id || event.target.className,
                action: event.target.action
            });
        });
        
        // Time on page tracking
        setInterval(() => {
            if (!this.isHidden) {
                this.metrics.timeOnPage = Math.round((performance.now() - this.startTime) / 1000);
            }
        }, 1000);
    }

    // Error Tracking
    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            const error = {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            };
            
            this.metrics.jsErrors.push(error);
            this.trackMetric('JSError', 1, error);
        });
        
        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const error = {
                reason: event.reason,
                promise: event.promise,
                timestamp: Date.now()
            };
            
            this.metrics.jsErrors.push(error);
            this.trackMetric('UnhandledRejection', 1, error);
        });
    }

    // Visibility API
    setupVisibilityAPI() {
        document.addEventListener('visibilitychange', () => {
            this.isHidden = document.hidden;
            
            if (document.hidden) {
                this.metrics.visibilityChanges++;
                this.trackMetric('PageHidden', 1);
            } else {
                this.trackMetric('PageVisible', 1);
            }
        });
    }

    // Before Unload - Send final metrics
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            this.sendMetrics(true);
        });
        
        // Send metrics periodically
        setInterval(() => {
            this.sendMetrics();
        }, 30000); // Every 30 seconds
    }

    // Device Detection
    detectDevice() {
        const userAgent = navigator.userAgent;
        let deviceType = 'desktop';
        
        if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            deviceType = 'mobile';
        } else if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
            deviceType = 'tablet';
        }
        
        this.metrics.deviceType = deviceType;
        this.metrics.userAgent = userAgent;
        this.metrics.screen = {
            width: screen.width,
            height: screen.height,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    // Connection Detection
    detectConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            this.metrics.connectionType = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
        }
    }

    // Navigation Type Helper
    getNavigationType(type) {
        switch (type) {
            case 0: return 'navigate';
            case 1: return 'reload';
            case 2: return 'back_forward';
            default: return 'unknown';
        }
    }

    // Track Web Vital
    trackWebVital(name, value) {
        const rating = this.getWebVitalRating(name, value);
        
        if (this.options.enableConsoleLogging) {
            console.log(`${name}: ${Math.round(value)}ms (${rating})`);
        }
        
        this.trackMetric(name, value, { rating });
    }

    // Get Web Vital Rating
    getWebVitalRating(name, value) {
        const thresholds = {
            LCP: [2500, 4000],
            FID: [100, 300],
            CLS: [0.1, 0.25],
            FCP: [1800, 3000],
            TTFB: [800, 1800]
        };
        
        const [good, needsImprovement] = thresholds[name] || [0, 0];
        
        if (value <= good) return 'good';
        if (value <= needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    // Track Generic Metric
    trackMetric(name, value, data = {}) {
        const metric = {
            name,
            value,
            data,
            timestamp: Date.now(),
            url: window.location.href,
            ...this.getSessionInfo()
        };
        
        // Send to analytics
        if (this.options.enableAnalytics && Math.random() <= this.options.sampleRate) {
            this.sendToAnalytics(metric);
        }
        
        // Console logging
        if (this.options.enableConsoleLogging) {
            console.log(`Metric: ${name}`, value, data);
        }
    }

    // Session Information
    getSessionInfo() {
        return {
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            timestamp: Date.now(),
            url: window.location.href,
            referrer: document.referrer,
            deviceType: this.metrics.deviceType,
            connectionType: this.metrics.connectionType
        };
    }

    // Get or create session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('damp-session-id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('damp-session-id', sessionId);
        }
        return sessionId;
    }

    // Get or create user ID
    getUserId() {
        let userId = localStorage.getItem('damp-user-id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('damp-user-id', userId);
        }
        return userId;
    }

    // Send to Analytics
    sendToAnalytics(metric) {
        if (typeof gtag !== 'undefined') {
            gtag('event', metric.name, {
                event_category: 'Performance',
                event_label: metric.name,
                value: Math.round(metric.value),
                custom_map: {
                    metric_data: JSON.stringify(metric.data)
                }
            });
        }
    }

    // Send Metrics to Server
    sendMetrics(isBeforeUnload = false) {
        const metricsData = {
            ...this.metrics,
            sessionInfo: this.getSessionInfo(),
            isBeforeUnload
        };
        
        if (this.options.enableBeaconAPI && 'sendBeacon' in navigator) {
            navigator.sendBeacon(
                this.options.endpoint,
                JSON.stringify(metricsData)
            );
        } else {
            // Fallback to fetch
            if (!isBeforeUnload) {
                fetch(this.options.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(metricsData)
                }).catch(error => {
                    console.error('Failed to send metrics:', error);
                });
            }
        }
    }

    // Debug Mode
    setupDebugMode() {
        // Add debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'damp-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border-radius: 5px;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        document.body.appendChild(debugPanel);
        
        // Update debug panel
        const updateDebugPanel = () => {
            const html = `
                <strong>Performance Metrics</strong><br>
                LCP: ${this.metrics.LCP?.value ? Math.round(this.metrics.LCP.value) + 'ms' : 'N/A'}<br>
                FID: ${this.metrics.FID?.value ? Math.round(this.metrics.FID.value) + 'ms' : 'N/A'}<br>
                CLS: ${this.metrics.CLS?.value ? this.metrics.CLS.value.toFixed(3) : 'N/A'}<br>
                FCP: ${this.metrics.FCP?.value ? Math.round(this.metrics.FCP.value) + 'ms' : 'N/A'}<br>
                TTFB: ${this.metrics.TTFB?.value ? Math.round(this.metrics.TTFB.value) + 'ms' : 'N/A'}<br>
                <br>
                <strong>User Experience</strong><br>
                Scroll Depth: ${this.metrics.scrollDepth}%<br>
                Time on Page: ${this.metrics.timeOnPage}s<br>
                Visibility Changes: ${this.metrics.visibilityChanges}<br>
                JS Errors: ${this.metrics.jsErrors.length}<br>
                <br>
                <strong>Resources</strong><br>
                Loaded: ${this.metrics.resources.length}<br>
                <br>
                <strong>Device</strong><br>
                Type: ${this.metrics.deviceType}<br>
                Connection: ${this.metrics.connectionType?.effectiveType || 'N/A'}<br>
            `;
            
            debugPanel.innerHTML = html;
        };
        
        setInterval(updateDebugPanel, 1000);
        
        // Add global debug functions
        window.dampPerformance = {
            getMetrics: () => this.metrics,
            sendMetrics: () => this.sendMetrics(),
            clearMetrics: () => this.clearMetrics()
        };
    }

    // Clear Metrics
    clearMetrics() {
        this.metrics = {
            LCP: null,
            FID: null,
            CLS: null,
            FCP: null,
            TTFB: null,
            TTI: null,
            navigationStart: null,
            loadComplete: null,
            resources: [],
            visibilityChanges: 0,
            scrollDepth: 0,
            timeOnPage: 0,
            deviceType: null,
            connectionType: null,
            jsErrors: [],
            timestamp: Date.now()
        };
    }

    // Get Performance Report
    getPerformanceReport() {
        return {
            coreWebVitals: {
                LCP: this.metrics.LCP,
                FID: this.metrics.FID,
                CLS: this.metrics.CLS
            },
            otherMetrics: {
                FCP: this.metrics.FCP,
                TTFB: this.metrics.TTFB,
                pageLoadTime: this.pageLoadTime
            },
            userExperience: {
                scrollDepth: this.metrics.scrollDepth,
                timeOnPage: this.metrics.timeOnPage,
                visibilityChanges: this.metrics.visibilityChanges
            },
            resources: this.metrics.resources,
            errors: this.metrics.jsErrors,
            device: {
                type: this.metrics.deviceType,
                connection: this.metrics.connectionType,
                screen: this.metrics.screen
            }
        };
    }

    // Cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.sendMetrics(true);
        
        if (this.options.debug) {
            const debugPanel = document.getElementById('damp-debug-panel');
            if (debugPanel) {
                debugPanel.remove();
            }
        }
    }
}

// Auto-initialize performance monitoring
let dampPerformanceMonitor;

function initPerformanceMonitoring(options = {}) {
    dampPerformanceMonitor = new DAMPPerformanceMonitor(options);
    window.dampPerformanceMonitor = dampPerformanceMonitor;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
} else {
    initPerformanceMonitoring();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPPerformanceMonitor;
}

console.log('DAMP Performance Monitor initialized'); 