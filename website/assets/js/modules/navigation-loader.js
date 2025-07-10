/**
 * DAMP Navigation Loader - Template-based approach
 * Loads navigation HTML dynamically
 */

class NavigationLoader {
    constructor() {
        this.navigationHTML = null;
        this.currentPage = null;
    }

    async loadNavigation(targetElement, options = {}) {
        try {
            const depth = options.depth || 0;
            const currentPage = options.currentPage || 'home';
            
            if (!this.navigationHTML) {
                this.navigationHTML = await this.fetchNavigationTemplate();
            }

            const processedHTML = this.processTemplate(this.navigationHTML, {
                depth,
                currentPage,
                ...options
            });

            targetElement.innerHTML = processedHTML;
            this.initializeNavigation(targetElement);
            
        } catch (error) {
            console.error('Failed to load navigation:', error);
            this.loadFallbackNavigation(targetElement);
        }
    }

    async fetchNavigationTemplate() {
        const response = await fetch('/templates/navigation.html');
        if (!response.ok) {
            throw new Error('Failed to fetch navigation template');
        }
        return await response.text();
    }

    processTemplate(template, variables) {
        const basePath = '../'.repeat(variables.depth);
        
        return template
            .replace(/\{\{BASE_PATH\}\}/g, basePath)
            .replace(/\{\{CURRENT_PAGE\}\}/g, variables.currentPage)
            .replace(/\{\{LOGO_PATH\}\}/g, `${basePath}assets/images/logo/icon.png`) // ✅ FIXED: Use icon.png instead of favicon.png
            .replace(/\{\{NAV_LINKS\}\}/g, this.generateNavLinks(basePath, variables.currentPage))
            .replace(/\{\{MOBILE_NAV_LINKS\}\}/g, this.generateMobileNavLinks(basePath));
    }

    generateNavLinks(basePath, currentPage) {
        const links = [
            { href: '#features', text: 'Features', anchor: true },
            { href: '#products', text: 'Products', anchor: true },
            { href: '#app', text: 'App', anchor: true },
            { href: `${basePath}pages/support.html`, text: 'Support' },
            { href: `${basePath}pages/about.html`, text: 'About' },
            { href: `${basePath}pages/cart.html`, text: 'Cart', class: 'cart-link' }
        ];

        return links.map(link => `
            <li role="none">
                <a href="${link.href}" 
                   role="menuitem" 
                   class="${link.class || ''}"
                   ${link.anchor ? 'data-anchor="true"' : ''}>
                    ${link.text}
                </a>
            </li>
        `).join('');
    }

    generateMobileNavLinks(basePath) {
        const links = [
            { href: '#features', text: 'Features', subtitle: 'Why choose DAMP', icon: '⚡' },
            { href: '#products', text: 'Products', subtitle: 'Smart drinkware collection', icon: '🥤' },
            { href: '#app', text: 'Mobile App', subtitle: 'Control your devices', icon: '📱' },
            { href: `${basePath}pages/support.html`, text: 'Support', subtitle: 'Help & FAQ', icon: '🛠️' },
            { href: `${basePath}pages/about.html`, text: 'About', subtitle: 'Our story', icon: 'ℹ️' },
            { href: `${basePath}pages/cart.html`, text: 'Shopping Cart', subtitle: 'View your items', icon: '🛒', class: 'mobile-nav-cta' }
        ];

        return links.map(link => `
            <a href="${link.href}" class="mobile-nav-link ${link.class || ''}">
                <div class="mobile-nav-icon">${link.icon}</div>
                <div class="mobile-nav-info">
                    <span class="mobile-nav-title">${link.text}</span>
                    <span class="mobile-nav-subtitle">${link.subtitle}</span>
                </div>
                <div class="mobile-nav-arrow">›</div>
            </a>
        `).join('');
    }

    initializeNavigation(container) {
        const hamburger = container.querySelector('.hamburger');
        const closeBtn = container.querySelector('.mobile-close-btn');
        const backdrop = container.querySelector('.mobile-menu-backdrop');
        const overlay = container.querySelector('.mobile-menu-overlay');
        const mobileLinks = container.querySelectorAll('.mobile-nav-link');

        if (hamburger) {
            hamburger.addEventListener('click', () => this.toggleMenu(overlay, hamburger));
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeMenu(overlay, hamburger));
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeMenu(overlay, hamburger));
        }

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.closeMenu(overlay, hamburger), 300);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                this.closeMenu(overlay, hamburger);
            }
        });
    }

    toggleMenu(overlay, hamburger) {
        if (overlay.classList.contains('active')) {
            this.closeMenu(overlay, hamburger);
        } else {
            this.openMenu(overlay, hamburger);
        }
    }

    openMenu(overlay, hamburger) {
        overlay.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMenu(overlay, hamburger) {
        overlay.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }

    loadFallbackNavigation(targetElement) {
        targetElement.innerHTML = `
            <nav class="fallback-nav">
                <div class="nav-container">
                    <a href="/" class="logo">DAMP</a>
                    <ul class="nav-links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#products">Products</a></li>
                        <li><a href="pages/about.html">About</a></li>
                        <li><a href="pages/cart.html">Cart</a></li>
                    </ul>
                </div>
            </nav>
        `;
    }
}

// Export for use
window.NavigationLoader = NavigationLoader; 