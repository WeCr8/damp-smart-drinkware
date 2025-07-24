/**
 * DAMP Responsive Image Component
 * Automatically serves optimized images based on screen size and format support
 */

class ResponsiveImage extends HTMLElement {
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
            console.warn('Could not load image manifest:', error);
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
        const sizes = this.getAttribute('sizes') || '100vw';
        const loading = this.getAttribute('loading') || 'lazy';
        
        if (!src) return;
        
        // Extract product info from src
        const productMatch = src.match(/products\/([^\/]+)\//);
        const logoMatch = src.match(/logo\/([^\/]+)/);
        
        let basePath;
        if (productMatch) {
            basePath = `/assets/images/optimized/products/${productMatch[1]}/${productMatch[1]}`;
        } else if (logoMatch) {
            basePath = `/assets/images/optimized/logo/${logoMatch[1]}`;
        } else {
            // Fallback to original
            this.innerHTML = `<img src="${src}" alt="${alt}" loading="${loading}">`;
            return;
        }

        // Generate picture element with multiple sources
        const picture = document.createElement('picture');
        
        // AVIF source (most efficient)
        const avifSource = document.createElement('source');
        avifSource.type = 'image/avif';
        avifSource.srcset = this.generateSrcSet(basePath, 'avif');
        avifSource.sizes = sizes;
        picture.appendChild(avifSource);
        
        // WebP source (good efficiency)
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
        img.style.cssText = this.getAttribute('style') || '';
        
        picture.appendChild(img);
        this.appendChild(picture);
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

customElements.define('responsive-image', ResponsiveImage); 