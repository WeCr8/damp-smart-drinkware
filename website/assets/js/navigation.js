/**
 * DAMP Navigation - Comprehensive Universal Navigation System
 * Combined from navigation.js and navigation-fixed.js
 * Professional Grade following Google Material Design and Apple Human Interface Guidelines
 * Copyright 2025 WeCr8 Solutions LLC
 */

class DAMPNavigation {
    constructor() {
        // Core Navigation Elements
        this.nav = null;
        this.mobileMenu = null;
        this.hamburger = null;
        this.backdrop = null;
        this.navLinks = null;
        
        // State Management
        this.isMenuOpen = false;
        this.scrolled = false;
        this.lastScrollY = 0;
        
        // Event Listeners Storage
        this.eventListeners = {};
        
        // Initialize the system
        this.init();
    }

    /**
     * Initialize the navigation system
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup all navigation components
     */
    setup() {
        this.findElements();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupSmoothScrolling();
        this.setupAccessibility();
        this.updateActiveLink();
        
        if (this.isDebugMode()) {
            console.log('🧭 DAMP Navigation System initialized', this.getState());
        }
    }

    /**
     * Find and cache DOM elements
     */
    findElements() {
        // Try multiple selectors for compatibility
        this.nav = document.getElementById('main-nav') || 
                   document.querySelector('nav') || 
                   document.querySelector('.damp-nav');
        
        this.mobileMenu = document.getElementById('mobile-menu') || 
                         document.querySelector('.safe-area-mobile-menu') || 
                         document.querySelector('.mobile-menu');
        
        this.hamburger = document.getElementById('hamburger-btn') || 
                        document.querySelector('.hamburger') || 
                        document.querySelector('.hamburger-menu');
        
        this.backdrop = document.getElementById('mobile-menu-backdrop') || 
                       document.querySelector('.mobile-menu-backdrop') || 
                       document.querySelector('.backdrop');
        
        this.navLinks = document.querySelector('.nav-links') || 
                       document.querySelector('.navigation-links');
        
        // Log missing critical elements
        if (!this.hamburger && this.isDebugMode()) {
            console.warn('🧭 Hamburger button not found');
        }
        if (!this.mobileMenu && this.isDebugMode()) {
            console.warn('🧭 Mobile menu not found');
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }

        // Close button (multiple possible selectors)
        const closeBtns = document.querySelectorAll(
            '#mobile-close-btn, .mobile-close, .cookie-settings-close, [data-action="close"]'
        );
        closeBtns.forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
            });
        });

        // Backdrop click to close
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Mobile menu links - close menu after navigation
        if (this.mobileMenu) {
            const mobileLinks = this.mobileMenu.querySelectorAll('a, .mobile-nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    
                    // If it's an anchor link, close menu after navigation
                    if (href && href.startsWith('#')) {
                        setTimeout(() => this.closeMobileMenu(), 300);
                    } else {
                        // Regular navigation - close immediately
                        setTimeout(() => this.closeMobileMenu(), 100);
                    }
                });
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Handle tab navigation in mobile menu
            if (this.isMenuOpen && e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Back/forward navigation
        window.addEventListener('popstate', () => {
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Click outside to close menu
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                this.mobileMenu && 
                !this.mobileMenu.contains(e.target) && 
                this.hamburger && 
                !this.hamburger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Setup scroll effects for navigation styling
     */
    setupScrollEffects() {
        let ticking = false;

        const updateNav = () => {
            const scrollY = window.scrollY;
            
            // Add scrolled class for styling when scrolled past threshold
            if (scrollY > 50 && !this.scrolled) {
                if (this.nav) {
                    this.nav.classList.add('scrolled', 'nav-scrolled');
                }
                this.scrolled = true;
            } else if (scrollY <= 50 && this.scrolled) {
                if (this.nav) {
                    this.nav.classList.remove('scrolled', 'nav-scrolled');
                }
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

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '#top') {
                    if (href === '#top') {
                        e.preventDefault();
                        this.smoothScrollToTop();
                    }
                    return;
                }

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    this.smoothScrollTo(target);
                }
            });
        });
    }

    /**
     * Smooth scroll to target element
     */
    smoothScrollTo(target) {
        const headerHeight = this.nav ? (this.nav.offsetHeight + 20) : 100;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });
    }

    /**
     * Smooth scroll to top
     */
    smoothScrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA attributes to hamburger
        if (this.hamburger) {
            this.hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            this.hamburger.setAttribute('aria-expanded', 'false');
            this.hamburger.setAttribute('aria-controls', 'mobile-menu');
            this.hamburger.setAttribute('role', 'button');
        }

        // Add ARIA attributes to mobile menu
        if (this.mobileMenu) {
            this.mobileMenu.setAttribute('aria-hidden', 'true');
            this.mobileMenu.setAttribute('role', 'dialog');
            this.mobileMenu.setAttribute('aria-modal', 'true');
            this.mobileMenu.setAttribute('aria-labelledby', 'mobile-menu-title');
        }

        // Add screen reader only title if it doesn't exist
        if (this.mobileMenu && !this.mobileMenu.querySelector('#mobile-menu-title')) {
            const title = document.createElement('h2');
            title.id = 'mobile-menu-title';
            title.className = 'sr-only';
            title.textContent = 'Navigation Menu';
            this.mobileMenu.insertBefore(title, this.mobileMenu.firstChild);
        }

        // Setup focus management
        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.handleTabNavigation(e);
                }
            });
        }

        // Update ARIA attributes on state changes
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

    /**
     * Handle tab navigation within mobile menu
     */
    handleTabNavigation(e) {
        if (!this.mobileMenu) return;

        const focusableElements = this.mobileMenu.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab (backward)
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            // Tab (forward)
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile menu if window is resized to desktop size
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Toggle mobile menu state
     */
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        if (!this.hamburger || !this.mobileMenu) {
            if (this.isDebugMode()) {
                console.warn('🧭 Cannot open menu: missing elements');
            }
            return;
        }

        // Update classes
        this.mobileMenu.classList.add('active');
        this.hamburger.classList.add('active');
        if (this.backdrop) {
            this.backdrop.classList.add('active');
        }

        // Update state
        this.isMenuOpen = true;
        
        // Prevent body scroll
        document.body.classList.add('mobile-menu-open');
        document.body.style.overflow = 'hidden';
        
        // Add fade-in animation
        this.mobileMenu.classList.add('fade-in');
        
        // Focus management
        const firstLink = this.mobileMenu.querySelector('a, .mobile-nav-link, button');
        if (firstLink) {
            setTimeout(() => {
                firstLink.focus();
            }, 300);
        }
        
        // Announce to screen readers
        this.announceMenuState();
        
        // Emit custom events
        this.dispatchEvent('menuOpened');
        
        if (this.isDebugMode()) {
            console.log('🧭 Mobile menu opened');
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.hamburger || !this.mobileMenu) return;

        // Update classes
        this.mobileMenu.classList.remove('active');
        this.hamburger.classList.remove('active');
        if (this.backdrop) {
            this.backdrop.classList.remove('active');
        }

        // Update state
        this.isMenuOpen = false;
        
        // Restore body scroll
        document.body.classList.remove('mobile-menu-open');
        document.body.style.overflow = '';
        
        // Remove fade-in animation
        this.mobileMenu.classList.remove('fade-in');
        
        // Return focus to hamburger button
        if (this.hamburger) {
            this.hamburger.focus();
        }
        
        // Announce to screen readers
        this.announceMenuState();
        
        // Emit custom events
        this.dispatchEvent('menuClosed');
        
        if (this.isDebugMode()) {
            console.log('🧭 Mobile menu closed');
        }
    }

    /**
     * Announce menu state changes to screen readers
     */
    announceMenuState() {
        const message = this.isMenuOpen ? 'Menu opened' : 'Menu closed';
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.classList.add('sr-only');
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }

    /**
     * Update active navigation link based on current page
     */
    updateActiveLink() {
        const currentPage = this.getCurrentPage();
        const links = document.querySelectorAll('.nav-links a, .mobile-menu a, .mobile-nav-link');
        
        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === currentPage || 
                (currentPage === '/' && href === '/index.html') ||
                (currentPage === '/index.html' && href === '/') ||
                (currentPage.includes(href) && href !== '#')) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Get current page path
     */
    getCurrentPage() {
        return window.location.pathname;
    }

    /**
     * Check if debug mode is enabled
     */
    isDebugMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    // ==========================================================================
    // EVENT SYSTEM
    // ==========================================================================

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (!this.eventListeners[event]) return;
        
        const index = this.eventListeners[event].indexOf(callback);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, data = null) {
        // Internal event system
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                callback(data);
            });
        }
        
        // DOM event system
        const event = new CustomEvent(`damp-nav-${eventName}`, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // ==========================================================================
    // PUBLIC API
    // ==========================================================================

    /**
     * Check if mobile menu is open
     */
    isOpen() {
        return this.isMenuOpen;
    }

    /**
     * Open mobile menu (public API)
     */
    open() {
        this.openMobileMenu();
    }

    /**
     * Close mobile menu (public API)
     */
    close() {
        this.closeMobileMenu();
    }

    /**
     * Toggle mobile menu (public API)
     */
    toggle() {
        this.toggleMobileMenu();
    }

    /**
     * Refresh navigation state
     */
    refresh() {
        this.updateActiveLink();
        this.handleResize();
    }

    /**
     * Get current navigation state (for debugging)
     */
    getState() {
        return {
            isMenuOpen: this.isMenuOpen,
            scrolled: this.scrolled,
            lastScrollY: this.lastScrollY,
            hasNav: !!this.nav,
            hasHamburger: !!this.hamburger,
            hasMobileMenu: !!this.mobileMenu,
            hasBackdrop: !!this.backdrop,
            hasNavLinks: !!this.navLinks,
            currentPage: this.getCurrentPage(),
            windowWidth: window.innerWidth,
            elements: {
                nav: !!this.nav,
                mobileMenu: !!this.mobileMenu,
                hamburger: !!this.hamburger,
                backdrop: !!this.backdrop,
                navLinks: !!this.navLinks
            }
        };
    }

    /**
     * Destroy navigation system (cleanup)
     */
    destroy() {
        // Close menu if open
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Clear event listeners
        this.eventListeners = {};
        
        // Remove global references
        if (window.dampNavigation === this) {
            window.dampNavigation = null;
        }
    }
}

// ==========================================================================
// INITIALIZATION AND GLOBAL FUNCTIONS
// ==========================================================================

// Global navigation instance
let dampNavigation;

/**
 * Initialize navigation system
 */
function initNavigation() {
    dampNavigation = new DAMPNavigation();
    
    // Make it globally accessible
    window.dampNavigation = dampNavigation;
    
    // Update active link after initialization
    setTimeout(() => {
        dampNavigation.updateActiveLink();
    }, 100);
    
    return dampNavigation;
}

// Global functions for backward compatibility
function toggleMobileMenu() {
    if (window.dampNavigation) {
        window.dampNavigation.toggle();
    }
}

function openMobileMenu() {
    if (window.dampNavigation) {
        window.dampNavigation.open();
    }
}

function closeMobileMenu() {
    if (window.dampNavigation) {
        window.dampNavigation.close();
    }
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

// Debug function (available in development)
if (typeof window !== 'undefined') {
    window.debugNavigation = () => {
        if (dampNavigation) {
            console.log('🧭 DAMP Navigation State:', dampNavigation.getState());
            return dampNavigation.getState();
        } else {
            console.warn('🧭 Navigation not initialized');
            return null;
        }
    };
}

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPNavigation;
}

// Console logging for debugging
if (typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1')) {
    console.log('🧭 DAMP Navigation System loaded successfully');
} 