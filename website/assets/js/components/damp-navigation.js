/**
 * DAMP Navigation - Modular Web Component
 * Reusable across all pages with zero configuration
 */

class DAMPNavigation extends HTMLElement {
    constructor() {
        super();
        this.isMenuOpen = false;
        this.currentPage = this.getAttribute('current-page') || 'home';
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.updateActiveLink();
    }

    render() {
        this.innerHTML = `
            <style>
                ${this.getStyles()}
            </style>
            <nav class="damp-nav" role="navigation" aria-label="Main navigation">
                <div class="nav-container">
                    <a href="${this.getBasePath()}" class="logo" aria-label="DAMP Smart Drinkware Home">
                        <img src="${this.getBasePath()}assets/images/logo/favicon.png" alt="DAMP Logo" width="32" height="32">
                        <span>DAMP</span>
                    </a>
                    
                    <ul class="nav-links" role="menubar">
                        ${this.getNavLinks()}
                    </ul>
                    
                    <button class="hamburger" aria-label="Toggle mobile menu" aria-expanded="false">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>
            
            <div class="mobile-menu-overlay" role="dialog" aria-modal="true" aria-hidden="true">
                <div class="mobile-menu-panel">
                    <div class="mobile-menu-header">
                        <div class="mobile-menu-logo">
                            <img src="${this.getBasePath()}assets/images/logo/favicon.png" alt="DAMP Logo" width="24" height="24">
                            <span>DAMP</span>
                        </div>
                        <button class="mobile-close-btn" aria-label="Close navigation menu">
                            <span>&times;</span>
                        </button>
                    </div>
                    
                    <nav class="mobile-nav-content">
                        ${this.getMobileNavLinks()}
                    </nav>
                    
                    <div class="mobile-menu-footer">
                        <div class="mobile-social-links">
                            <a href="#" aria-label="Instagram">📱</a>
                            <a href="#" aria-label="Twitter">🐦</a>
                            <a href="#" aria-label="Facebook">📘</a>
                        </div>
                        <p>Never leave your drink behind</p>
                    </div>
                </div>
                <div class="mobile-menu-backdrop"></div>
            </div>
        `;
    }

    getBasePath() {
        const depth = this.getAttribute('depth') || '0';
        return '../'.repeat(parseInt(depth));
    }

    getNavLinks() {
        const basePath = this.getBasePath();
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
                   class="${link.class || ''} ${this.isLinkActive(link.href) ? 'active' : ''}"
                   ${link.anchor ? 'data-anchor="true"' : ''}>
                    ${link.text}
                </a>
            </li>
        `).join('');
    }

    getMobileNavLinks() {
        const basePath = this.getBasePath();
        const links = [
            { href: '#features', text: 'Features', subtitle: 'Why choose DAMP', icon: '⚡', anchor: true },
            { href: '#products', text: 'Products', subtitle: 'Smart drinkware collection', icon: '🥤', anchor: true },
            { href: '#app', text: 'Mobile App', subtitle: 'Control your devices', icon: '📱', anchor: true },
            { href: `${basePath}pages/support.html`, text: 'Support', subtitle: 'Help & FAQ', icon: '🛠️' },
            { href: `${basePath}pages/about.html`, text: 'About', subtitle: 'Our story', icon: 'ℹ️' },
            { href: `${basePath}pages/cart.html`, text: 'Shopping Cart', subtitle: 'View your items', icon: '🛒', class: 'mobile-nav-cta' }
        ];

        return links.map(link => `
            <a href="${link.href}" 
               class="mobile-nav-link ${link.class || ''}"
               ${link.anchor ? 'data-anchor="true"' : ''}>
                <div class="mobile-nav-icon">${link.icon}</div>
                <div class="mobile-nav-info">
                    <span class="mobile-nav-title">${link.text}</span>
                    <span class="mobile-nav-subtitle">${link.subtitle}</span>
                </div>
                <div class="mobile-nav-arrow">›</div>
            </a>
        `).join('');
    }

    isLinkActive(href) {
        if (href.startsWith('#')) return false;
        const currentPath = window.location.pathname;
        return currentPath.includes(href.split('/').pop());
    }

    getStyles() {
        return `
            /* Embed critical navigation styles */
            :host {
                display: block;
                position: relative;
                z-index: 1000;
            }
            
            .damp-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: rgba(15, 15, 35, 0.95);
                backdrop-filter: blur(20px);
                z-index: 1000;
                padding: 15px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .nav-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
            }

            .logo {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 1.8rem;
                font-weight: 700;
                color: #00d4ff;
                text-decoration: none;
                transition: transform 0.3s ease;
            }

            .logo:hover {
                transform: scale(1.05);
            }

            .nav-links {
                display: flex;
                list-style: none;
                gap: 8px;
                margin: 0;
                padding: 0;
            }

            .nav-links a {
                color: white;
                text-decoration: none;
                font-weight: 500;
                padding: 12px 16px;
                border-radius: 12px;
                transition: all 0.3s ease;
            }

            .nav-links a:hover {
                background: rgba(0, 212, 255, 0.1);
                color: #00d4ff;
                transform: translateY(-2px);
            }

            .nav-links a.cart-link {
                background: linear-gradient(45deg, #00d4ff, #0099cc);
                color: white;
            }

            .hamburger {
                display: none;
                flex-direction: column;
                cursor: pointer;
                gap: 5px;
                padding: 12px;
                background: transparent;
                border: none;
                border-radius: 12px;
                transition: all 0.3s ease;
            }

            .hamburger span {
                width: 28px;
                height: 3px;
                background: white;
                transition: all 0.3s ease;
                border-radius: 2px;
            }

            .hamburger.active span:nth-child(1) {
                transform: rotate(45deg) translate(8px, 8px);
            }

            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }

            .hamburger.active span:nth-child(3) {
                transform: rotate(-45deg) translate(8px, -8px);
            }

            /* Mobile Menu Styles */
            .mobile-menu-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1001;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                pointer-events: none;
            }

            .mobile-menu-overlay.active {
                opacity: 1;
                visibility: visible;
                pointer-events: all;
            }

            .mobile-menu-panel {
                position: absolute;
                top: 0;
                right: 0;
                width: min(350px, 85vw);
                height: 100vh;
                background: rgba(15, 15, 35, 0.98);
                backdrop-filter: blur(20px);
                border-left: 1px solid rgba(255, 255, 255, 0.1);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .mobile-menu-overlay.active .mobile-menu-panel {
                transform: translateX(0);
            }

            .mobile-menu-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(10px);
            }

            .mobile-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .mobile-menu-logo {
                display: flex;
                align-items: center;
                gap: 8px;
                color: white;
                font-weight: 600;
            }

            .mobile-close-btn {
                background: transparent;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .mobile-close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .mobile-nav-content {
                flex: 1;
                overflow-y: auto;
                padding: 16px 0;
            }

            .mobile-nav-link {
                display: flex;
                align-items: center;
                gap: 16px;
                color: white;
                text-decoration: none;
                padding: 16px 24px;
                transition: all 0.3s ease;
            }

            .mobile-nav-link:hover {
                background: rgba(0, 212, 255, 0.1);
                transform: translateX(4px);
            }

            .mobile-nav-icon {
                font-size: 1.2rem;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }

            .mobile-nav-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .mobile-nav-title {
                font-weight: 500;
            }

            .mobile-nav-subtitle {
                font-size: 0.8rem;
                opacity: 0.7;
            }

            .mobile-nav-arrow {
                opacity: 0.7;
            }

            .mobile-nav-cta {
                background: linear-gradient(135deg, #00d4ff, #0099cc);
                margin: 16px 24px;
                border-radius: 12px;
            }

            .mobile-menu-footer {
                padding: 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                text-align: center;
            }

            .mobile-social-links {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin-bottom: 16px;
            }

            .mobile-social-links a {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                text-decoration: none;
                transition: all 0.3s ease;
            }

            .mobile-social-links a:hover {
                background: rgba(0, 212, 255, 0.2);
                transform: scale(1.1);
            }

            .mobile-menu-footer p {
                margin: 0;
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .nav-links {
                    display: none;
                }
                
                .hamburger {
                    display: flex;
                }
            }

            @media (max-width: 480px) {
                .mobile-menu-panel {
                    width: 100vw;
                    border-left: none;
                }
            }
        `;
    }

    setupEventListeners() {
        const hamburger = this.querySelector('.hamburger');
        const closeBtn = this.querySelector('.mobile-close-btn');
        const backdrop = this.querySelector('.mobile-menu-backdrop');
        const overlay = this.querySelector('.mobile-menu-overlay');
        const mobileLinks = this.querySelectorAll('.mobile-nav-link');

        hamburger.addEventListener('click', () => this.toggleMenu());
        closeBtn.addEventListener('click', () => this.closeMenu());
        backdrop.addEventListener('click', () => this.closeMenu());

        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.dataset.anchor) {
                    setTimeout(() => this.closeMenu(), 300);
                } else {
                    this.closeMenu();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const overlay = this.querySelector('.mobile-menu-overlay');
        const hamburger = this.querySelector('.hamburger');
        
        overlay.classList.add('active');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        
        this.isMenuOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        const overlay = this.querySelector('.mobile-menu-overlay');
        const hamburger = this.querySelector('.hamburger');
        
        overlay.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        
        this.isMenuOpen = false;
        document.body.style.overflow = '';
    }

    updateActiveLink() {
        const links = this.querySelectorAll('.nav-links a');
        links.forEach(link => {
            if (this.isLinkActive(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    }
}

// Register the custom element
customElements.define('damp-navigation', DAMPNavigation); 