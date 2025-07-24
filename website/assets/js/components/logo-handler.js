/* DAMP Smart Drinkware - Universal Logo Handler */
/* Handles logo loading with comprehensive fallback system */

class DAMPLogoHandler {
    constructor() {
        this.isSubPage = window.location.pathname.includes('/pages/');
        this.basePath = this.isSubPage ? '../' : '';
        this.fallbackSVG = null;
        this.createFallbackSVG();
    }

    /**
     * Create white droplet SVG as final fallback
     */
    createFallbackSVG() {
        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <defs>
                    <radialGradient id="logoDropletGradient" cx="0.3" cy="0.3" r="0.8">
                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                        <stop offset="70%" style="stop-color:#e0e0e0;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#c0c0c0;stop-opacity:1" />
                    </radialGradient>
                    <filter id="logoDropShadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <path d="M50 10 
                         Q30 30 25 50 
                         Q25 70 35 80 
                         Q45 90 50 90 
                         Q55 90 65 80 
                         Q75 70 75 50 
                         Q70 30 50 10 Z" 
                      fill="url(#logoDropletGradient)" 
                      filter="url(#logoDropShadow)"
                      stroke="#a0a0a0" 
                      stroke-width="1"/>
                <ellipse cx="42" cy="35" rx="8" ry="12" fill="#ffffff" opacity="0.6"/>
                <ellipse cx="45" cy="30" rx="4" ry="6" fill="#ffffff" opacity="0.8"/>
            </svg>
        `;
        
        this.fallbackSVG = 'data:image/svg+xml;base64,' + btoa(svgString);
    }

    /**
     * Get logo paths in order of preference
     */
    getLogoPaths() {
        return [
            `${this.basePath}assets/images/logo/logo.png`,
            `${this.basePath}assets/images/logo/icon.png`,
            `${this.basePath}assets/images/logo/favicon.png`,
            this.fallbackSVG
        ];
    }

    /**
     * Get favicon paths in order of preference
     */
    getFaviconPaths() {
        return [
            `${this.basePath}assets/images/logo/favicon.ico`,
            `${this.basePath}assets/images/logo/icon.png`,
            `${this.basePath}assets/images/logo/logo.png`,
            this.fallbackSVG
        ];
    }

    /**
     * Setup logo element with fallback chain
     */
    setupLogo(logoElement, options = {}) {
        const { 
            useFavicon = false, 
            onLoad = null, 
            onError = null,
            onFallback = null 
        } = options;

        const paths = useFavicon ? this.getFaviconPaths() : this.getLogoPaths();
        let currentIndex = 0;

        const tryNextLogo = () => {
            if (currentIndex < paths.length) {
                logoElement.src = paths[currentIndex];
                
                if (currentIndex === paths.length - 1 && onFallback) {
                    onFallback(logoElement);
                }
                
                currentIndex++;
            }
        };

        logoElement.onerror = () => {
            if (onError) {
                onError(logoElement, paths[currentIndex - 1]);
            }
            tryNextLogo();
        };

        logoElement.onload = () => {
            if (onLoad) {
                onLoad(logoElement, paths[currentIndex - 1]);
            }
        };

        // Start with first logo
        tryNextLogo();

        return logoElement;
    }

    /**
     * Create logo element with fallback system
     */
    createLogo(options = {}) {
        const {
            className = 'damp-logo',
            alt = 'DAMP Smart Drinkware Logo',
            loading = 'lazy',
            useFavicon = false,
            ...imgOptions
        } = options;

        const img = document.createElement('img');
        img.className = className;
        img.alt = alt;
        img.loading = loading;

        // Apply additional options
        Object.entries(imgOptions).forEach(([key, value]) => {
            img.setAttribute(key, value);
        });

        return this.setupLogo(img, { useFavicon });
    }

    /**
     * Replace existing logo elements with fallback-enabled versions
     */
    enhanceExistingLogos(selector = 'img[src*="logo"], img[src*="icon"]') {
        const logoElements = document.querySelectorAll(selector);
        
        logoElements.forEach(element => {
            const useFavicon = element.src.includes('favicon');
            this.setupLogo(element, { useFavicon });
        });
    }

    /**
     * Get fallback SVG directly
     */
    getFallbackSVG() {
        return this.fallbackSVG;
    }

    /**
     * Test if logo is available
     */
    async testLogo(path) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = path;
        });
    }

    /**
     * Get the best available logo
     */
    async getBestLogo(useFavicon = false) {
        const paths = useFavicon ? this.getFaviconPaths() : this.getLogoPaths();
        
        for (const path of paths) {
            if (await this.testLogo(path)) {
                return path;
            }
        }
        
        return this.fallbackSVG;
    }
}

// Initialize and make available globally
window.DAMPLogoHandler = DAMPLogoHandler;

// Auto-enhance existing logos when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const logoHandler = new DAMPLogoHandler();
        logoHandler.enhanceExistingLogos();
    });
} else {
    const logoHandler = new DAMPLogoHandler();
    logoHandler.enhanceExistingLogos();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPLogoHandler;
} 