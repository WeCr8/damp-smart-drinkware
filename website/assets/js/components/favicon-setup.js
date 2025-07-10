// Favicon Setup Component - Ensures consistent favicon across all pages
class DAMPFaviconSetup {
    constructor() {
        this.isSubPage = window.location.pathname.includes('/pages/');
        this.basePath = this.isSubPage ? '../' : '';
        this.fallbackSVG = null;
        this.init();
    }

    init() {
        this.createFallbackSVG();
        this.setupFavicons();
    }

    /**
     * Create white droplet SVG as final fallback
     */
    createFallbackSVG() {
        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <defs>
                    <radialGradient id="dropletGradient" cx="0.3" cy="0.3" r="0.8">
                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                        <stop offset="70%" style="stop-color:#e0e0e0;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#c0c0c0;stop-opacity:1" />
                    </radialGradient>
                    <filter id="dropShadow">
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
                      fill="url(#dropletGradient)" 
                      filter="url(#dropShadow)"
                      stroke="#a0a0a0" 
                      stroke-width="1"/>
                <ellipse cx="42" cy="35" rx="8" ry="12" fill="#ffffff" opacity="0.6"/>
                <ellipse cx="45" cy="30" rx="4" ry="6" fill="#ffffff" opacity="0.8"/>
            </svg>
        `;
        
        this.fallbackSVG = 'data:image/svg+xml;base64,' + btoa(svgString);
    }

    /**
     * Setup favicons with comprehensive fallback system
     */
    setupFavicons() {
        const head = document.head;
        
        // Remove existing favicon links to avoid duplicates
        const existingFavicons = head.querySelectorAll('link[rel*="icon"], link[rel="manifest"]');
        existingFavicons.forEach(link => {
            if (link.href.includes('favicon') || link.href.includes('icon') || link.href.includes('manifest')) {
                link.remove();
            }
        });

        // Favicon hierarchy with fallbacks
        const faviconPaths = [
            `${this.basePath}assets/images/logo/favicon.ico`,
            `${this.basePath}assets/images/logo/icon.png`,
            `${this.basePath}assets/images/logo/logo.png`,
            this.fallbackSVG
        ];

        const logoPaths = [
            `${this.basePath}assets/images/logo/logo.png`,
            `${this.basePath}assets/images/logo/icon.png`,
            `${this.basePath}assets/images/logo/favicon.png`,
            this.fallbackSVG
        ];

        // Add comprehensive favicon setup
        const faviconLinks = [
            // Main favicon - use favicon.ico for best browser compatibility
            { rel: 'icon', type: 'image/x-icon', href: faviconPaths[0] },
            { rel: 'shortcut icon', type: 'image/x-icon', href: faviconPaths[0] },
            
            // PNG favicons - use logo.png for all PNG-based favicons
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: logoPaths[0] },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: logoPaths[0] },
            { rel: 'icon', type: 'image/png', sizes: '192x192', href: logoPaths[0] },
            { rel: 'icon', type: 'image/png', sizes: '512x512', href: logoPaths[0] },
            
            // Apple touch icons - use logo.png for iOS devices
            { rel: 'apple-touch-icon', sizes: '180x180', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '152x152', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '144x144', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '120x120', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '114x114', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '76x76', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '72x72', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '60x60', href: logoPaths[0] },
            { rel: 'apple-touch-icon', sizes: '57x57', href: logoPaths[0] },
            
            // Manifest for PWA support
            { rel: 'manifest', href: `${this.basePath}manifest.json` }
        ];

        try {
            faviconLinks.forEach(linkData => {
                const link = document.createElement('link');
                Object.entries(linkData).forEach(([key, value]) => {
                    link.setAttribute(key, value);
                });
                
                // Add error handling for favicon loading
                if (linkData.rel.includes('icon')) {
                    link.onerror = () => {
                        this.handleFaviconError(link, linkData);
                    };
                }
                
                head.appendChild(link);
            });

            // Add meta tags for better mobile and Windows tile support
            const metaTags = [
                { name: 'msapplication-TileColor', content: '#0f0f23' },
                { name: 'msapplication-TileImage', content: logoPaths[0] },
                { name: 'theme-color', content: '#0f0f23' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'apple-mobile-web-app-title', content: 'DAMP Smart Drinkware' }
            ];
            
            metaTags.forEach(metaData => {
                const meta = document.createElement('meta');
                Object.entries(metaData).forEach(([key, value]) => {
                    meta.setAttribute(key, value);
                });
                head.appendChild(meta);
            });
        } catch (error) {
            // Log error for debugging and fail gracefully
            // eslint-disable-next-line no-console
            console.error('Error setting up favicons or meta tags:', error);
        }
    }

    /**
     * Handle favicon loading errors with fallback chain
     */
    handleFaviconError(link, linkData) {
        const isAppleIcon = linkData.rel.includes('apple-touch-icon');
        const currentPaths = isAppleIcon ? 
            [
                `${this.basePath}assets/images/logo/logo.png`,
                `${this.basePath}assets/images/logo/icon.png`,
                `${this.basePath}assets/images/logo/favicon.png`,
                this.fallbackSVG
            ] : 
            [
                `${this.basePath}assets/images/logo/favicon.ico`,
                `${this.basePath}assets/images/logo/icon.png`,
                `${this.basePath}assets/images/logo/logo.png`,
                this.fallbackSVG
            ];

        // Find current index and try next fallback
        const currentIndex = currentPaths.indexOf(link.href);
        if (currentIndex < currentPaths.length - 1) {
            link.href = currentPaths[currentIndex + 1];
        }
    }

    /**
     * Get the best available logo path with fallback
     */
    getBestLogoPath() {
        const logoPaths = [
            `${this.basePath}assets/images/logo/logo.png`,
            `${this.basePath}assets/images/logo/icon.png`,
            `${this.basePath}assets/images/logo/favicon.png`,
            this.fallbackSVG
        ];

        return logoPaths[0]; // Return primary path, fallback will be handled by onerror
    }

    /**
     * Get fallback SVG directly
     */
    getFallbackSVG() {
        return this.fallbackSVG;
    }

    /**
     * Test logo availability
     */
    async testLogoAvailability(callback) {
        const logoPaths = [
            `${this.basePath}assets/images/logo/logo.png`,
            `${this.basePath}assets/images/logo/icon.png`,
            `${this.basePath}assets/images/logo/favicon.png`
        ];

        for (const path of logoPaths) {
            try {
                const img = new Image();
                img.onload = () => callback(path);
                img.onerror = () => {};
                img.src = path;
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                continue;
            }
        }
        
        // If all fail, use fallback
        callback(this.fallbackSVG);
    }
}

// Initialize favicon setup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DAMPFaviconSetup());
} else {
    new DAMPFaviconSetup();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPFaviconSetup;
}

// Make available globally for other components
window.DAMPFaviconSetup = DAMPFaviconSetup;