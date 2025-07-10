// Favicon Setup Component - Ensures consistent favicon across all pages
class DAMPFaviconSetup {
    constructor() {
        this.isSubPage = window.location.pathname.includes('/pages/');
        this.basePath = this.isSubPage ? '../' : '';
        this.init();
    }

    init() {
        this.setupFavicons();
    }

    setupFavicons() {
        const head = document.head;
        
        // Remove existing favicon links to avoid duplicates
        const existingFavicons = head.querySelectorAll('link[rel*="icon"], link[rel="manifest"]');
        existingFavicons.forEach(link => {
            if (link.href.includes('favicon') || link.href.includes('icon') || link.href.includes('manifest')) {
                link.remove();
            }
        });

        // Add comprehensive favicon setup using favicon.ico and logo.png
        const faviconLinks = [
            // Main favicon - use favicon.ico for best browser compatibility
            { rel: 'icon', type: 'image/x-icon', href: `${this.basePath}favicon.ico` },
            { rel: 'shortcut icon', type: 'image/x-icon', href: `${this.basePath}favicon.ico` },
            
            // PNG favicons - use logo.png for all PNG-based favicons
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'icon', type: 'image/png', sizes: '192x192', href: `${this.basePath}assets/images/logo/logo.png` },
            
            // Apple touch icon - use logo.png for iOS devices
            { rel: 'apple-touch-icon', sizes: '180x180', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '152x152', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '144x144', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '120x120', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '114x114', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '76x76', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '72x72', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '60x60', href: `${this.basePath}assets/images/logo/logo.png` },
            { rel: 'apple-touch-icon', sizes: '57x57', href: `${this.basePath}assets/images/logo/logo.png` },
            
            // Manifest for PWA support
            { rel: 'manifest', href: `${this.basePath}manifest.json` }
        ];

        try {
            faviconLinks.forEach(linkData => {
                const link = document.createElement('link');
                Object.entries(linkData).forEach(([key, value]) => {
                    link.setAttribute(key, value);
                });
                head.appendChild(link);
            });

            // Add meta tags for better mobile and Windows tile support
            const metaTags = [
                { name: 'msapplication-TileColor', content: '#0f0f23' },
                { name: 'msapplication-TileImage', content: `${this.basePath}assets/images/logo/logo.png` },
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