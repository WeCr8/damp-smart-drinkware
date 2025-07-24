// DAMP Smart Drinkware - Google-Level Performance Monitoring System
// Advanced Web Performance with Core Web Vitals & Auto-Optimization
// Copyright 2025 WeCr8 Solutions LLC

class DAMPPerformanceManager {
    constructor() {
        this.metrics = {
            coreWebVitals: {
                LCP: null,
                FID: null,
                CLS: null,
                TTFB: null,
                FCP: null,
                INP: null
            },
            customMetrics: {
                pageLoadTime: null,
                resourceLoadTime: {},
                componentLoadTime: {},
                interactionLatency: [],
                memoryUsage: null,
                connectionType: null
            },
            optimizations: {
                appliedOptimizations: [],
                performanceScore: null,
                recommendations: []
            }
        };

        this.performanceObserver = null;
        this.resizeObserver = null;
        this.intersectionObserver = null;
        this.hotReloadEnabled = false;
        this.performanceBudget = null;
        this.optimizationQueue = [];
        
        this.init();
    }

    async init() {
        console.log('[DAMP Performance] Initializing Google-level performance monitoring...');
        
        try {
            await this.setupPerformanceObservers();
            await this.loadPerformanceBudget();
            await this.setupHotReload();
            await this.initializeOptimizations();
            await this.startPerformanceMonitoring();
            
            console.log('[DAMP Performance] Advanced performance monitoring active');
        } catch (error) {
            console.error('[DAMP Performance] Initialization failed:', error);
        }
    }

    // === CORE WEB VITALS MONITORING ===
    async setupPerformanceObservers() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window && 'largest-contentful-paint' in PerformanceObserver.supportedEntryTypes) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.coreWebVitals.LCP = lastEntry.startTime;
                this.evaluateMetric('LCP', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // First Input Delay (FID) & Interaction to Next Paint (INP)
        if ('PerformanceObserver' in window && 'first-input' in PerformanceObserver.supportedEntryTypes) {
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.coreWebVitals.FID = entry.processingStart - entry.startTime;
                    this.evaluateMetric('FID', this.metrics.coreWebVitals.FID);
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        }

        // Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window && 'layout-shift' in PerformanceObserver.supportedEntryTypes) {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.coreWebVitals.CLS = clsValue;
                this.evaluateMetric('CLS', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }

        // Time to First Byte (TTFB)
        if ('PerformanceObserver' in window && 'navigation' in PerformanceObserver.supportedEntryTypes) {
            const navigationObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.coreWebVitals.TTFB = entry.responseStart - entry.requestStart;
                    this.metrics.coreWebVitals.FCP = entry.loadEventEnd - entry.loadEventStart;
                    this.evaluateMetric('TTFB', this.metrics.coreWebVitals.TTFB);
                }
            });
            navigationObserver.observe({ entryTypes: ['navigation'] });
        }

        // Resource timing for detailed analysis
        if ('PerformanceObserver' in window && 'resource' in PerformanceObserver.supportedEntryTypes) {
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackResourcePerformance(entry);
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
        }
    }

    // === INTELLIGENT PERFORMANCE EVALUATION ===
    evaluateMetric(metricName, value) {
        const thresholds = {
            LCP: { good: 2500, needsImprovement: 4000 },
            FID: { good: 100, needsImprovement: 300 },
            CLS: { good: 0.1, needsImprovement: 0.25 },
            TTFB: { good: 800, needsImprovement: 1800 },
            FCP: { good: 1800, needsImprovement: 3000 }
        };

        const threshold = thresholds[metricName];
        if (!threshold) return;

        let status = 'poor';
        if (value <= threshold.good) {
            status = 'good';
        } else if (value <= threshold.needsImprovement) {
            status = 'needs-improvement';
        }

        // Trigger automatic optimizations for poor metrics
        if (status === 'poor') {
            this.triggerAutoOptimization(metricName, value);
        }

        // Report to analytics
        this.reportMetric(metricName, value, status);
    }

    // === AUTOMATIC OPTIMIZATION SYSTEM ===
    async triggerAutoOptimization(metricName, value) {
        console.log(`[DAMP Performance] Poor ${metricName} detected (${value}), triggering optimizations...`);

        const optimizations = this.getOptimizationsForMetric(metricName);
        
        for (const optimization of optimizations) {
            if (!this.metrics.optimizations.appliedOptimizations.includes(optimization.id)) {
                await this.applyOptimization(optimization);
            }
        }
    }

    getOptimizationsForMetric(metricName) {
        const optimizationMap = {
            LCP: [
                { id: 'preload-lcp-image', priority: 'high', action: 'preloadLCPImage' },
                { id: 'optimize-critical-css', priority: 'high', action: 'optimizeCriticalCSS' },
                { id: 'reduce-server-response', priority: 'medium', action: 'optimizeServerResponse' }
            ],
            FID: [
                { id: 'defer-non-critical-js', priority: 'high', action: 'deferNonCriticalJS' },
                { id: 'optimize-main-thread', priority: 'high', action: 'optimizeMainThread' },
                { id: 'implement-code-splitting', priority: 'medium', action: 'implementCodeSplitting' }
            ],
            CLS: [
                { id: 'add-image-dimensions', priority: 'high', action: 'addImageDimensions' },
                { id: 'reserve-ad-space', priority: 'medium', action: 'reserveAdSpace' },
                { id: 'optimize-font-loading', priority: 'medium', action: 'optimizeFontLoading' }
            ],
            TTFB: [
                { id: 'enable-compression', priority: 'high', action: 'enableCompression' },
                { id: 'optimize-database', priority: 'medium', action: 'optimizeDatabase' },
                { id: 'implement-caching', priority: 'high', action: 'implementCaching' }
            ]
        };

        return optimizationMap[metricName] || [];
    }

    async applyOptimization(optimization) {
        try {
            console.log(`[DAMP Performance] Applying optimization: ${optimization.id}`);
            
            switch (optimization.action) {
                case 'preloadLCPImage':
                    await this.preloadLCPImage();
                    break;
                case 'optimizeCriticalCSS':
                    await this.optimizeCriticalCSS();
                    break;
                case 'deferNonCriticalJS':
                    await this.deferNonCriticalJS();
                    break;
                case 'addImageDimensions':
                    await this.addImageDimensions();
                    break;
                case 'optimizeFontLoading':
                    await this.optimizeFontLoading();
                    break;
                default:
                    console.warn(`[DAMP Performance] Unknown optimization: ${optimization.action}`);
            }

            this.metrics.optimizations.appliedOptimizations.push(optimization.id);
            
        } catch (error) {
            console.error(`[DAMP Performance] Failed to apply optimization ${optimization.id}:`, error);
        }
    }

    // === SPECIFIC OPTIMIZATION IMPLEMENTATIONS ===
    async preloadLCPImage() {
        // Find the LCP element and preload its image
        const images = document.querySelectorAll('img');
        const lcpImage = Array.from(images).find(img => {
            const rect = img.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.left < window.innerWidth;
        });

        if (lcpImage && lcpImage.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = lcpImage.src;
            document.head.appendChild(link);
            
            console.log('[DAMP Performance] Preloaded LCP image:', lcpImage.src);
        }
    }

    async optimizeCriticalCSS() {
        // Move critical CSS inline and defer non-critical CSS
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        for (const stylesheet of stylesheets) {
            if (!stylesheet.href.includes('critical') && !stylesheet.href.includes('main')) {
                stylesheet.media = 'print';
                stylesheet.onload = function() {
                    this.media = 'all';
                };
            }
        }
        
        console.log('[DAMP Performance] Optimized critical CSS loading');
    }

    async deferNonCriticalJS() {
        // Defer JavaScript that's not critical for initial render
        const scripts = document.querySelectorAll('script[src]');
        
        for (const script of scripts) {
            if (!script.src.includes('critical') && 
                !script.src.includes('header') && 
                !script.src.includes('scripts')) {
                script.defer = true;
            }
        }
        
        console.log('[DAMP Performance] Deferred non-critical JavaScript');
    }

    async addImageDimensions() {
        // Add width and height attributes to images to prevent CLS
        const images = document.querySelectorAll('img:not([width]):not([height])');
        
        for (const img of images) {
            img.onload = function() {
                if (!this.width || !this.height) {
                    this.width = this.naturalWidth;
                    this.height = this.naturalHeight;
                }
            };
        }
        
        console.log(`[DAMP Performance] Added dimensions to ${images.length} images`);
    }

    async optimizeFontLoading() {
        // Implement font-display: swap for better font loading
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
        
        // Preload critical fonts
        const criticalFonts = [
            '/assets/fonts/primary-font.woff2',
            '/assets/fonts/secondary-font.woff2'
        ];
        
        for (const fontUrl of criticalFonts) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = fontUrl;
            document.head.appendChild(link);
        }
        
        console.log('[DAMP Performance] Optimized font loading');
    }

    // === HOT RELOAD SYSTEM FOR DEVELOPMENT ===
    async setupHotReload() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.hotReloadEnabled = true;
            
            // Listen for hot reload messages from service worker
            if ('BroadcastChannel' in window) {
                const hotReloadChannel = new BroadcastChannel('damp-hot-reload');
                hotReloadChannel.onmessage = (event) => {
                    this.handleHotReload(event.data);
                };
            }
            
            // File system watching (if available)
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'HMR_ENABLE'
                });
            }
            
            console.log('[DAMP Performance] Hot Module Replacement enabled');
        }
    }

    handleHotReload(data) {
        const { type, url, timestamp } = data;
        
        if (type === 'HMR_UPDATE') {
            console.log(`[DAMP HMR] Hot reloading: ${url}`);
            
            // Determine what to reload based on file type
            if (url.includes('.css')) {
                this.hotReloadCSS(url);
            } else if (url.includes('.js')) {
                this.hotReloadJS(url);
            } else if (url.includes('.html')) {
                this.hotReloadHTML();
            }
            
            // Re-measure performance after hot reload
            setTimeout(() => {
                this.remeasurePerformance();
            }, 1000);
        }
    }

    hotReloadCSS(url) {
        const links = document.querySelectorAll(`link[href*="${url.split('/').pop()}"]`);
        links.forEach(link => {
            const newLink = link.cloneNode();
            newLink.href = url + '?t=' + Date.now();
            newLink.onload = () => link.remove();
            link.parentNode.insertBefore(newLink, link.nextSibling);
        });
    }

    hotReloadJS(url) {
        // For JavaScript, we need to be more careful
        // This is a simplified version - production would use more sophisticated HMR
        if (url.includes('components/')) {
            // Reload specific components
            const componentName = url.split('/').pop().replace('.js', '');
            this.reloadComponent(componentName);
        } else {
            // Full page reload for main scripts
            window.location.reload();
        }
    }

    hotReloadHTML() {
        // For HTML changes, do a soft reload of content
        fetch(window.location.href, { cache: 'no-cache' })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(html, 'text/html');
                
                // Update main content without full reload
                const mainContent = document.querySelector('main');
                const newMainContent = newDoc.querySelector('main');
                
                if (mainContent && newMainContent) {
                    mainContent.innerHTML = newMainContent.innerHTML;
                    this.reinitializeComponents();
                }
            });
    }

    // === RESOURCE PERFORMANCE TRACKING ===
    trackResourcePerformance(entry) {
        const resourceType = this.getResourceType(entry.name);
        const loadTime = entry.responseEnd - entry.startTime;
        
        if (!this.metrics.customMetrics.resourceLoadTime[resourceType]) {
            this.metrics.customMetrics.resourceLoadTime[resourceType] = [];
        }
        
        this.metrics.customMetrics.resourceLoadTime[resourceType].push({
            url: entry.name,
            loadTime: loadTime,
            size: entry.transferSize,
            cached: entry.transferSize === 0,
            timestamp: Date.now()
        });

        // Check against performance budget
        if (this.performanceBudget) {
            this.checkResourceBudget(resourceType, entry);
        }
    }

    getResourceType(url) {
        if (url.match(/\.(css)$/)) return 'stylesheet';
        if (url.match(/\.(js)$/)) return 'script';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
        if (url.includes('/api/')) return 'api';
        return 'other';
    }

    // === PERFORMANCE BUDGET MONITORING ===
    async loadPerformanceBudget() {
        try {
            const response = await fetch('/quality/performance-budget.json');
            this.performanceBudget = await response.json();
            console.log('[DAMP Performance] Performance budget loaded');
        } catch (error) {
            console.warn('[DAMP Performance] Could not load performance budget:', error);
        }
    }

    checkResourceBudget(resourceType, entry) {
        if (!this.performanceBudget || !this.performanceBudget.budget) return;

        const budget = this.performanceBudget.budget[0];
        const resourceBudget = budget.resourceSizes?.find(r => r.resourceType === resourceType);
        
        if (resourceBudget && entry.transferSize > resourceBudget.budget * 1024) {
            console.warn(`[DAMP Performance] Resource budget exceeded for ${resourceType}:`, {
                url: entry.name,
                size: entry.transferSize,
                budget: resourceBudget.budget * 1024
            });
            
            this.addRecommendation({
                type: 'budget-exceeded',
                resourceType: resourceType,
                url: entry.name,
                actualSize: entry.transferSize,
                budgetSize: resourceBudget.budget * 1024
            });
        }
    }

    // === MEMORY AND CONNECTION MONITORING ===
    async startPerformanceMonitoring() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.customMetrics.memoryUsage = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
            }, 30000); // Every 30 seconds
        }

        // Monitor connection type
        if ('connection' in navigator) {
            this.metrics.customMetrics.connectionType = {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };

            navigator.connection.addEventListener('change', () => {
                this.metrics.customMetrics.connectionType = {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData,
                    timestamp: Date.now()
                };
                
                // Adjust optimizations based on connection
                this.adaptToConnection();
            });
        }

        // Long task monitoring
        if ('PerformanceObserver' in window && 'longtask' in PerformanceObserver.supportedEntryTypes) {
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.warn('[DAMP Performance] Long task detected:', {
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                    
                    if (entry.duration > 100) {
                        this.addRecommendation({
                            type: 'long-task',
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                }
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
    }

    adaptToConnection() {
        const connection = this.metrics.customMetrics.connectionType;
        
        if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            console.log('[DAMP Performance] Slow connection detected, applying optimizations...');
            
            // Reduce image quality
            this.optimizeImagesForSlowConnection();
            
            // Defer non-critical resources
            this.deferNonCriticalResources();
            
            // Enable aggressive caching
            this.enableAggressiveCaching();
        }
    }

    // === UTILITY METHODS ===
    addRecommendation(recommendation) {
        this.metrics.optimizations.recommendations.push({
            ...recommendation,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
    }

    reportMetric(metricName, value, status) {
        // Report to analytics if available
        if (window.gtag) {
            window.gtag('event', 'core_web_vital', {
                event_category: 'Performance',
                event_label: metricName,
                value: Math.round(value),
                custom_map: { dimension1: status }
            });
        }

        // Also report via custom event for other systems
        window.dispatchEvent(new CustomEvent('damp:performance:metric', {
            detail: { metricName, value, status }
        }));
    }

    remeasurePerformance() {
        // Clear previous measurements and re-measure
        this.metrics.coreWebVitals = {
            LCP: null,
            FID: null,
            CLS: null,
            TTFB: null,
            FCP: null,
            INP: null
        };
        
        // Re-setup observers
        this.setupPerformanceObservers();
    }

    // === PUBLIC API ===
    getMetrics() {
        return { ...this.metrics };
    }

    getPerformanceScore() {
        const scores = {
            LCP: this.scoreMetric('LCP', this.metrics.coreWebVitals.LCP),
            FID: this.scoreMetric('FID', this.metrics.coreWebVitals.FID),
            CLS: this.scoreMetric('CLS', this.metrics.coreWebVitals.CLS)
        };

        const validScores = Object.values(scores).filter(score => score !== null);
        return validScores.length > 0 ? 
            Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;
    }

    scoreMetric(metricName, value) {
        if (value === null) return null;

        const scoringRules = {
            LCP: { good: 2500, poor: 4000 },
            FID: { good: 100, poor: 300 },
            CLS: { good: 0.1, poor: 0.25 }
        };

        const rule = scoringRules[metricName];
        if (!rule) return null;

        if (value <= rule.good) return 100;
        if (value >= rule.poor) return 0;
        return Math.round(100 - ((value - rule.good) / (rule.poor - rule.good)) * 100);
    }

    // Manual optimization trigger
    async optimizeNow() {
        console.log('[DAMP Performance] Manual optimization triggered...');
        
        const poorMetrics = Object.entries(this.metrics.coreWebVitals)
            .filter(([name, value]) => {
                if (value === null) return false;
                const score = this.scoreMetric(name, value);
                return score !== null && score < 50;
            });

        for (const [metricName, value] of poorMetrics) {
            await this.triggerAutoOptimization(metricName, value);
        }
    }
}

// Initialize the performance manager
const dampPerformance = new DAMPPerformanceManager();

// Export for global access
window.dampPerformance = dampPerformance;

// Global functions for developer tools
window.getDampPerformanceMetrics = () => dampPerformance.getMetrics();
window.getDampPerformanceScore = () => dampPerformance.getPerformanceScore();
window.optimizeDampPerformance = () => dampPerformance.optimizeNow();

console.log('[DAMP Performance] Google-level performance monitoring initialized'); 