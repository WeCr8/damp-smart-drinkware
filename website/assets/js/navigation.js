// DAMP Navigation - Universal Navigation System
// This file provides consistent navigation functionality across all pages

class DAMPNavigation {
    constructor() {
        this.mobileMenu = null;
        this.hamburger = null;
        this.navLinks = null;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get navigation elements
        this.mobileMenu = document.getElementById('mobile-menu');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.nav-links');

        // Set up event listeners
        this.setupEventListeners();

        // Setup smooth scrolling for anchor links
        this.setupSmoothScrolling();

        // Setup scroll effects
        this.setupScrollEffects();

        // Setup accessibility features
        this.setupAccessibility();
    }

    setupEventListeners() {
        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Mobile menu close button
        const closeBtn = document.querySelector('.mobile-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                this.mobileMenu && 
                !this.mobileMenu.contains(e.target) && 
                !this.hamburger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Close menu when clicking on mobile menu links
        if (this.mobileMenu) {
            const mobileLinks = this.mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    // Small delay to allow navigation to start
                    setTimeout(() => {
                        this.closeMobileMenu();
                    }, 100);
                });
            });
        }

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Prevent menu from staying open on orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }

    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        if (!this.mobileMenu || !this.hamburger) return;

        this.mobileMenu.classList.add('active');
        this.hamburger.classList.add('active');
        this.isMenuOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Set focus to first menu item for accessibility
        const firstLink = this.mobileMenu.querySelector('a');
        if (firstLink) {
            setTimeout(() => {
                firstLink.focus();
            }, 300);
        }

        // Add fade-in animation
        this.mobileMenu.classList.add('fade-in');
        
        // Emit custom event
        this.dispatchEvent('menuOpened');
    }

    closeMobileMenu() {
        if (!this.mobileMenu || !this.hamburger) return;

        this.mobileMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
        this.isMenuOpen = false;

        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove fade-in animation
        this.mobileMenu.classList.remove('fade-in');
        
        // Return focus to hamburger button
        this.hamburger.focus();
        
        // Emit custom event
        this.dispatchEvent('menuClosed');
    }

    handleResize() {
        // Close mobile menu if window is resized to desktop size
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    setupSmoothScrolling() {
        // Smooth scrolling for all anchor links
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
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
        const headerHeight = 80;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const nav = document.querySelector('nav');
        if (!nav) return;

        const updateNav = () => {
            const scrollY = window.scrollY;
            
            // Add scrolled class for styling
            if (scrollY > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
    }

    setupAccessibility() {
        // Add ARIA attributes
        if (this.hamburger) {
            this.hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            this.hamburger.setAttribute('aria-expanded', 'false');
            this.hamburger.setAttribute('aria-controls', 'mobile-menu');
        }

        if (this.mobileMenu) {
            this.mobileMenu.setAttribute('aria-hidden', 'true');
            this.mobileMenu.setAttribute('role', 'dialog');
            this.mobileMenu.setAttribute('aria-modal', 'true');
            this.mobileMenu.setAttribute('aria-labelledby', 'mobile-menu-title');
        }

        // Add screen reader only title
        if (this.mobileMenu && !this.mobileMenu.querySelector('#mobile-menu-title')) {
            const title = document.createElement('h2');
            title.id = 'mobile-menu-title';
            title.className = 'sr-only';
            title.textContent = 'Navigation Menu';
            this.mobileMenu.insertBefore(title, this.mobileMenu.firstChild);
        }

        // Update ARIA attributes when menu state changes
        this.addEventListener('menuOpened', () => {
            if (this.hamburger) {
                this.hamburger.setAttribute('aria-expanded', 'true');
            }
            if (this.mobileMenu) {
                this.mobileMenu.setAttribute('aria-hidden', 'false');
            }
        });

        this.addEventListener('menuClosed', () => {
            if (this.hamburger) {
                this.hamburger.setAttribute('aria-expanded', 'false');
            }
            if (this.mobileMenu) {
                this.mobileMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Event system
    addEventListener(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    dispatchEvent(event, data = null) {
        if (!this.eventListeners || !this.eventListeners[event]) return;
        
        this.eventListeners[event].forEach(callback => {
            callback(data);
        });
    }

    // Public methods
    isOpen() {
        return this.isMenuOpen;
    }

    open() {
        this.openMobileMenu();
    }

    close() {
        this.closeMobileMenu();
    }

    // Utility methods
    getCurrentPage() {
        return window.location.pathname;
    }

    updateActiveLink() {
        const currentPage = this.getCurrentPage();
        const links = document.querySelectorAll('.nav-links a, .mobile-menu a');
        
        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === currentPage || 
                (currentPage === '/' && href === '/index.html') ||
                (currentPage === '/index.html' && href === '/')) {
                link.classList.add('active');
            }
        });
    }

    // Debug methods
    getState() {
        return {
            isMenuOpen: this.isMenuOpen,
            hasHamburger: !!this.hamburger,
            hasMobileMenu: !!this.mobileMenu,
            hasNavLinks: !!this.navLinks,
            currentPage: this.getCurrentPage()
        };
    }
}

// Global functions for backward compatibility
function toggleMobileMenu() {
    if (window.dampNavigation) {
        window.dampNavigation.toggleMobileMenu();
    }
}

// Initialize navigation system
let dampNavigation;

function initNavigation() {
    dampNavigation = new DAMPNavigation();
    
    // Make it globally accessible
    window.dampNavigation = dampNavigation;
    
    // Update active link after initialization
    setTimeout(() => {
        dampNavigation.updateActiveLink();
    }, 100);
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPNavigation;
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && dampNavigation && dampNavigation.isOpen()) {
        dampNavigation.close();
    }
});

// Handle back/forward navigation
window.addEventListener('popstate', () => {
    if (dampNavigation && dampNavigation.isOpen()) {
        dampNavigation.close();
    }
});

// Console logging for debugging (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('DAMP Navigation System loaded');
    
    // Add global debug function
    window.debugNavigation = () => {
        if (dampNavigation) {
            console.log('Navigation State:', dampNavigation.getState());
        }
    };
} 