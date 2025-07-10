/**
 * DAMP Professional Mobile Menu - Viewport Constrained
 * Multiple close methods and professional animations
 */

class DAMPMobileMenu {
    constructor() {
        this.overlay = null;
        this.panel = null;
        this.backdrop = null;
        this.hamburger = null;
        this.closeBtn = null;
        this.closeHint = null;
        this.isOpen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isScrolling = false;
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
        this.overlay = document.getElementById('mobile-menu-overlay');
        this.panel = document.getElementById('mobile-menu-panel');
        this.backdrop = document.getElementById('mobile-menu-backdrop');
        this.hamburger = document.getElementById('hamburger-btn');
        this.closeBtn = document.getElementById('mobile-close-btn');
        this.closeHint = document.getElementById('close-hint');

        if (!this.overlay || !this.panel || !this.backdrop || !this.hamburger) {
            console.error('Mobile menu elements not found');
            return;
        }

        this.setupEventListeners();
        this.setupTouchGestures();
        this.setupAccessibility();
        this.updateCartBadge();
    }

    setupEventListeners() {
        // Hamburger menu toggle
        this.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // Backdrop click
        this.backdrop.addEventListener('click', () => {
            this.close();
        });

        // Navigation links
        const navLinks = this.panel.querySelectorAll('.mobile-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Add click feedback
                this.addClickFeedback(link);
                
                // Handle different link types
                if (href.startsWith('#')) {
                    // Smooth scroll to section
                    setTimeout(() => {
                        this.close();
                        this.smoothScrollToSection(href);
                    }, 150);
                } else {
                    // External page - close immediately
                    this.close();
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isOpen) {
                switch (e.key) {
                    case 'Escape':
                        this.close();
                        break;
                    case 'Tab':
                        this.handleTabNavigation(e);
                        break;
                }
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        });

        // Prevent scroll on body when menu is open
        this.overlay.addEventListener('touchmove', (e) => {
            if (this.isOpen && e.target === this.overlay) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupTouchGestures() {
        // Swipe to close
        this.panel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isScrolling = false;
        }, { passive: true });

        this.panel.addEventListener('touchmove', (e) => {
            if (!this.isScrolling) {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = touchX - this.touchStartX;
                const deltaY = touchY - this.touchStartY;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    this.isScrolling = true;
                    if (deltaX > 50) {
                        // Swipe right to close
                        this.close();
                    }
                }
            }
        }, { passive: true });

        // Double tap to close
        let lastTap = 0;
        this.backdrop.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                this.close();
            }
            lastTap = currentTime;
        });
    }

    setupAccessibility() {
        // Focus management
        this.overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // Announce state changes
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.overlay.setAttribute('aria-hidden', 'true');
    }

    handleTabNavigation(e) {
        if (!this.isOpen) return;

        const focusableElements = this.panel.querySelectorAll(
            'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
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

    handleResize() {
        if (window.innerWidth > 768 && this.isOpen) {
            this.close();
        }
    }

    addClickFeedback(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    smoothScrollToSection(href) {
        const target = document.querySelector(href);
        if (target) {
            const headerHeight = 100;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            // Get cart count from localStorage or API
            const cartCount = this.getCartCount();
            badge.textContent = cartCount;
            badge.style.display = cartCount > 0 ? 'block' : 'none';
        }
    }

    getCartCount() {
        // Implement your cart counting logic here
        try {
            const cart = JSON.parse(localStorage.getItem('dampCart') || '[]');
            return cart.reduce((total, item) => total + (item.quantity || 0), 0);
        } catch {
            return 0;
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;

        this.overlay.classList.add('active');
        this.hamburger.classList.add('active');
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.overlay.setAttribute('aria-hidden', 'false');
        this.isOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus first navigation item
        const firstNavLink = this.panel.querySelector('.mobile-nav-link');
        if (firstNavLink) {
            setTimeout(() => firstNavLink.focus(), 300);
        }

        // Update cart badge
        this.updateCartBadge();

        // Announce to screen readers
        this.announceMenuState('opened');

        // Emit custom event
        this.dispatchEvent('opened');
    }

    close() {
        if (!this.isOpen) return;

        this.overlay.classList.remove('active');
        this.hamburger.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.overlay.setAttribute('aria-hidden', 'true');
        this.isOpen = false;

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to hamburger
        this.hamburger.focus();

        // Announce to screen readers
        this.announceMenuState('closed');

        // Emit custom event
        this.dispatchEvent('closed');
    }

    announceMenuState(state) {
        const message = `Navigation menu ${state}`;
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.classList.add('sr-only');
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(`damp-menu-${eventName}`, {
            detail: { ...data, isOpen: this.isOpen },
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // Public API
    isMenuOpen() {
        return this.isOpen;
    }

    openMenu() {
        this.open();
    }

    closeMenu() {
        this.close();
    }

    toggleMenu() {
        this.toggle();
    }
}

// Initialize the mobile menu
const dampMobileMenu = new DAMPMobileMenu();

// Global functions for backward compatibility
window.toggleMobileMenu = () => dampMobileMenu.toggle();
window.openMobileMenu = () => dampMobileMenu.open();
window.closeMobileMenu = () => dampMobileMenu.close();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPMobileMenu;
} 