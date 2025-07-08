// DAMP Critical CSS & Resource Optimization - Google Engineering Best Practices
// Handles critical CSS, resource hints, and performance optimization

class DAMPCriticalCSSOptimizer {
    constructor(options = {}) {
        this.options = {
            enableCriticalCSS: true,
            enableResourceHints: true,
            enableImageOptimization: true,
            enableFontOptimization: true,
            criticalViewportHeight: 1080,
            criticalViewportWidth: 1920,
            deferNonCriticalCSS: true,
            enableServiceWorker: true,
            debug: window.location.hostname === 'localhost',
            ...options
        };

        this.criticalCSS = '';
        this.nonCriticalCSS = [];
        this.resourceHints = [];
        this.optimizedImages = new Map();
        this.fontsLoaded = new Set();
        
        this.init();
    }

    init() {
        if (this.options.enableCriticalCSS) {
            this.extractCriticalCSS();
            this.deferNonCriticalCSS();
        }
        
        if (this.options.enableResourceHints) {
            this.setupResourceHints();
        }
        
        if (this.options.enableImageOptimization) {
            this.optimizeImages();
        }
        
        if (this.options.enableFontOptimization) {
            this.optimizeFonts();
        }
        
        if (this.options.enableServiceWorker) {
            this.registerServiceWorker();
        }
        
        this.setupPerformanceObserver();
        this.setupDOMObserver();
    }

    // Extract Critical CSS for Above-the-Fold Content
    extractCriticalCSS() {
        const criticalElements = this.getCriticalElements();
        const criticalRules = [];
        
        // Get all stylesheets
        const stylesheets = Array.from(document.styleSheets);
        
        stylesheets.forEach(stylesheet => {
            try {
                const rules = Array.from(stylesheet.cssRules || []);
                
                rules.forEach(rule => {
                    if (rule.type === CSSRule.STYLE_RULE) {
                        // Check if rule applies to critical elements
                        if (this.isCriticalRule(rule, criticalElements)) {
                            criticalRules.push(rule.cssText);
                        }
                    }
                });
            } catch (e) {
                // Cross-origin stylesheet - skip
                console.warn('Could not access stylesheet:', stylesheet.href);
            }
        });
        
        this.criticalCSS = criticalRules.join('\n');
        this.injectCriticalCSS();
    }

    // Get Critical Elements (Above-the-Fold)
    getCriticalElements() {
        const criticalElements = [];
        const viewportHeight = window.innerHeight || this.options.criticalViewportHeight;
        
        // Get all visible elements within viewport
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            
            // Check if element is within critical viewport
            if (rect.top < viewportHeight && rect.bottom > 0) {
                criticalElements.push(element);
            }
        });
        
        return criticalElements;
    }

    // Check if CSS rule is critical
    isCriticalRule(rule, criticalElements) {
        try {
            const selector = rule.selectorText;
            
            // Check if selector matches any critical element
            return criticalElements.some(element => {
                try {
                    return element.matches(selector);
                } catch (e) {
                    return false;
                }
            });
        } catch (e) {
            return false;
        }
    }

    // Inject Critical CSS
    injectCriticalCSS() {
        if (!this.criticalCSS) return;
        
        const criticalStyle = document.createElement('style');
        criticalStyle.id = 'critical-css';
        criticalStyle.textContent = this.criticalCSS;
        
        // Insert at the beginning of head
        const head = document.head;
        head.insertBefore(criticalStyle, head.firstChild);
        
        if (this.options.debug) {
            console.log('Critical CSS injected:', this.criticalCSS.length, 'characters');
        }
    }

    // Defer Non-Critical CSS
    deferNonCriticalCSS() {
        if (!this.options.deferNonCriticalCSS) return;
        
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        stylesheets.forEach(link => {
            // Skip if already processed or is critical
            if (link.hasAttribute('data-critical') || link.hasAttribute('data-deferred')) {
                return;
            }
            
            // Create deferred loader
            const deferredLink = document.createElement('link');
            deferredLink.rel = 'preload';
            deferredLink.as = 'style';
            deferredLink.href = link.href;
            deferredLink.onload = () => {
                deferredLink.onload = null;
                deferredLink.rel = 'stylesheet';
            };
            
            // Add noscript fallback
            const noscriptFallback = document.createElement('noscript');
            const fallbackLink = document.createElement('link');
            fallbackLink.rel = 'stylesheet';
            fallbackLink.href = link.href;
            noscriptFallback.appendChild(fallbackLink);
            
            // Replace original link
            link.parentNode.insertBefore(deferredLink, link);
            link.parentNode.insertBefore(noscriptFallback, link);
            link.parentNode.removeChild(link);
            
            deferredLink.setAttribute('data-deferred', 'true');
        });
    }

    // Setup Resource Hints
    setupResourceHints() {
        // Preconnect to external domains
        const externalDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com',
            'https://unpkg.com',
            'https://cdn.jsdelivr.net'
        ];
        
        externalDomains.forEach(domain => {
            this.addResourceHint('preconnect', domain);
        });
        
        // Preload important assets
        const criticalAssets = [
            { href: '/assets/css/navigation.css', as: 'style' },
            { href: '/assets/js/navigation.js', as: 'script' },
            { href: '/assets/js/lazy-loading.js', as: 'script' },
            { href: '/assets/images/logo/icon.png', as: 'image' },
            { href: '/assets/images/hero/hero-bg.jpg', as: 'image' }
        ];
        
        criticalAssets.forEach(asset => {
            this.addResourceHint('preload', asset.href, { as: asset.as });
        });
        
        // Prefetch likely next pages
        const prefetchPages = [
            '/pages/about.html',
            '/pages/support.html',
            '/pages/cart.html'
        ];
        
        // Delay prefetch to avoid competing with critical resources
        setTimeout(() => {
            prefetchPages.forEach(page => {
                this.addResourceHint('prefetch', page);
            });
        }, 2000);
    }

    // Add Resource Hint
    addResourceHint(rel, href, options = {}) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        
        // Add additional attributes
        Object.keys(options).forEach(key => {
            link.setAttribute(key, options[key]);
        });
        
        // Add crossorigin for external resources
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
        this.resourceHints.push({ rel, href, ...options });
        
        if (this.options.debug) {
            console.log(`Resource hint added: ${rel} ${href}`);
        }
    }

    // Optimize Images
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            this.optimizeImage(img);
        });
        
        // Observe for new images
        const imageObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'IMG') {
                            this.optimizeImage(node);
                        } else {
                            const imgs = node.querySelectorAll('img');
                            imgs.forEach(img => this.optimizeImage(img));
                        }
                    }
                });
            });
        });
        
        imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Optimize Individual Image
    optimizeImage(img) {
        if (img.hasAttribute('data-optimized')) return;
        
        // Add loading attribute if not present
        if (!img.hasAttribute('loading')) {
            const rect = img.getBoundingClientRect();
            const isAboveTheFold = rect.top < window.innerHeight;
            
            if (!isAboveTheFold) {
                img.setAttribute('loading', 'lazy');
            }
        }
        
        // Add responsive attributes
        if (!img.hasAttribute('sizes') && img.hasAttribute('srcset')) {
            img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
        }
        
        // Optimize src for WebP if supported
        if (this.supportsWebP() && img.src) {
            const optimizedSrc = this.getOptimizedImageSrc(img.src);
            if (optimizedSrc !== img.src) {
                img.src = optimizedSrc;
            }
        }
        
        // Add error handling
        img.addEventListener('error', () => {
            if (!img.hasAttribute('data-fallback-attempted')) {
                img.setAttribute('data-fallback-attempted', 'true');
                const fallbackSrc = this.getFallbackImageSrc(img.src);
                if (fallbackSrc) {
                    img.src = fallbackSrc;
                }
            }
        });
        
        img.setAttribute('data-optimized', 'true');
        this.optimizedImages.set(img, Date.now());
    }

    // Check WebP Support
    supportsWebP() {
        if (this._webpSupported !== undefined) {
            return this._webpSupported;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        this._webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        return this._webpSupported;
    }

    // Get Optimized Image Source
    getOptimizedImageSrc(src) {
        if (!src || !this.supportsWebP()) return src;
        
        // Convert to WebP if supported
        if (src.match(/\.(jpg|jpeg|png)$/i)) {
            return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        return src;
    }

    // Get Fallback Image Source
    getFallbackImageSrc(src) {
        if (src.includes('.webp')) {
            return src.replace('.webp', '.jpg');
        }
        
        return null;
    }

    // Optimize Fonts
    optimizeFonts() {
        // Preload critical fonts
        const criticalFonts = [
            '/assets/fonts/primary-font.woff2',
            '/assets/fonts/secondary-font.woff2'
        ];
        
        criticalFonts.forEach(fontUrl => {
            this.addResourceHint('preload', fontUrl, { 
                as: 'font', 
                type: 'font/woff2',
                crossorigin: 'anonymous'
            });
        });
        
        // Use Font Loading API if available
        if ('fonts' in document) {
            this.setupFontLoadingAPI();
        }
        
        // Fallback for older browsers
        this.setupFontFallback();
    }

    // Setup Font Loading API
    setupFontLoadingAPI() {
        const fonts = [
            new FontFace('PrimaryFont', 'url(/assets/fonts/primary-font.woff2)', {
                weight: '400',
                style: 'normal',
                display: 'swap'
            }),
            new FontFace('SecondaryFont', 'url(/assets/fonts/secondary-font.woff2)', {
                weight: '600',
                style: 'normal',
                display: 'swap'
            })
        ];
        
        fonts.forEach(font => {
            document.fonts.add(font);
            
            font.load().then(() => {
                this.fontsLoaded.add(font.family);
                document.body.classList.add(`font-${font.family.toLowerCase()}-loaded`);
                
                if (this.options.debug) {
                    console.log(`Font loaded: ${font.family}`);
                }
            }).catch(error => {
                console.error(`Font loading failed: ${font.family}`, error);
            });
        });
    }

    // Setup Font Fallback
    setupFontFallback() {
        const fontTimeout = setTimeout(() => {
            document.body.classList.add('fonts-timeout');
        }, 3000);
        
        document.fonts.ready.then(() => {
            clearTimeout(fontTimeout);
            document.body.classList.add('fonts-loaded');
        });
    }

    // Register Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('Service Worker registered successfully');
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New version available
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                    });
            });
        }
    }

    // Show Update Notification
    showUpdateNotification() {
        if (window.confirm('A new version is available. Reload to update?')) {
            window.location.reload();
        }
    }

    // Setup Performance Observer
    setupPerformanceObserver() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                
                entries.forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.optimizeLCP(entry);
                    } else if (entry.entryType === 'layout-shift') {
                        this.optimizeCLS(entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
        } catch (e) {
            console.warn('Performance Observer not supported');
        }
    }

    // Optimize Largest Contentful Paint
    optimizeLCP(entry) {
        const element = entry.element;
        
        if (element && element.tagName === 'IMG') {
            // Preload this image for future visits
            this.addResourceHint('preload', element.src, { as: 'image' });
        }
        
        if (this.options.debug) {
            console.log('LCP element:', element, 'Time:', entry.startTime);
        }
    }

    // Optimize Cumulative Layout Shift
    optimizeCLS(entry) {
        if (entry.hadRecentInput) return;
        
        entry.sources.forEach(source => {
            const element = source.node;
            
            if (element && element.tagName === 'IMG') {
                // Add dimensions to prevent layout shift
                if (!element.hasAttribute('width') || !element.hasAttribute('height')) {
                    this.addImageDimensions(element);
                }
            }
        });
        
        if (this.options.debug) {
            console.log('Layout shift detected:', entry.value, entry.sources);
        }
    }

    // Add Image Dimensions
    addImageDimensions(img) {
        // This would typically be done server-side or with a build process
        // For now, we'll set a placeholder aspect ratio
        if (!img.style.aspectRatio) {
            img.style.aspectRatio = '16/9';
        }
    }

    // Setup DOM Observer
    setupDOMObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Process new CSS links
                        const newStylesheets = node.querySelectorAll('link[rel="stylesheet"]');
                        newStylesheets.forEach(link => {
                            if (this.options.deferNonCriticalCSS) {
                                this.deferStylesheet(link);
                            }
                        });
                        
                        // Process new images
                        const newImages = node.querySelectorAll('img');
                        newImages.forEach(img => {
                            this.optimizeImage(img);
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Defer Individual Stylesheet
    deferStylesheet(link) {
        if (link.hasAttribute('data-deferred')) return;
        
        const deferredLink = document.createElement('link');
        deferredLink.rel = 'preload';
        deferredLink.as = 'style';
        deferredLink.href = link.href;
        deferredLink.onload = () => {
            deferredLink.onload = null;
            deferredLink.rel = 'stylesheet';
        };
        
        link.parentNode.insertBefore(deferredLink, link);
        link.parentNode.removeChild(link);
        
        deferredLink.setAttribute('data-deferred', 'true');
    }

    // Get Optimization Report
    getOptimizationReport() {
        return {
            criticalCSS: {
                length: this.criticalCSS.length,
                enabled: this.options.enableCriticalCSS
            },
            resourceHints: {
                count: this.resourceHints.length,
                hints: this.resourceHints
            },
            optimizedImages: {
                count: this.optimizedImages.size,
                webpSupported: this.supportsWebP()
            },
            fonts: {
                loaded: Array.from(this.fontsLoaded),
                count: this.fontsLoaded.size
            },
            serviceWorker: {
                supported: 'serviceWorker' in navigator,
                enabled: this.options.enableServiceWorker
            }
        };
    }

    // Manual Optimization Trigger
    optimize() {
        if (this.options.enableCriticalCSS) {
            this.extractCriticalCSS();
        }
        
        if (this.options.enableImageOptimization) {
            this.optimizeImages();
        }
        
        if (this.options.enableResourceHints) {
            this.setupResourceHints();
        }
    }

    // Cleanup
    destroy() {
        this.optimizedImages.clear();
        this.fontsLoaded.clear();
        this.resourceHints.length = 0;
    }
}

// Auto-initialize Critical CSS Optimizer
let dampCriticalCSSOptimizer;

function initCriticalCSSOptimizer(options = {}) {
    dampCriticalCSSOptimizer = new DAMPCriticalCSSOptimizer(options);
    window.dampCriticalCSSOptimizer = dampCriticalCSSOptimizer;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCriticalCSSOptimizer);
} else {
    initCriticalCSSOptimizer();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPCriticalCSSOptimizer;
}

console.log('DAMP Critical CSS Optimizer initialized'); 