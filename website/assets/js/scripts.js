/**
 * DAMP Smart Drinkware - Main JavaScript
 * Copyright 2025 WeCr8 Solutions LLC
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

/**
 * Initialize all website functionality
 */
function initializeWebsite() {
    setupNavigation();
    setupMobileMenu();
    setupScrollEffects();
    setupAnimations();
    setupFloatingParticles();
    console.log('DAMP Smart Drinkware website initialized');
}

/**
 * Navigation and scrolling functionality
 */
function setupNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = 80; // Account for fixed header
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(15, 15, 35, 0.95)';
        } else {
            nav.style.background = 'rgba(15, 15, 35, 0.9)';
        }
    });
}

/**
 * Mobile menu functionality
 */
function setupMobileMenu() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const mobileMenu = document.getElementById('mobileMenu');
        const hamburger = document.querySelector('.hamburger');
        
        if (mobileMenu && hamburger && 
            !mobileMenu.contains(event.target) && 
            !hamburger.contains(event.target)) {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const mobileMenu = document.getElementById('mobileMenu');
            const hamburger = document.querySelector('.hamburger');
            
            if (mobileMenu && hamburger) {
                mobileMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
}

/**
 * Mobile menu toggle function (called from HTML)
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    
    if (mobileMenu && hamburger) {
        mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

/**
 * Scroll-based effects and animations
 */
function setupScrollEffects() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards and product cards for animation
    document.querySelectorAll('.feature-card, .product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * Setup various animations
 */
function setupAnimations() {
    // Add CSS for floating particles animation
    if (!document.querySelector('#floating-particles-style')) {
        const style = document.createElement('style');
        style.id = 'floating-particles-style';
        style.textContent = `
            @keyframes floatUp {
                from {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Create and manage floating particles
 */
function setupFloatingParticles() {
    // Create floating particle effect
    function createFloatingParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(0, 212, 255, ${Math.random() * 0.3 + 0.1})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.animation = `floatUp ${Math.random() * 10 + 10}s linear forwards`;
        particle.style.zIndex = '1';
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle && particle.parentNode) {
                particle.remove();
            }
        }, 20000);
    }

    // Create particles periodically
    setInterval(createFloatingParticle, 3000);
}

/**
 * Pre-order functionality
 */
function preOrderProduct(productId) {
    // Map product IDs to names for better UX
    const productNames = {
        'damp-handle': 'DAMP Handle v1.0',
        'silicone-bottom': 'DAMP Silicone Bottom', 
        'cup-sleeve': 'DAMP Silicone Cup Sleeve',
        'baby-bottle': 'DAMP Baby Bottle'
    };
    
    const productName = productNames[productId] || productId;
    
    // Show pre-order confirmation
    if (confirm(`Ready to pre-order the ${productName}?\n\nBy pre-ordering, you're helping fund the development of this innovative product. You'll receive:\n\n✅ Early bird pricing\n✅ Development updates\n✅ Priority delivery\n✅ Exclusive access to beta features\n\nContinue to checkout?`)) {
        // Track pre-order attempt (for analytics)
        trackEvent('pre_order_attempt', {
            product_id: productId,
            product_name: productName
        });
        
        // Show success message
        alert(`Thank you for supporting DAMP development! 🚀\n\nYour pre-order for ${productName} helps us bring this product to market.\n\nYou'll be redirected to secure checkout...`);
        
        // In a real implementation, redirect to checkout
        // window.location.href = `https://checkout.dampdrink.com/preorder/${productId}`;
        
        // For now, show implementation note
        console.log(`Pre-order initiated for: ${productName} (${productId})`);
        console.log('To implement: Connect to payment processor (Stripe, PayPal, etc.)');
    }
}

/**
 * App waitlist functionality
 */
function joinWaitlist(platform) {
    const platformName = platform === 'ios' ? 'iOS' : 'Android';
    
    if (confirm(`Join the DAMP ${platformName} App waitlist?\n\nYou'll be notified when:\n✅ Beta version is ready\n✅ App launches in store\n✅ New features are available\n\nPre-order customers get priority access!`)) {
        // Track waitlist signup
        trackEvent('app_waitlist_signup', {
            platform: platform
        });
        
        alert(`Thanks for joining the ${platformName} waitlist! 📱\n\nWe'll email you as soon as the app is ready for testing.`);
        
        // In a real implementation, collect email and platform preference
        // window.location.href = `https://dampdrink.com/waitlist?platform=${platform}`;
        
        console.log(`Waitlist signup for: ${platformName}`);
        console.log('To implement: Email collection form and database storage');
    }
}

/**
 * Legacy function aliases for compatibility
 */
function purchaseProduct(productId) {
    preOrderProduct(productId);
}

function downloadApp(platform) {
    joinWaitlist(platform);
}

/**
 * Analytics tracking function
 */
function trackEvent(eventName, properties = {}) {
    // Basic console logging for development
    console.log(`Event: ${eventName}`, properties);
    
    // In production, implement with Google Analytics, Mixpanel, etc.
    // Example:
    // gtag('event', eventName, properties);
    // mixpanel.track(eventName, properties);
}

/**
 * Utility functions
 */
function debounce(func, wait) {
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * Error handling
 */
window.addEventListener('error', function(e) {
    console.error('DAMP Website Error:', e.error);
    // In production, send to error tracking service
});

/**
 * Performance monitoring
 */
window.addEventListener('load', function() {
    // Basic performance logging
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Track loading performance
        trackEvent('page_load_time', {
            load_time: loadTime,
            page: 'landing'
        });
    }
});

/**
 * Browser compatibility checks
 */
function checkBrowserSupport() {
    const features = {
        css_grid: CSS.supports('display', 'grid'),
        css_backdrop_filter: CSS.supports('backdrop-filter', 'blur(10px)'),
        intersection_observer: 'IntersectionObserver' in window,
        local_storage: 'localStorage' in window
    };
    
    console.log('Browser feature support:', features);
    
    // Warn about unsupported features
    if (!features.css_grid) {
        console.warn('CSS Grid not supported - layout may be affected');
    }
    
    return features;
}

// Run browser compatibility check
checkBrowserSupport();

// Global tracking function for all pages
window.trackEvent = function(eventName, parameters = {}) {
    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
    
    // Console logging for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Track Event:', eventName, parameters);
    }
    
    // Custom analytics if needed
    if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track(eventName, parameters);
    }
};