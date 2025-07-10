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

        // Add comprehensive favicon setup
        const faviconLinks = [
            { rel: 'icon', type: 'image/x-icon', href: `${this.basePath}favicon.ico` },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${this.basePath}assets/images/logo/favicon.png` },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${this.basePath}assets/images/logo/favicon.png` },
            { rel: 'apple-touch-icon', sizes: '180x180', href: `${this.basePath}assets/images/logo/icon.png` },
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

            // Add meta tags for better mobile support
            const metaTags = [
                { name: 'msapplication-TileColor', content: '#0f0f23' },
                { name: 'theme-color', content: '#0f0f23' }
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