// DAMP Smart Drinkware - Google-Level Critical Path Optimizer
// Advanced Resource Loading & Critical Path Optimization
// Copyright 2025 WeCr8 Solutions LLC

class DAMPCriticalPathOptimizer {
    constructor() {
        this.criticalResources = new Set();
        this.resourcePriorities = new Map();
        this.loadingQueue = [];
        this.intersectionObserver = null;
        this.networkState = null;
        this.deviceCapabilities = null;
        this.preloadCache = new Map();
        this.resourceHints = new Map();
        this.loadingStrategy = 'adaptive';
        
        this.init();
    }

    async init() {
        console.log('[DAMP Critical Path] Initializing Google-level critical path optimization...');
        
        try {
            await this.analyzeDeviceCapabilities();
            await this.detectNetworkConditions();
            await this.identifyCriticalResources();
            await this.setupIntelligentPreloading();
            await this.initializeResourceHints();
            await this.optimizeCriticalPath();
            
            console.log('[DAMP Critical Path] Advanced optimization system active');
        } catch (error) {
            console.error('[DAMP Critical Path] Initialization failed:', error);
        }
    }

    // === DEVICE & NETWORK ANALYSIS ===
    async analyzeDeviceCapabilities() {
        this.deviceCapabilities = {
            // Memory
            memory: navigator.deviceMemory || 4, // GB, fallback to 4GB
            
            // CPU cores
            cores: navigator.hardwareConcurrency || 4,
            
            // Connection
            connectionType: navigator.connection ? navigator.connection.effectiveType : '4g',
            
            // Screen
            screenSize: {
                width: screen.width,
                height: screen.height,
                pixelRatio: window.devicePixelRatio || 1
            },
            
            // Browser capabilities
            supportsWebP: await this.checkWebPSupport(),
            supportsAVIF: await this.checkAVIFSupport(),
            supportsModuleScript: 'noModule' in HTMLScriptElement.prototype,
            supportsIntersectionObserver: 'IntersectionObserver' in window,
            supportsServiceWorker: 'serviceWorker' in navigator,
            
            // Performance tier (based on memory and cores)
            performanceTier: this.calculatePerformanceTier()
        };

        console.log('[DAMP Critical Path] Device capabilities analyzed:', this.deviceCapabilities);
    }

    calculatePerformanceTier() {
        const memory = this.deviceCapabilities?.memory || navigator.deviceMemory || 4;
        const cores = this.deviceCapabilities?.cores || navigator.hardwareConcurrency || 4;
        
        if (memory >= 8 && cores >= 8) return 'high';
        if (memory >= 4 && cores >= 4) return 'medium';
        return 'low';
    }

    async detectNetworkConditions() {
        this.networkState = {
            effectiveType: '4g',
            downlink: 10,
            rtt: 100,
            saveData: false
        };

        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.networkState = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };

            // Listen for network changes
            connection.addEventListener('change', () => {
                this.networkState = {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                };
                
                this.adaptToNetworkChange();
            });
        }

        // Determine loading strategy based on network
        this.loadingStrategy = this.determineLoadingStrategy();
        
        console.log('[DAMP Critical Path] Network conditions detected:', this.networkState);
    }

    determineLoadingStrategy() {
        const { effectiveType, saveData } = this.networkState;
        const { performanceTier } = this.deviceCapabilities;
        
        if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
            return 'conservative';
        }
        
        if (performanceTier === 'high' && (effectiveType === '4g' || effectiveType === '5g')) {
            return 'aggressive';
        }
        
        return 'adaptive';
    }

    // === CRITICAL RESOURCE IDENTIFICATION ===
    async identifyCriticalResources() {
        // Above-the-fold content analysis
        const viewportHeight = window.innerHeight;
        const criticalElements = [];

        // Find elements in critical viewport
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < viewportHeight && rect.height > 0) {
                criticalElements.push(element);
            }
        });

        // Analyze critical resources
        criticalElements.forEach(element => {
            this.analyzeCriticalElement(element);
        });

        // Add core application resources
        this.addCoreResources();
        
        console.log('[DAMP Critical Path] Critical resources identified:', Array.from(this.criticalResources));
    }

    analyzeCriticalElement(element) {
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
            case 'img':
                if (element.src) {
                    this.addCriticalResource(element.src, 'image', 'high');
                }
                break;
                
            case 'link':
                if (element.rel === 'stylesheet') {
                    this.addCriticalResource(element.href, 'stylesheet', 'critical');
                }
                break;
                
            case 'script':
                if (element.src) {
                    const priority = element.dataset.critical === 'true' ? 'critical' : 'high';
                    this.addCriticalResource(element.src, 'script', priority);
                }
                break;
                
            case 'video':
                if (element.poster) {
                    this.addCriticalResource(element.poster, 'image', 'medium');
                }
                break;
        }

        // Check for background images
        const computedStyle = window.getComputedStyle(element);
        const backgroundImage = computedStyle.backgroundImage;
        if (backgroundImage && backgroundImage !== 'none') {
            const urls = this.extractBackgroundImageUrls(backgroundImage);
            urls.forEach(url => {
                this.addCriticalResource(url, 'image', 'high');
            });
        }
    }

    addCoreResources() {
        const coreResources = [
            { url: '/assets/css/main.css', type: 'stylesheet', priority: 'critical' },
            { url: '/assets/js/components/header.js', type: 'script', priority: 'critical' },
            { url: '/assets/js/scripts.js', type: 'script', priority: 'high' },
            { url: '/assets/images/logo/icon.png', type: 'image', priority: 'high' },
            { url: '/manifest.json', type: 'manifest', priority: 'medium' }
        ];

        coreResources.forEach(resource => {
            this.addCriticalResource(resource.url, resource.type, resource.priority);
        });
    }

    addCriticalResource(url, type, priority) {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(url, window.location.origin).href;
        
        this.criticalResources.add(absoluteUrl);
        this.resourcePriorities.set(absoluteUrl, {
            type: type,
            priority: priority,
            added: Date.now()
        });
    }

    // === INTELLIGENT PRELOADING ===
    async setupIntelligentPreloading() {
        // Preload critical resources immediately
        await this.preloadCriticalResources();
        
        // Setup intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        }
        
        // Setup predictive preloading
        this.setupPredictivePreloading();
        
        // Setup hover-based preloading
        this.setupHoverPreloading();
    }

    async preloadCriticalResources() {
        const criticalResourcesArray = Array.from(this.criticalResources)
            .map(url => ({
                url,
                ...this.resourcePriorities.get(url)
            }))
            .sort((a, b) => {
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

        // Batch preload based on loading strategy
        const batchSize = this.getBatchSize();
        
        for (let i = 0; i < criticalResourcesArray.length; i += batchSize) {
            const batch = criticalResourcesArray.slice(i, i + batchSize);
            
            await Promise.allSettled(
                batch.map(resource => this.preloadResource(resource))
            );
            
            // Add delay between batches for conservative strategy
            if (this.loadingStrategy === 'conservative' && i + batchSize < criticalResourcesArray.length) {
                await this.delay(100);
            }
        }
    }

    getBatchSize() {
        switch (this.loadingStrategy) {
            case 'aggressive': return 8;
            case 'adaptive': return 4;
            case 'conservative': return 2;
            default: return 4;
        }
    }

    async preloadResource(resource) {
        try {
            const { url, type, priority } = resource;
            
            // Check if already preloaded
            if (this.preloadCache.has(url)) {
                return this.preloadCache.get(url);
            }

            // Create preload element
            const preloadPromise = this.createPreloadElement(url, type, priority);
            this.preloadCache.set(url, preloadPromise);
            
            await preloadPromise;
            
            console.log(`[DAMP Critical Path] Preloaded ${type}: ${url} (${priority} priority)`);
            
        } catch (error) {
            console.warn(`[DAMP Critical Path] Failed to preload resource:`, resource, error);
        }
    }

    createPreloadElement(url, type, priority) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            
            // Set appropriate attributes based on type
            switch (type) {
                case 'stylesheet':
                    link.as = 'style';
                    break;
                case 'script':
                    link.as = 'script';
                    break;
                case 'image':
                    link.as = 'image';
                    // Add format-specific hints
                    if (this.deviceCapabilities.supportsAVIF && url.includes('.jpg')) {
                        link.href = url.replace(/\.(jpg|jpeg|png)$/, '.avif');
                    } else if (this.deviceCapabilities.supportsWebP && url.includes('.jpg')) {
                        link.href = url.replace(/\.(jpg|jpeg|png)$/, '.webp');
                    } else {
                        link.href = url;
                    }
                    break;
                case 'font':
                    link.as = 'font';
                    link.type = 'font/woff2';
                    link.crossOrigin = 'anonymous';
                    break;
                default:
                    link.as = 'fetch';
                    link.crossOrigin = 'anonymous';
            }
            
            if (type !== 'image') {
                link.href = url;
            }
            
            // Set priority hint if supported
            if ('importance' in link) {
                const importanceMap = {
                    critical: 'high',
                    high: 'high',
                    medium: 'auto',
                    low: 'low'
                };
                link.importance = importanceMap[priority] || 'auto';
            }
            
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to preload: ${url}`));
            
            document.head.appendChild(link);
        });
    }

    // === INTERSECTION OBSERVER FOR LAZY LOADING ===
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px', // Load 50px before entering viewport
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleElementIntersection(entry.target);
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, options);

        // Observe images and other lazy-loadable elements
        const lazyElements = document.querySelectorAll('[data-lazy], [loading="lazy"]');
        lazyElements.forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }

    handleElementIntersection(element) {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'img' && element.dataset.src) {
            this.lazyLoadImage(element);
        } else if (tagName === 'iframe' && element.dataset.src) {
            this.lazyLoadIframe(element);
        } else if (element.dataset.component) {
            this.lazyLoadComponent(element);
        }
    }

    lazyLoadImage(img) {
        const src = img.dataset.src;
        
        // Choose optimal format
        let optimizedSrc = src;
        if (this.deviceCapabilities.supportsAVIF && src.match(/\.(jpg|jpeg|png)$/)) {
            optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/, '.avif');
        } else if (this.deviceCapabilities.supportsWebP && src.match(/\.(jpg|jpeg|png)$/)) {
            optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
        }
        
        // Create a new image to test if optimized format exists
        const testImg = new Image();
        testImg.onload = () => {
            img.src = optimizedSrc;
            img.classList.add('loaded');
        };
        testImg.onerror = () => {
            img.src = src; // Fallback to original
            img.classList.add('loaded');
        };
        testImg.src = optimizedSrc;
    }

    // === PREDICTIVE PRELOADING ===
    setupPredictivePreloading() {
        // Track user behavior patterns
        this.userBehavior = {
            clickPatterns: [],
            scrollPatterns: [],
            timeOnPage: Date.now()
        };

        // Setup click tracking for predictive loading
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (target && target.href) {
                this.trackUserInteraction('click', target.href);
                this.predictNextResource(target.href);
            }
        });

        // Setup scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScrollBehavior();
            }, 150);
        });
    }

    trackUserInteraction(type, target) {
        this.userBehavior.clickPatterns.push({
            type,
            target,
            timestamp: Date.now()
        });

        // Keep only recent patterns (last 10)
        if (this.userBehavior.clickPatterns.length > 10) {
            this.userBehavior.clickPatterns.shift();
        }
    }

    predictNextResource(currentHref) {
        // Simple prediction based on common patterns
        const currentPath = new URL(currentHref).pathname;
        
        // Predict related pages
        const predictions = this.generatePredictions(currentPath);
        
        predictions.forEach(prediction => {
            this.prefetchResource(prediction.url, prediction.confidence);
        });
    }

    generatePredictions(currentPath) {
        const predictions = [];
        
        // Navigation patterns
        if (currentPath.includes('/products/')) {
            predictions.push({
                url: '/pages/cart.html',
                confidence: 0.7
            });
            predictions.push({
                url: '/pages/pre-order.html',
                confidence: 0.6
            });
        }
        
        if (currentPath.includes('/pages/')) {
            predictions.push({
                url: '/',
                confidence: 0.5
            });
        }
        
        return predictions.filter(p => p.confidence > 0.5);
    }

    // === HOVER-BASED PRELOADING ===
    setupHoverPreloading() {
        let hoverTimeout;
        
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a');
            if (target && target.href) {
                hoverTimeout = setTimeout(() => {
                    this.prefetchResource(target.href, 0.8);
                }, 200); // Wait 200ms to avoid accidental hovers
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        });
    }

    async prefetchResource(url, confidence) {
        // Only prefetch if confidence is high enough
        if (confidence < 0.6) return;
        
        // Don't prefetch if already cached
        if (this.preloadCache.has(url)) return;
        
        // Don't prefetch on slow connections
        if (this.networkState.saveData || this.networkState.effectiveType === '2g') return;
        
        try {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
            
            console.log(`[DAMP Critical Path] Prefetching: ${url} (confidence: ${confidence})`);
            
        } catch (error) {
            console.warn('[DAMP Critical Path] Prefetch failed:', url, error);
        }
    }

    // === RESOURCE HINTS ===
    async initializeResourceHints() {
        // DNS prefetch for external domains
        const externalDomains = this.extractExternalDomains();
        externalDomains.forEach(domain => {
            this.addDNSPrefetch(domain);
        });

        // Preconnect to critical origins
        const criticalOrigins = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://www.google-analytics.com'
        ];
        
        criticalOrigins.forEach(origin => {
            this.addPreconnect(origin);
        });
    }

    extractExternalDomains() {
        const domains = new Set();
        const links = document.querySelectorAll('a[href^="http"], img[src^="http"], script[src^="http"], link[href^="http"]');
        
        links.forEach(element => {
            const url = element.href || element.src;
            try {
                const domain = new URL(url).hostname;
                if (domain !== window.location.hostname) {
                    domains.add(domain);
                }
            } catch (e) {
                // Invalid URL, skip
            }
        });
        
        return Array.from(domains);
    }

    addDNSPrefetch(domain) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
    }

    addPreconnect(origin) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    // === CRITICAL PATH OPTIMIZATION ===
    async optimizeCriticalPath() {
        // Inline critical CSS
        await this.inlineCriticalCSS();
        
        // Defer non-critical resources
        this.deferNonCriticalResources();
        
        // Optimize font loading
        this.optimizeFontLoading();
        
        // Setup resource cleanup
        this.setupResourceCleanup();
    }

    async inlineCriticalCSS() {
        try {
            const criticalCSS = await this.extractCriticalCSS();
            if (criticalCSS) {
                const style = document.createElement('style');
                style.textContent = criticalCSS;
                style.id = 'critical-css';
                document.head.insertBefore(style, document.head.firstChild);
                
                console.log('[DAMP Critical Path] Critical CSS inlined');
            }
        } catch (error) {
            console.warn('[DAMP Critical Path] Failed to inline critical CSS:', error);
        }
    }

    async extractCriticalCSS() {
        // This would typically be done at build time
        // For runtime, we can extract computed styles of above-the-fold elements
        const criticalElements = document.querySelectorAll('header, nav, .hero, .above-fold');
        const criticalRules = new Set();
        
        criticalElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            // This is a simplified version - production would use more sophisticated extraction
            const relevantProps = ['display', 'position', 'width', 'height', 'margin', 'padding', 'color', 'background'];
            
            relevantProps.forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value !== 'initial') {
                    criticalRules.add(`${element.tagName.toLowerCase()} { ${prop}: ${value}; }`);
                }
            });
        });
        
        return Array.from(criticalRules).join('\n');
    }

    deferNonCriticalResources() {
        // Defer non-critical stylesheets
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(link => {
            if (!this.criticalResources.has(link.href)) {
                link.media = 'print';
                link.onload = function() {
                    this.media = 'all';
                };
            }
        });

        // Defer non-critical scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!this.criticalResources.has(script.src) && !script.hasAttribute('async') && !script.hasAttribute('defer')) {
                script.defer = true;
            }
        });
    }

    // === UTILITY METHODS ===
    async checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    async checkAVIFSupport() {
        return new Promise((resolve) => {
            const avif = new Image();
            avif.onload = avif.onerror = () => {
                resolve(avif.height === 2);
            };
            avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAACAAAAAgAAAAEIZXJtYWAfAABRcGF5bG9hZAAAAAFpOKsgX41FW9KpvhsR1Rbd+f4hAB4ACMATcegr0DAA';
        });
    }

    extractBackgroundImageUrls(backgroundImage) {
        const urls = [];
        const matches = backgroundImage.match(/url\(['"]?([^'"()]+)['"]?\)/g);
        if (matches) {
            matches.forEach(match => {
                const url = match.replace(/url\(['"]?([^'"()]+)['"]?\)/, '$1');
                urls.push(url);
            });
        }
        return urls;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    adaptToNetworkChange() {
        console.log('[DAMP Critical Path] Network changed, adapting strategy...');
        
        // Update loading strategy
        this.loadingStrategy = this.determineLoadingStrategy();
        
        // Cancel non-critical preloads on slow connections
        if (this.networkState.saveData || this.networkState.effectiveType === '2g') {
            this.cancelNonCriticalPreloads();
        }
    }

    cancelNonCriticalPreloads() {
        const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]');
        preloadLinks.forEach(link => {
            const resource = this.resourcePriorities.get(link.href);
            if (!resource || resource.priority !== 'critical') {
                link.remove();
            }
        });
    }

    // === PUBLIC API ===
    getOptimizationStats() {
        return {
            criticalResources: this.criticalResources.size,
            preloadedResources: this.preloadCache.size,
            loadingStrategy: this.loadingStrategy,
            deviceCapabilities: this.deviceCapabilities,
            networkState: this.networkState
        };
    }

    // Manual optimization trigger
    async optimizeNow() {
        console.log('[DAMP Critical Path] Manual optimization triggered...');
        
        await this.identifyCriticalResources();
        await this.preloadCriticalResources();
        await this.optimizeCriticalPath();
        
        console.log('[DAMP Critical Path] Manual optimization complete');
    }
}

// Initialize the critical path optimizer
const dampCriticalPath = new DAMPCriticalPathOptimizer();

// Export for global access
window.dampCriticalPath = dampCriticalPath;

// Global functions for developer tools
window.getDampOptimizationStats = () => dampCriticalPath.getOptimizationStats();
window.optimizeDampCriticalPath = () => dampCriticalPath.optimizeNow();

console.log('[DAMP Critical Path] Google-level critical path optimizer initialized'); 