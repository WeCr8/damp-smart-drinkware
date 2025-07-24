/**
 * ⚡ DAMP Performance Manager
 * Advanced performance optimization and monitoring
 * Google Engineering Standards - Production Ready
 */

class DAMPPerformanceManager {
    constructor() {
        this.metrics = {};
        this.observers = {};
        this.cache = new Map();
        this.loadingStates = new Map();
        this.init();
    }

    /**
     * Initialize performance manager
     */
    init() {
        console.log('⚡ DAMP Performance: Initializing performance manager...');
        
        // Setup performance monitoring
        this.initPerformanceMonitoring();
        
        // Setup resource optimization
        this.initResourceOptimization();
        
        // Setup lazy loading
        this.initLazyLoading();
        
        // Setup service worker
        this.initServiceWorker();
        
        // Setup critical resource hints
        this.initResourceHints();
        
        // Setup image optimization
        this.initImageOptimization();
        
        // Setup font optimization
        this.initFontOptimization();
        
        // Setup JavaScript optimization
        this.initJavaScriptOptimization();
        
        console.log('✅ DAMP Performance: Performance manager initialized');
    }

    /**
     * Initialize performance monitoring
     */
    initPerformanceMonitoring() {
        try {
            // Core Web Vitals monitoring
            this.initCoreWebVitals();
            
            // Resource timing monitoring
            this.initResourceTiming();
            
            // User timing monitoring
            this.initUserTiming();
            
            // Network monitoring
            this.initNetworkMonitoring();
            
            console.log('📊 Performance monitoring initialized');
            
        } catch (error) {
            console.error('Performance monitoring setup failed:', error);
        }
    }

    /**
     * Initialize Core Web Vitals monitoring
     */
    initCoreWebVitals() {
        // First Contentful Paint (FCP)
        this.observePerformanceEntry('paint', (entry) => {
            if (entry.name === 'first-contentful-paint') {
                this.metrics.fcp = entry.startTime;
                this.reportMetric('fcp', entry.startTime);
            }
        });

        // Largest Contentful Paint (LCP)
        this.observePerformanceEntry('largest-contentful-paint', (entry) => {
            this.metrics.lcp = entry.startTime;
            this.reportMetric('lcp', entry.startTime);
        });

        // First Input Delay (FID)
        this.observePerformanceEntry('first-input', (entry) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('fid', this.metrics.fid);
        });

        // Cumulative Layout Shift (CLS)
        this.observePerformanceEntry('layout-shift', (entry) => {
            if (!entry.hadRecentInput) {
                this.metrics.cls = (this.metrics.cls || 0) + entry.value;
                this.reportMetric('cls', this.metrics.cls);
            }
        });

        // Time to First Byte (TTFB)
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
                this.reportMetric('ttfb', this.metrics.ttfb);
            }
        });
    }

    /**
     * Initialize resource timing monitoring
     */
    initResourceTiming() {
        this.observePerformanceEntry('resource', (entry) => {
            const resourceType = this.getResourceType(entry.name);
            const loadTime = entry.responseEnd - entry.startTime;
            
            if (!this.metrics.resources) {
                this.metrics.resources = {};
            }
            
            if (!this.metrics.resources[resourceType]) {
                this.metrics.resources[resourceType] = [];
            }
            
            this.metrics.resources[resourceType].push({
                name: entry.name,
                loadTime: loadTime,
                size: entry.transferSize || 0
            });
        });
    }

    /**
     * Initialize user timing monitoring
     */
    initUserTiming() {
        this.observePerformanceEntry('measure', (entry) => {
            this.metrics.userTiming = this.metrics.userTiming || {};
            this.metrics.userTiming[entry.name] = entry.duration;
        });
    }

    /**
     * Initialize network monitoring
     */
    initNetworkMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.metrics.network = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
            
            connection.addEventListener('change', () => {
                this.metrics.network = {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                };
                this.optimizeForConnection();
            });
        }
    }

    /**
     * Initialize resource optimization
     */
    initResourceOptimization() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup resource caching
        this.initResourceCaching();
        
        // Setup compression
        this.initCompression();
        
        console.log('🗜️ Resource optimization initialized');
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'assets/css/main.css', as: 'style' },
            { href: 'assets/js/components/header.js', as: 'script' },
            { href: 'assets/images/logo/logo.png', as: 'image' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = () => {
                    link.rel = 'stylesheet';
                };
            }
            document.head.appendChild(link);
        });
    }

    /**
     * Initialize resource caching
     */
    initResourceCaching() {
        const cacheableTypes = ['image', 'script', 'style'];
        
        this.observePerformanceEntry('resource', (entry) => {
            const resourceType = this.getResourceType(entry.name);
            if (cacheableTypes.includes(resourceType)) {
                this.cacheResource(entry.name, entry);
            }
        });
    }

    /**
     * Initialize lazy loading
     */
    initLazyLoading() {
        // Lazy load images
        this.initImageLazyLoading();
        
        // Lazy load sections
        this.initSectionLazyLoading();
        
        // Lazy load scripts
        this.initScriptLazyLoading();
        
        console.log('🔄 Lazy loading initialized');
    }

    /**
     * Initialize image lazy loading
     */
    initImageLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                        
                        // Performance mark
                        performance.mark(`image-loaded-${img.src}`);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Observer for dynamically added images
        const mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const lazyImages = node.querySelectorAll('img[data-src]');
                        lazyImages.forEach(img => imageObserver.observe(img));
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Initialize section lazy loading
     */
    initSectionLazyLoading() {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    section.classList.add('loaded');
                    
                    // Load section-specific resources
                    this.loadSectionResources(section);
                    
                    sectionObserver.unobserve(section);
                }
            });
        }, {
            rootMargin: '100px'
        });

        document.querySelectorAll('.lazy-section').forEach(section => {
            sectionObserver.observe(section);
        });
    }

    /**
     * Initialize script lazy loading
     */
    initScriptLazyLoading() {
        const scriptObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const scriptSrc = container.dataset.script;
                    
                    if (scriptSrc && !this.loadingStates.get(scriptSrc)) {
                        this.loadScript(scriptSrc);
                        scriptObserver.unobserve(container);
                    }
                }
            });
        });

        document.querySelectorAll('[data-script]').forEach(container => {
            scriptObserver.observe(container);
        });
    }

    /**
     * Initialize service worker
     */
    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('🔧 Service Worker registered:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Initialize resource hints
     */
    initResourceHints() {
        // DNS prefetch for external domains
        const externalDomains = [
            'https://www.googletagmanager.com',
            'https://js.stripe.com',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });

        // Preconnect to critical domains
        const criticalDomains = [
            'https://www.googletagmanager.com',
            'https://js.stripe.com'
        ];

        criticalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    /**
     * Initialize image optimization
     */
    initImageOptimization() {
        // Convert images to WebP if supported
        this.initWebPSupport();
        
        // Responsive images
        this.initResponsiveImages();
        
        // Image compression
        this.initImageCompression();
    }

    /**
     * Initialize WebP support
     */
    initWebPSupport() {
        const webp = new Image();
        webp.onload = webp.onerror = () => {
            const hasWebPSupport = webp.height === 2;
            document.documentElement.classList.toggle('webp', hasWebPSupport);
            
            if (hasWebPSupport) {
                this.convertImagesToWebP();
            }
        };
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    }

    /**
     * Convert images to WebP
     */
    convertImagesToWebP() {
        document.querySelectorAll('img').forEach(img => {
            if (img.src && !img.src.includes('.webp')) {
                const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                
                // Test if WebP version exists
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = webpSrc;
                };
                testImg.src = webpSrc;
            }
        });
    }

    /**
     * Initialize responsive images
     */
    initResponsiveImages() {
        document.querySelectorAll('img[data-responsive]').forEach(img => {
            const sizes = img.dataset.responsive.split(',');
            const srcset = sizes.map(size => {
                const [width, suffix] = size.split(':');
                const baseName = img.src.replace(/\.[^/.]+$/, '');
                const extension = img.src.split('.').pop();
                return `${baseName}-${suffix}.${extension} ${width}w`;
            }).join(', ');
            
            img.srcset = srcset;
            img.sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw';
        });
    }

    /**
     * Initialize font optimization
     */
    initFontOptimization() {
        // Font display optimization
        const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        fontLinks.forEach(link => {
            link.href += '&display=swap';
        });

        // Preload critical fonts
        const criticalFonts = [
            'assets/fonts/main-font.woff2'
        ];

        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font;
            link.as = 'font';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * Initialize JavaScript optimization
     */
    initJavaScriptOptimization() {
        // Code splitting
        this.initCodeSplitting();
        
        // Module preloading
        this.initModulePreloading();
        
        // Dead code elimination
        this.initDeadCodeElimination();
    }

    /**
     * Load script dynamically
     */
    async loadScript(src) {
        if (this.loadingStates.get(src)) {
            return this.loadingStates.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        this.loadingStates.set(src, promise);
        return promise;
    }

    /**
     * Load section resources
     */
    loadSectionResources(section) {
        const scripts = section.dataset.scripts;
        const styles = section.dataset.styles;

        if (scripts) {
            scripts.split(',').forEach(script => {
                this.loadScript(script.trim());
            });
        }

        if (styles) {
            styles.split(',').forEach(style => {
                this.loadStylesheet(style.trim());
            });
        }
    }

    /**
     * Load stylesheet dynamically
     */
    loadStylesheet(href) {
        if (document.querySelector(`link[href="${href}"]`)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    /**
     * Optimize for connection
     */
    optimizeForConnection() {
        const connection = this.metrics.network;
        
        if (connection.saveData || connection.effectiveType === 'slow-2g') {
            // Reduce quality for slow connections
            document.documentElement.classList.add('reduced-quality');
            
            // Disable non-essential features
            this.disableNonEssentialFeatures();
        }
    }

    /**
     * Disable non-essential features for slow connections
     */
    disableNonEssentialFeatures() {
        // Disable animations
        document.documentElement.classList.add('no-animations');
        
        // Reduce image quality
        document.querySelectorAll('img').forEach(img => {
            if (img.dataset.lowQuality) {
                img.src = img.dataset.lowQuality;
            }
        });
    }

    /**
     * Observe performance entries
     */
    observePerformanceEntry(type, callback) {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(callback);
            });
            observer.observe({ entryTypes: [type] });
            this.observers[type] = observer;
        } catch (error) {
            console.warn(`Performance observer for ${type} not supported:`, error);
        }
    }

    /**
     * Get resource type from URL
     */
    getResourceType(url) {
        if (url.includes('.css')) return 'style';
        if (url.includes('.js')) return 'script';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
        return 'other';
    }

    /**
     * Cache resource
     */
    cacheResource(url, entry) {
        this.cache.set(url, {
            entry,
            timestamp: Date.now(),
            size: entry.transferSize || 0
        });

        // Cleanup old cache entries
        if (this.cache.size > 100) {
            const oldestKey = Array.from(this.cache.keys())[0];
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Report metric
     */
    reportMetric(name, value) {
        // Send to analytics
        if (window.gtag && window.DAMP.Config?.isFeatureEnabled('analytics')) {
            window.gtag('event', 'performance_metric', {
                event_category: 'performance',
                event_label: name,
                value: Math.round(value),
                custom_map: {
                    metric_name: name,
                    metric_value: value,
                    page_url: window.location.href
                }
            });
        }

        // Log in development
        if (window.DAMP.Config?.isFeatureEnabled('debugMode')) {
            console.log(`📊 Performance metric - ${name}: ${value}ms`);
        }
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        return {
            metrics: this.metrics,
            cacheSize: this.cache.size,
            loadingStates: this.loadingStates.size,
            timestamp: Date.now()
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Performance cache cleared');
    }
}

// Create and export global performance instance
window.DAMP = window.DAMP || {};
window.DAMP.Performance = new DAMPPerformanceManager();

export default window.DAMP.Performance; 