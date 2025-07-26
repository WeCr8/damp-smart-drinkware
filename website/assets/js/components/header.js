// DAMP Smart Drinkware - Enhanced Navigation Component
// Google Engineering Standards with Security, Analytics & Safe Area Support
// Copyright 2025 WeCr8 Solutions LLC

class DAMPHeader extends HTMLElement {
    constructor() {
        super();
        this.isSubPage = false;
        this.basePath = '';
        this.isMenuOpen = false;
        this.eventListeners = new Map();
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.analyticsInitialized = false;
    }

    connectedCallback() {
        this.detectPageContext();
        this.render();
        this.initializeNavigation();
        this.setupSmoothScrolling();
        this.setupAnalytics();
        this.setupAccessibility();
        this.setupMobileSafeAreas();
        this.initializeDynamicUpdates();
        
        // Log successful initialization
        this.securityLog('DAMP Navigation initialized successfully');
    }

    detectPageContext() {
        // Enhanced page detection with security validation
        const pathname = this.sanitizeString(window.location.pathname);
        this.isSubPage = pathname.includes('/pages/');
        this.basePath = this.isSubPage ? '../' : '';
        
        // Validate base path for security
        if (!this.isValidBasePath(this.basePath)) {
            this.securityLog('Invalid base path detected, defaulting to root', 'warn');
            this.basePath = '';
        }
    }

    render() {
        // Secure HTML rendering with sanitized paths
        const logoSrc = this.sanitizeImagePath(`${this.basePath}assets/images/logo/icon.png`);
        const homeHref = this.sanitizeHref(`${this.basePath}index.html`);
        
        this.innerHTML = `
            <nav role="navigation" aria-label="Main navigation" class="damp-nav">
                <div class="nav-container safe-area-container">
                    <a href="${homeHref}" class="logo" aria-label="DAMP Smart Drinkware Home">
                        <img src="${logoSrc}" alt="DAMP Logo" width="32" height="32" loading="eager">
                        <span class="logo-text">DAMP</span>
                    </a>
                    
                    <ul class="nav-links" role="menubar">
                        <li><a href="${homeHref}" data-analytics="nav-home">Home</a></li>
                        <li><a href="${this.basePath}pages/how-it-works.html" data-analytics="nav-how-it-works">How It Works</a></li>
                        <li><a href="${this.basePath}pages/products.html" data-analytics="nav-products">Products</a></li>
                        <li><a href="${this.basePath}pages/support.html" data-analytics="nav-support">Support</a></li>
                        <li><a href="${this.basePath}pages/about.html" data-analytics="nav-about">About</a></li>
                        <li><a href="${this.basePath}pages/pre-order.html" class="nav-cta" data-analytics="nav-preorder">Pre-Order</a></li>
                    </ul>
                    
                    <button class="hamburger" 
                            aria-label="Toggle mobile menu" 
                            aria-expanded="false" 
                            aria-controls="mobile-menu"
                            data-analytics="nav-hamburger">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="sr-only">Menu</span>
                    </button>
                </div>
            </nav>
            
            <!-- Enhanced Mobile Menu with Complete Sitemap Navigation -->
            <div class="mobile-menu safe-area-mobile-menu" 
                 id="mobile-menu" 
                 role="dialog" 
                 aria-modal="true" 
                 aria-labelledby="mobile-menu-heading"
                 aria-hidden="true">
                 
                <div class="mobile-menu-header safe-area-top">
                    <div class="mobile-close" 
                         role="button" 
                         tabindex="0"
                         aria-label="Close mobile menu"
                         data-analytics="nav-mobile-close">
                        <span class="close-icon">&times;</span>
                    </div>
                </div>
                
                <div class="mobile-menu-content">
                    <h2 id="mobile-menu-heading" class="sr-only">Mobile Navigation Menu</h2>
                    
                    <!-- Primary Navigation -->
                    <nav class="mobile-nav" role="navigation">
                        <!-- Quick Actions (Most Important) -->
                        <div class="mobile-nav-section featured-section">
                            <h3 class="mobile-nav-section-title">🚀 Get Started</h3>
                            <a href="${this.basePath}pages/pre-sale-funnel.html" class="mobile-nav-cta-primary" data-analytics="mobile-nav-preorder-main">
                                <span class="mobile-nav-icon">🛒</span>
                                <div class="mobile-nav-content">
                                    <span class="mobile-nav-text">Pre-Order Now</span>
                                    <span class="mobile-nav-subtitle">Starting $29.99 • Early Bird Pricing</span>
                                </div>
                            </a>
                            <a href="${this.basePath}pages/product-voting.html" data-analytics="mobile-nav-voting-main">
                                <span class="mobile-nav-icon">🗳️</span>
                                <div class="mobile-nav-content">
                                    <span class="mobile-nav-text">Vote Next Product</span>
                                    <span class="mobile-nav-subtitle">Help us prioritize development</span>
                                </div>
                            </a>
                        </div>
                        
                        <!-- Main Navigation -->
                        <div class="mobile-nav-section">
                            <h3 class="mobile-nav-section-title">📍 Navigate</h3>
                            <a href="${homeHref}" data-analytics="mobile-nav-home">
                                <span class="mobile-nav-icon">🏠</span>
                                <span class="mobile-nav-text">Home</span>
                            </a>
                            <a href="${this.basePath}pages/how-it-works.html" data-analytics="mobile-nav-how-it-works">
                                <span class="mobile-nav-icon">⚡</span>
                                <span class="mobile-nav-text">How It Works</span>
                            </a>
                            <a href="${this.basePath}pages/products.html" data-analytics="mobile-nav-products">
                                <span class="mobile-nav-icon">📦</span>
                                <span class="mobile-nav-text">All Products</span>
                            </a>
                            <a href="${this.basePath}pages/about.html" data-analytics="mobile-nav-about">
                                <span class="mobile-nav-icon">ℹ️</span>
                                <span class="mobile-nav-text">About DAMP</span>
                            </a>
                        </div>
                        
                        <!-- Smart Drinkware Products -->
                        <div class="mobile-nav-section">
                            <h3 class="mobile-nav-section-title">🥤 Smart Products</h3>
                            <a href="${this.basePath}pages/damp-handle-v1.0.html" data-analytics="mobile-nav-handle">
                                <span class="mobile-nav-icon">🔗</span>
                                <div class="mobile-nav-content">
                                    <span class="mobile-nav-text">DAMP Handle</span>
                                    <span class="mobile-nav-subtitle">Universal clip-on • $49.99</span>
                                </div>
                            </a>
                            <a href="${this.basePath}pages/silicone-bottom-v1.0.html" data-analytics="mobile-nav-silicone">
                                <span class="mobile-nav-icon">⚪</span>
                                <div class="mobile-nav-content">
                                    <span class="mobile-nav-text">Silicone Bottom</span>
                                    <span class="mobile-nav-subtitle">Non-slip base • $29.99</span>
                                </div>
                            </a>
                            <a href="${this.basePath}pages/cup-sleeve-v1.0.html" data-analytics="mobile-nav-cup">
                                <span class="mobile-nav-icon">🥤</span>
                                <div class="mobile-nav-content">
                                    <span class="mobile-nav-text">Cup Sleeve</span>
                                    <span class="mobile-nav-subtitle">Adjustable fit • $34.99</span>
                                </div>
                            </a>
                        </div>
                        
                        <!-- Shopping & Account -->
                        <div class="mobile-nav-section">
                            <h3 class="mobile-nav-section-title">🛒 Shopping</h3>
                            <a href="${this.basePath}pages/cart.html" data-analytics="mobile-nav-cart">
                                <span class="mobile-nav-icon">🛒</span>
                                <span class="mobile-nav-text">View Cart</span>
                                <span class="cart-badge" id="mobile-cart-badge">0</span>
                            </a>
                            <a href="${this.basePath}pages/waitlist.html" data-analytics="mobile-nav-waitlist">
                                <span class="mobile-nav-icon">📝</span>
                                <span class="mobile-nav-text">Join Waitlist</span>
                            </a>
                            <a href="${this.basePath}pages/subscription.html" data-analytics="mobile-nav-subscription">
                                <span class="mobile-nav-icon">🔄</span>
                                <span class="mobile-nav-text">Subscriptions</span>
                            </a>
                        </div>
                        
                        <!-- Support & Help -->
                        <div class="mobile-nav-section">
                            <h3 class="mobile-nav-section-title">💬 Support</h3>
                            <a href="${this.basePath}pages/support.html" data-analytics="mobile-nav-support">
                                <span class="mobile-nav-icon">🎧</span>
                                <span class="mobile-nav-text">Help Center</span>
                            </a>
                            <a href="${this.basePath}pages/support.html#contact" data-analytics="mobile-nav-contact">
                                <span class="mobile-nav-icon">📧</span>
                                <span class="mobile-nav-text">Contact Us</span>
                            </a>
                            <a href="${this.basePath}pages/support.html#warranty" data-analytics="mobile-nav-warranty">
                                <span class="mobile-nav-icon">🛡️</span>
                                <span class="mobile-nav-text">Warranty Info</span>
                            </a>
                        </div>
                    </nav>
                    
                    <!-- Quick Social Proof -->
                    <div class="mobile-nav-social-proof">
                        <div class="social-proof-item">
                            <span class="proof-icon">👥</span>
                            <div class="proof-content">
                                <span class="proof-number" id="mobile-preorder-live">5,247+</span>
                                <span class="proof-label">Pre-Orders</span>
                            </div>
                        </div>
                        <div class="social-proof-item">
                            <span class="proof-icon">⭐</span>
                            <div class="proof-content">
                                <span class="proof-number">4.9★</span>
                                <span class="proof-label">Rating</span>
                            </div>
                        </div>
                        <div class="social-proof-item">
                            <span class="proof-icon">🌍</span>
                            <div class="proof-content">
                                <span class="proof-number">50+</span>
                                <span class="proof-label">Countries</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mobile-menu-footer safe-area-bottom">
                    <div class="mobile-legal-links">
                        <a href="${this.basePath}pages/privacy.html" data-analytics="mobile-nav-privacy">Privacy Policy</a>
                        <span class="legal-separator">•</span>
                        <a href="${this.basePath}pages/terms.html" data-analytics="mobile-nav-terms">Terms</a>
                        <span class="legal-separator">•</span>
                        <a href="${this.basePath}pages/cookie-policy.html" data-analytics="mobile-nav-cookies">Cookies</a>
                    </div>
                    <div class="mobile-footer-brand">
                        <span class="footer-copyright">© 2025 WeCr8 Solutions LLC</span>
                        <span class="footer-tagline">DAMP - Never Leave Your Drink Behind™</span>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Menu Backdrop -->
            <div class="mobile-menu-backdrop" aria-hidden="true"></div>
        `;
    }

    initializeNavigation() {
        const hamburger = this.querySelector('.hamburger');
        const mobileMenu = this.querySelector('.mobile-menu');
        const mobileClose = this.querySelector('.mobile-close');
        const backdrop = this.querySelector('.mobile-menu-backdrop');
        
        if (!hamburger || !mobileMenu) {
            this.securityLog('Critical navigation elements missing', 'error');
            return;
        }

        // Clear any existing listeners to prevent conflicts
        this.removeAllEventListeners();

        // Hamburger menu toggle with enhanced security
        this.addSecureEventListener(hamburger, 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu();
            this.trackAnalytics('hamburger_click', { action: this.isMenuOpen ? 'close' : 'open' });
        });

        // Touch events for better mobile responsiveness
        this.addSecureEventListener(hamburger, 'touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.addSecureEventListener(hamburger, 'touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = Math.abs(touchEndY - this.touchStartY);
            const deltaX = Math.abs(touchEndX - this.touchStartX);
            
            // Only trigger if it's a tap, not a swipe
            if (deltaY < 10 && deltaX < 10) {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        }, { passive: false });

        // Close button events
        if (mobileClose) {
            this.addSecureEventListener(mobileClose, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeMobileMenu();
                this.trackAnalytics('mobile_menu_close', { method: 'close_button' });
            });

            this.addSecureEventListener(mobileClose, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeMobileMenu();
                }
            });
        }

        // Backdrop click to close
        if (backdrop) {
            this.addSecureEventListener(backdrop, 'click', (e) => {
                e.preventDefault();
                this.closeMobileMenu();
                this.trackAnalytics('mobile_menu_close', { method: 'backdrop_click' });
            });
        }

        // Global click outside handler
        this.addSecureEventListener(document, 'click', (e) => {
            if (this.isMenuOpen && !this.contains(e.target) && !e.target.closest('.mobile-menu')) {
                this.closeMobileMenu();
                this.trackAnalytics('mobile_menu_close', { method: 'outside_click' });
            }
        });

        // Escape key handler
        this.addSecureEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
                this.trackAnalytics('mobile_menu_close', { method: 'escape_key' });
            }
        });

        // Mobile menu link handlers
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            this.addSecureEventListener(link, 'click', (e) => {
                const href = link.getAttribute('href');
                const analyticsAction = link.getAttribute('data-analytics');
                
                // Track the click
                if (analyticsAction) {
                    this.trackAnalytics('mobile_nav_click', { 
                        link: analyticsAction,
                        href: href 
                    });
                }
                
                // Handle different link types
                if (href.startsWith('#')) {
                    // Anchor link - prevent default and smooth scroll
                    e.preventDefault();
                    this.handleAnchorNavigation(href);
                } else {
                    // Regular link - let it navigate but close menu
                    setTimeout(() => {
                        this.closeMobileMenu();
                    }, 150);
                }
            });
        });

        // Window resize handler
        this.addSecureEventListener(window, 'resize', this.debounce(() => {
            if (window.innerWidth > 768 && this.isMenuOpen) {
                this.closeMobileMenu();
            }
            this.updateSafeAreas();
        }, 250));

        // Orientation change handler
        this.addSecureEventListener(window, 'orientationchange', () => {
            setTimeout(() => {
                if (this.isMenuOpen) {
                    this.updateSafeAreas();
                }
            }, 300);
        });

        // Page visibility change
        this.addSecureEventListener(document, 'visibilitychange', () => {
            if (document.hidden && this.isMenuOpen) {
                this.closeMobileMenu();
            }
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
        const hamburger = this.querySelector('.hamburger');
        const mobileMenu = this.querySelector('.mobile-menu');
        const backdrop = this.querySelector('.mobile-menu-backdrop');
        
        if (!hamburger || !mobileMenu) return;

        this.securityLog('Opening mobile menu');
        
        this.isMenuOpen = true;
        
        // Update classes and attributes
        mobileMenu.classList.add('active');
        hamburger.classList.add('active');
        backdrop?.classList.add('active');
        
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll with safe area support
        document.body.style.overflow = 'hidden';
        document.body.classList.add('mobile-menu-open');
        
        // Update safe areas
        this.updateSafeAreas();
        
        // Focus management for accessibility
        const firstLink = mobileMenu.querySelector('a');
        if (firstLink) {
            setTimeout(() => {
                firstLink.focus();
            }, 300);
        }
        
        // Track analytics
        this.trackAnalytics('mobile_menu_open', {
            timestamp: Date.now(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    }

    closeMobileMenu() {
        const hamburger = this.querySelector('.hamburger');
        const mobileMenu = this.querySelector('.mobile-menu');
        const backdrop = this.querySelector('.mobile-menu-backdrop');
        
        if (!hamburger || !mobileMenu) return;

        this.securityLog('Closing mobile menu');
        
        this.isMenuOpen = false;
        
        // Update classes and attributes
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        backdrop?.classList.remove('active');
        
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-menu-open');
        
        // Return focus to hamburger
        setTimeout(() => {
            hamburger.focus();
        }, 100);
    }

    setupSmoothScrolling() {
        const anchors = this.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
            this.addSecureEventListener(anchor, 'click', (e) => {
                const href = anchor.getAttribute('href');
                if (href.length <= 1) return;
                
                e.preventDefault();
                this.handleAnchorNavigation(href);
            });
        });
    }

    handleAnchorNavigation(href) {
        const target = document.querySelector(href);
        if (target) {
            // Close mobile menu if open
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Calculate proper scroll position with safe areas
            const headerHeight = this.calculateHeaderHeight();
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
            
            // Track analytics
            this.trackAnalytics('anchor_navigation', {
                target: href,
                from_mobile: this.isMenuOpen
            });
        }
    }

    setupAnalytics() {
        // Initialize analytics tracking if consent given
        if (this.hasAnalyticsConsent()) {
            this.analyticsInitialized = true;
            this.trackAnalytics('navigation_initialized', {
                page: window.location.pathname,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            });
        }
    }

    setupAccessibility() {
        // Add ARIA live region for screen readers
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'nav-live-region';
        document.body.appendChild(liveRegion);
        
        // Add skip link
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'Skip to main content';
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    }

    setupMobileSafeAreas() {
        // Integration with DAMP SafeAreaWrapper
        if (window.dampSafeArea) {
            const deviceInfo = window.dampSafeArea.getDeviceInfo();
            this.securityLog(`Using DAMP SafeAreaWrapper - Device: ${deviceInfo.deviceType}, Orientation: ${deviceInfo.orientation}, Screen: ${deviceInfo.screenSize}`);
            
            // Listen for safe area updates
            window.addEventListener('damp:safearea:orientationchange', (e) => {
                this.securityLog('Safe area orientation changed:', e.detail);
                this.updateSafeAreas();
            });
            
            window.addEventListener('damp:safearea:screensize', (e) => {
                this.securityLog('Screen size changed:', e.detail);
                this.updateSafeAreas();
            });
        } else {
            // Fallback if SafeAreaWrapper not available
            this.securityLog('DAMP SafeAreaWrapper not available, using fallback');
            this.setupFallbackSafeAreas();
        }
        
        // Update safe area calculations
        this.updateSafeAreas();
    }
    
    setupFallbackSafeAreas() {
        // Fallback device detection (only if SafeAreaWrapper not available)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const hasNotch = window.screen.height >= 812 && window.devicePixelRatio >= 2;
        
        // Add legacy device classes as fallback
        if (isIOS) document.body.classList.add('ios-device');
        if (isAndroid) document.body.classList.add('android-device');
        if (hasNotch) document.body.classList.add('has-notch');
        
        this.securityLog(`Fallback setup complete - iOS: ${isIOS}, Android: ${isAndroid}, Notch: ${hasNotch}`);
    }

    updateSafeAreas() {
        const nav = this.querySelector('nav');
        if (!nav) return;
        
        if (window.dampSafeArea) {
            // Use DAMP SafeAreaWrapper values - they're already applied globally
            const deviceInfo = window.dampSafeArea.getDeviceInfo();
            const safeAreas = {
                top: window.dampSafeArea.getSafeAreaValue('top'),
                right: window.dampSafeArea.getSafeAreaValue('right'),
                bottom: window.dampSafeArea.getSafeAreaValue('bottom'),
                left: window.dampSafeArea.getSafeAreaValue('left')
            };
            
            this.securityLog('Safe areas updated via SafeAreaWrapper:', safeAreas);
            
            // The SafeAreaWrapper already applies global CSS variables, so we don't need to do it here
            // But we can add any component-specific adjustments if needed
            
        } else {
            // Fallback safe area calculation
            const safeAreaTop = this.getSafeAreaValue('top');
            const safeAreaBottom = this.getSafeAreaValue('bottom');
            const safeAreaLeft = this.getSafeAreaValue('left');
            const safeAreaRight = this.getSafeAreaValue('right');
            
            // Apply safe area CSS custom properties as fallback
            nav.style.setProperty('--damp-safe-area-top', safeAreaTop);
            nav.style.setProperty('--damp-safe-area-bottom', safeAreaBottom);
            nav.style.setProperty('--damp-safe-area-left', safeAreaLeft);
            nav.style.setProperty('--damp-safe-area-right', safeAreaRight);
            
            // Update mobile menu safe areas
            const mobileMenu = this.querySelector('.mobile-menu');
            if (mobileMenu) {
                mobileMenu.style.setProperty('--damp-safe-area-top', safeAreaTop);
                mobileMenu.style.setProperty('--damp-safe-area-bottom', safeAreaBottom);
                mobileMenu.style.setProperty('--damp-safe-area-left', safeAreaLeft);
                mobileMenu.style.setProperty('--damp-safe-area-right', safeAreaRight);
            }
            
            this.securityLog('Safe areas updated via fallback');
        }
    }

    // Security and utility methods
    addSecureEventListener(element, event, handler, options = {}) {
        const secureHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                this.securityLog(`Event handler error: ${error.message}`, 'error');
            }
        };
        
        element.addEventListener(event, secureHandler, options);
        
        // Store for cleanup
        const key = `${event}_${Date.now()}_${Math.random()}`;
        this.eventListeners.set(key, { element, event, handler: secureHandler, options });
    }

    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners.clear();
    }

    sanitizeString(str) {
        return str.replace(/[<>\"'&]/g, match => {
            const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' };
            return map[match];
        });
    }

    sanitizeImagePath(path) {
        // Only allow relative paths and specific image extensions
        if (!/^\.\.?\/.*\.(png|jpg|jpeg|gif|svg|webp)$/i.test(path)) {
            this.securityLog(`Invalid image path blocked: ${path}`, 'warn');
            return 'assets/images/logo/icon.png'; // Fallback
        }
        return path;
    }

    sanitizeHref(href) {
        // Only allow relative paths and anchors
        if (!/^(\.\.?\/|#)/.test(href)) {
            this.securityLog(`Invalid href blocked: ${href}`, 'warn');
            return '#'; // Safe fallback
        }
        return href;
    }

    isValidBasePath(path) {
        return /^(\.\.\/)?$/.test(path);
    }

    getSafeAreaValue(side) {
        const envValue = `env(safe-area-inset-${side})`;
        const testEl = document.createElement('div');
        testEl.style.cssText = `position: absolute; top: -9999px; height: ${envValue};`;
        document.body.appendChild(testEl);
        const computedHeight = window.getComputedStyle(testEl).height;
        document.body.removeChild(testEl);
        return computedHeight === '0px' ? '0px' : envValue;
    }

    calculateHeaderHeight() {
        const nav = this.querySelector('nav');
        return nav ? nav.offsetHeight + 20 : 100; // 20px buffer
    }

    hasAnalyticsConsent() {
        // Check for cookie consent or analytics preference
        return localStorage.getItem('cookieAccepted') === 'true' || 
               window.dampCookieConsent?.getConsentStatus()?.canUseAnalytics;
    }

    trackAnalytics(event, data = {}) {
        if (!this.analyticsInitialized || !this.hasAnalyticsConsent()) return;
        
        try {
            if (window.gtag) {
                window.gtag('event', event, {
                    event_category: 'navigation',
                    event_label: JSON.stringify(data),
                    custom_map: { dimension1: 'damp_navigation' }
                });
            }
        } catch (error) {
            this.securityLog(`Analytics tracking error: ${error.message}`, 'warn');
        }
    }

    securityLog(message, level = 'info') {
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDev) {
            console[level](`[DAMP Navigation Security] ${message}`);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Update cart badge count
    updateCartBadge(count = 0) {
        const cartBadge = this.querySelector('#mobile-cart-badge');
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // Update live statistics
    updateLiveStats(preOrders = null, rating = null) {
        const preOrderElement = this.querySelector('#mobile-preorder-live');
        if (preOrderElement && preOrders) {
            // Animate number change
            this.animateNumberChange(preOrderElement, preOrders);
        }
    }
    
    // Animate number changes for live stats
    animateNumberChange(element, newValue) {
        const currentText = element.textContent;
        const currentNumber = parseInt(currentText.replace(/[^0-9]/g, '')) || 0;
        const targetNumber = typeof newValue === 'string' ? 
            parseInt(newValue.replace(/[^0-9]/g, '')) || 0 : newValue;
        
        if (currentNumber === targetNumber) return;
        
        const duration = 1000; // 1 second
        const steps = 30;
        const increment = (targetNumber - currentNumber) / steps;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            const currentValue = Math.round(currentNumber + (increment * step));
            
            if (step >= steps) {
                element.textContent = this.formatStatNumber(targetNumber);
                clearInterval(timer);
            } else {
                element.textContent = this.formatStatNumber(currentValue);
            }
        }, duration / steps);
    }
    
    // Format statistics numbers
    formatStatNumber(num) {
        if (num >= 1000) {
            return Math.floor(num / 1000) + ',' + (num % 1000).toString().padStart(3, '0') + '+';
        }
        return num + '+';
    }
    
    // Initialize dynamic updates
    initializeDynamicUpdates() {
        // Simulate live updates (in real app, this would come from API)
        setTimeout(() => {
            this.updateLiveStats('5,289'); // Increase pre-orders
        }, 30000); // After 30 seconds
        
        // Listen for cart updates from other components
        window.addEventListener('cart:updated', (e) => {
            this.updateCartBadge(e.detail.count);
        });
        
        // Listen for stats updates
        window.addEventListener('stats:updated', (e) => {
            this.updateLiveStats(e.detail.preOrders, e.detail.rating);
        });
    }

    disconnectedCallback() {
        // Cleanup when component is removed
        this.removeAllEventListeners();
        document.body.classList.remove('mobile-menu-open');
        document.body.style.overflow = '';
        this.securityLog('Navigation component disconnected and cleaned up');
    }
}

// Define the custom element
customElements.define('damp-header', DAMPHeader);

// Global functions for backward compatibility and debugging
window.toggleMobileMenu = function() {
    const header = document.querySelector('damp-header');
    if (header) {
        header.toggleMobileMenu();
    }
};

window.debugNavigation = function() {
    const header = document.querySelector('damp-header');
    if (header) {
        console.log('DAMP Navigation Debug:', {
            isOpen: header.isMenuOpen,
            hasHamburger: !!header.querySelector('.hamburger'),
            hasMobileMenu: !!header.querySelector('.mobile-menu'),
            eventListeners: header.eventListeners.size,
            analyticsEnabled: header.analyticsInitialized,
            safeAreas: {
                top: header.getSafeAreaValue('top'),
                bottom: header.getSafeAreaValue('bottom'),
                left: header.getSafeAreaValue('left'),
                right: header.getSafeAreaValue('right')
            }
        });
    }
};

// Global helper functions for integration with other components
window.updateCartBadge = function(count) {
    const header = document.querySelector('damp-header');
    if (header) {
        header.updateCartBadge(count);
    }
    
    // Dispatch event for other components that might need to know
    window.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { count }
    }));
};

window.updateLiveStats = function(preOrders, rating) {
    const header = document.querySelector('damp-header');
    if (header) {
        header.updateLiveStats(preOrders, rating);
    }
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('stats:updated', {
        detail: { preOrders, rating }
    }));
};

// Helper to close mobile menu from external scripts
window.closeMobileMenu = function() {
    const header = document.querySelector('damp-header');
    if (header && header.isMenuOpen) {
        header.closeMobileMenu();
    }
};

// Enhanced error handling
window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('header.js')) {
        console.error('[DAMP Navigation] Critical error:', e.error);
    }
}); 