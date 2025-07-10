/**
 * DAMP Navigation - Professional Grade Navigation System
 * Following Google Material Design and Apple Human Interface Guidelines
 */

class DAMPNavigationSystem {
    constructor() {
        this.nav = null;
        this.mobileMenu = null;
        this.hamburger = null;
        this.backdrop = null;
        this.isMenuOpen = false;
        this.scrolled = false;
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.nav = document.getElementById('main-nav');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.hamburger = document.getElementById('hamburger-btn');
        this.backdrop = document.getElementById('mobile-menu-backdrop');
        
        if (!this.nav || !this.mobileMenu || !this.hamburger || !this.backdrop) {
            console.error('Navigation elements not found');
            return;
        }

        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupSmoothScrolling();
        this.setupAccessibility();
    }

    setupEventListeners() {
        // Hamburger menu toggle
        this.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });

        // Close button
        const closeBtn = document.getElementById('mobile-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
            });
        }

        // Backdrop click
        this.backdrop.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Mobile menu links
        const mobileLinks = this.mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // If it's an anchor link, close menu after navigation
                if (link.getAttribute('href').startsWith('#')) {
                    setTimeout(() => this.closeMobileMenu(), 300);
                } else {
                    this.closeMobileMenu();
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.innerWidth > 768 && this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }, 100);
        });
    }

    setupScrollEffects() {
        let ticking = false;

        const updateNav = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 50 && !this.scrolled) {
                this.nav.classList.add('scrolled');
                this.scrolled = true;
            } else if (scrollY <= 50 && this.scrolled) {
                this.nav.classList.remove('scrolled');
                this.scrolled = false;
            }

            this.lastScrollY = scrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    this.smoothScrollTo(target);
                }
            });
        });
    }

    smoothScrollTo(target) {
        const headerHeight = 100;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    setupAccessibility() {
        // Focus management
        this.mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // Announce menu state changes
        this.hamburger.addEventListener('click', () => {
            this.announceMenuState();
        });
    }

    handleTabNavigation(e) {
        const focusableElements = this.mobileMenu.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileMenu.classList.add('active');
        this.backdrop.classList.add('active');
        this.hamburger.classList.add('active');
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.mobileMenu.setAttribute('aria-hidden', 'false');
        
        this.isMenuOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first menu item
        const firstLink = this.mobileMenu.querySelector('.mobile-nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
        
        // Emit custom event
        this.dispatchEvent('menuOpened');
    }

    closeMobileMenu() {
        this.mobileMenu.classList.remove('active');
        this.backdrop.classList.remove('active');
        this.hamburger.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.mobileMenu.setAttribute('aria-hidden', 'true');
        
        this.isMenuOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to hamburger
        this.hamburger.focus();
        
        // Emit custom event
        this.dispatchEvent('menuClosed');
    }

    announceMenuState() {
        const message = this.isMenuOpen ? 'Menu closed' : 'Menu opened';
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.classList.add('sr-only');
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(`damp-nav-${eventName}`, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // Public API
    isOpen() {
        return this.isMenuOpen;
    }

    open() {
        this.openMobileMenu();
    }

    close() {
        this.closeMobileMenu();
    }

    toggle() {
        this.toggleMobileMenu();
    }
}

// Initialize navigation system
const dampNavigation = new DAMPNavigationSystem();

// Global functions for backward compatibility
window.toggleMobileMenu = () => dampNavigation.toggle();
window.openMobileMenu = () => dampNavigation.open();
window.closeMobileMenu = () => dampNavigation.close();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPNavigationSystem;
} 