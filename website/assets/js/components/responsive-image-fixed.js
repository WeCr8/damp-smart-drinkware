/**
 * DAMP Responsive Image Component - Fixed Version
 * Handles fallbacks to original images when optimized versions don't exist
 */

class ResponsiveImageFixed extends HTMLElement {
    constructor() {
        super();
        this.imageManifest = null;
        this.observer = null;
    }

    async connectedCallback() {
        await this.loadImageManifest();
        this.setupLazyLoading();
        this.generatePicture();
    }

    async loadImageManifest() {
        try {
            const response = await fetch('/assets/images/optimized/image-manifest.json');
            this.imageManifest = await response.json();
        } catch (error) {
            console.warn('Could not load image manifest, using fallback images:', error);
            this.imageManifest = null;
        }
    }

    setupLazyLoading() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage();
                    this.observer.disconnect();
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.observer.observe(this);
    }

    generatePicture() {
        const src = this.getAttribute('src');
        const alt = this.getAttribute('alt') || '';
        const loading = this.getAttribute('loading') || 'lazy';
        
        if (!src) return;
        
        // Check if optimized versions exist
        const productMatch = src.match(/products\/([^\/]+)\//);
        
        if (productMatch && this.imageManifest) {
            // Use optimized images if available
            this.generateOptimizedPicture(src, alt, loading);
        } else {
            // Fallback to original image
            this.generateFallbackImage(src, alt, loading);
        }
    }

    generateOptimizedPicture(src, alt, loading) {
        const productMatch = src.match(/products\/([^\/]+)\//);
        const basePath = `/assets/images/optimized/products/${productMatch[1]}/${productMatch[1]}`;
        const sizes = this.getAttribute('sizes') || '100vw';

        const picture = document.createElement('picture');
        
        // WebP source
        const webpSource = document.createElement('source');
        webpSource.type = 'image/webp';
        webpSource.srcset = this.generateSrcSet(basePath, 'webp');
        webpSource.sizes = sizes;
        picture.appendChild(webpSource);
        
        // PNG fallback
        const img = document.createElement('img');
        img.src = `${basePath}-medium.png`;
        img.srcset = this.generateSrcSet(basePath, 'png');
        img.sizes = sizes;
        img.alt = alt;
        img.loading = loading;
        img.style.cssText = 'width: 100%; height: 250px; object-fit: cover; border-radius: 8px;';
        
        picture.appendChild(img);
        this.appendChild(picture);
    }

    generateFallbackImage(src, alt, loading) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.loading = loading;
        img.style.cssText = 'width: 100%; height: 250px; object-fit: cover; border-radius: 8px;';
        
        // Add error handling
        img.onerror = () => {
            img.src = '/assets/images/logo/icon.png'; // Fallback to logo
            img.alt = 'Product image coming soon';
        };
        
        this.appendChild(img);
    }

    generateSrcSet(basePath, format) {
        return [
            `${basePath}-small.${format} 200w`,
            `${basePath}-medium.${format} 400w`,
            `${basePath}-large.${format} 800w`
        ].join(', ');
    }

    loadImage() {
        const img = this.querySelector('img');
        if (img && img.loading === 'lazy') {
            img.loading = 'eager';
        }
    }

    disconnectedCallback() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

customElements.define('responsive-image-fixed', ResponsiveImageFixed); 