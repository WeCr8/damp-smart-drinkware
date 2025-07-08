// DAMP Lazy Loading System - Google Engineering Best Practices
// Implements modern lazy loading with Intersection Observer API and fallbacks

class DAMPLazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.01,
            enableWebP: true,
            enableBlur: true,
            fadeInDuration: 300,
            retryAttempts: 3,
            retryDelay: 1000,
            ...options
        };

        this.observer = null;
        this.loadedImages = new Set();
        this.failedImages = new Set();
        this.retryCount = new Map();
        
        this.init();
    }

    init() {
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }

        // Setup lazy loading for different content types
        this.setupImageLazyLoading();
        this.setupVideoLazyLoading();
        this.setupIframeLazyLoading();
        
        // Handle dynamic content
        this.observeNewElements();
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });

        // Observe all lazy elements
        this.observeElements();
    }

    observeElements() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => {
            this.observer.observe(element);
        });
    }

    setupImageLazyLoading() {
        // Add loading="lazy" to all images that don't have it
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            // Don't add lazy loading to above-the-fold images
            if (!this.isAboveTheFold(img)) {
                img.setAttribute('loading', 'lazy');
            }
        });

        // Setup custom lazy loading for images with data-src
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.setAttribute('data-lazy', 'image');
            this.setupImagePlaceholder(img);
        });
    }

    setupVideoLazyLoading() {
        const lazyVideos = document.querySelectorAll('video[data-src]');
        lazyVideos.forEach(video => {
            video.setAttribute('data-lazy', 'video');
        });
    }

    setupIframeLazyLoading() {
        const lazyIframes = document.querySelectorAll('iframe[data-src]');
        lazyIframes.forEach(iframe => {
            iframe.setAttribute('data-lazy', 'iframe');
            this.setupIframePlaceholder(iframe);
        });
    }

    setupImagePlaceholder(img) {
        if (!this.options.enableBlur) return;

        // Create blur placeholder
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 40;
        canvas.height = 30;
        
        // Generate gradient placeholder
        const gradient = ctx.createLinearGradient(0, 0, 40, 30);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 40, 30);
        
        // Apply blur effect
        img.style.filter = 'blur(5px)';
        img.style.transition = `filter ${this.options.fadeInDuration}ms ease`;
        img.src = canvas.toDataURL();
    }

    setupIframePlaceholder(iframe) {
        const placeholder = document.createElement('div');
        placeholder.className = 'iframe-placeholder';
        placeholder.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 100%;
            height: 300px;
            border-radius: 10px;
            cursor: pointer;
        `;
        placeholder.innerHTML = '<span>▶ Click to load content</span>';
        
        iframe.parentNode.insertBefore(placeholder, iframe);
        iframe.style.display = 'none';
        
        placeholder.addEventListener('click', () => {
            this.loadElement(iframe);
            placeholder.remove();
        });
    }

    async loadElement(element) {
        const elementType = element.getAttribute('data-lazy');
        
        try {
            switch (elementType) {
                case 'image':
                    await this.loadImage(element);
                    break;
                case 'video':
                    await this.loadVideo(element);
                    break;
                case 'iframe':
                    await this.loadIframe(element);
                    break;
                default:
                    await this.loadGenericElement(element);
            }
            
            // Mark as loaded
            element.setAttribute('data-loaded', 'true');
            element.removeAttribute('data-lazy');
            
            // Trigger custom event
            this.dispatchLoadEvent(element);
            
        } catch (error) {
            console.error('Failed to load element:', error);
            this.handleLoadError(element);
        }
    }

    async loadImage(img) {
        return new Promise((resolve, reject) => {
            const src = img.getAttribute('data-src');
            if (!src || this.loadedImages.has(src)) {
                resolve();
                return;
            }

            // Check for WebP support and use WebP if available
            const optimizedSrc = this.getOptimizedImageSrc(src);
            
            const newImg = new Image();
            
            newImg.onload = () => {
                // Update src and remove blur
                img.src = optimizedSrc;
                img.removeAttribute('data-src');
                
                if (this.options.enableBlur) {
                    img.style.filter = 'none';
                }
                
                // Add fade-in animation
                img.style.opacity = '0';
                img.style.transition = `opacity ${this.options.fadeInDuration}ms ease`;
                
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
                
                this.loadedImages.add(src);
                resolve();
            };
            
            newImg.onerror = () => {
                this.handleImageError(img, src);
                reject(new Error(`Failed to load image: ${src}`));
            };
            
            // Start loading
            newImg.src = optimizedSrc;
        });
    }

    async loadVideo(video) {
        const src = video.getAttribute('data-src');
        if (!src) return;

        video.src = src;
        video.removeAttribute('data-src');
        
        // Preload metadata
        video.preload = 'metadata';
        
        return new Promise((resolve) => {
            video.addEventListener('loadedmetadata', resolve, { once: true });
        });
    }

    async loadIframe(iframe) {
        const src = iframe.getAttribute('data-src');
        if (!src) return;

        iframe.src = src;
        iframe.removeAttribute('data-src');
        iframe.style.display = '';
        
        return new Promise((resolve) => {
            iframe.addEventListener('load', resolve, { once: true });
        });
    }

    async loadGenericElement(element) {
        const src = element.getAttribute('data-src');
        if (src) {
            element.src = src;
            element.removeAttribute('data-src');
        }
        
        // Handle background images
        const bgImage = element.getAttribute('data-bg');
        if (bgImage) {
            const optimizedBg = this.getOptimizedImageSrc(bgImage);
            element.style.backgroundImage = `url(${optimizedBg})`;
            element.removeAttribute('data-bg');
        }
    }

    getOptimizedImageSrc(src) {
        if (!this.options.enableWebP || !this.supportsWebP()) {
            return src;
        }
        
        // Convert to WebP if the image service supports it
        if (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png')) {
            return src.replace(/\.(jpg|jpeg|png)$/, '.webp');
        }
        
        return src;
    }

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

    handleImageError(img, src) {
        const retryCount = this.retryCount.get(src) || 0;
        
        if (retryCount < this.options.retryAttempts) {
            // Retry loading
            this.retryCount.set(src, retryCount + 1);
            
            setTimeout(() => {
                this.loadImage(img);
            }, this.options.retryDelay * (retryCount + 1));
        } else {
            // Use fallback image
            this.failedImages.add(src);
            img.src = this.getFallbackImage();
            img.alt = 'Image failed to load';
        }
    }

    handleLoadError(element) {
        element.setAttribute('data-load-error', 'true');
        element.style.opacity = '0.5';
    }

    getFallbackImage() {
        // Generate a simple gradient as fallback
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;
        
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);
        
        // Add error text
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Image not available', 200, 150);
        
        return canvas.toDataURL();
    }

    isAboveTheFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    observeNewElements() {
        // Watch for dynamically added content
        if ('MutationObserver' in window) {
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const lazyElements = node.querySelectorAll('[data-lazy]');
                            lazyElements.forEach(element => {
                                if (this.observer) {
                                    this.observer.observe(element);
                                }
                            });
                        }
                    });
                });
            });
            
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    setupPerformanceMonitoring() {
        // Monitor Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'largest-contentful-paint') {
                            this.trackLCP(entry);
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('Performance monitoring not supported');
            }
        }
    }

    trackLCP(entry) {
        const lcpTime = entry.startTime;
        
        // Track to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
                name: 'LCP',
                value: Math.round(lcpTime),
                event_category: 'Performance'
            });
        }
        
        console.log(`LCP: ${Math.round(lcpTime)}ms`);
    }

    dispatchLoadEvent(element) {
        const event = new CustomEvent('lazyLoaded', {
            detail: { element, timestamp: Date.now() }
        });
        element.dispatchEvent(event);
    }

    // Public methods
    loadAllImages() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => this.loadElement(element));
    }

    refreshObserver() {
        if (this.observer) {
            this.observer.disconnect();
            this.setupIntersectionObserver();
        }
    }

    getStats() {
        return {
            loadedImages: this.loadedImages.size,
            failedImages: this.failedImages.size,
            retryAttempts: Array.from(this.retryCount.values()).reduce((a, b) => a + b, 0)
        };
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.loadedImages.clear();
        this.failedImages.clear();
        this.retryCount.clear();
    }
}

// CSS for lazy loading effects
const lazyLoadCSS = `
    .lazy-loading {
        opacity: 0;
        transition: opacity 300ms ease;
    }
    
    .lazy-loaded {
        opacity: 1;
    }
    
    .lazy-error {
        opacity: 0.5;
        filter: grayscale(100%);
    }
    
    .iframe-placeholder {
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    
    .iframe-placeholder:hover {
        transform: scale(1.02);
    }
    
    @media (prefers-reduced-motion: reduce) {
        .lazy-loading,
        .lazy-loaded,
        .iframe-placeholder {
            transition: none !important;
        }
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = lazyLoadCSS;
document.head.appendChild(style);

// Auto-initialize lazy loading
let dampLazyLoader;

function initLazyLoading(options = {}) {
    dampLazyLoader = new DAMPLazyLoader(options);
    
    // Make globally accessible
    window.dampLazyLoader = dampLazyLoader;
    
    // Add utility functions to window
    window.lazyLoad = {
        refresh: () => dampLazyLoader.refreshObserver(),
        loadAll: () => dampLazyLoader.loadAllImages(),
        stats: () => dampLazyLoader.getStats()
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
} else {
    initLazyLoading();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPLazyLoader;
}

// Debug mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('DAMP Lazy Loading System initialized');
    
    // Add debug function
    window.debugLazyLoading = () => {
        if (dampLazyLoader) {
            console.log('Lazy Loading Stats:', dampLazyLoader.getStats());
        }
    };
} 