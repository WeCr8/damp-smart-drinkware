/* DAMP Smart Drinkware - Hero Animation Component */
/* Golden Ratio Bubble Animation with Logo Emergence */

class DAMPHeroAnimation {
    constructor() {
        this.animationDuration = 5000; // 5 seconds
        this.fadeOutDuration = 1000; // 1 second fade out
        this.goldenRatio = 1.618;
        this.bubbleCount = 25; // 25 bubbles for large burst
        this.isFirstVisit = this.checkFirstVisit();
        this.animationContainer = null;
        this.hasPlayed = false;
        this.faviconSetup = null;
        
        this.init();
    }

    /**
     * Initialize the hero animation
     */
    init() {
        // Wait for favicon setup to be available
        if (window.DAMPFaviconSetup) {
            this.faviconSetup = new window.DAMPFaviconSetup();
        }

        // Only play animation on first visit or if explicitly requested
        if (this.isFirstVisit && !this.hasPlayed) {
            this.createAnimationElements();
            this.startAnimation();
            this.hasPlayed = true;
        } else {
            this.skipAnimation();
        }
    }

    /**
     * Check if this is the user's first visit
     */
    checkFirstVisit() {
        const visited = localStorage.getItem('damp-hero-animation-played');
        if (!visited) {
            localStorage.setItem('damp-hero-animation-played', 'true');
            return true;
        }
        return false;
    }

    /**
     * Get logo path with fallback chain
     */
    getLogoPath() {
        const isSubPage = window.location.pathname.includes('/pages/');
        const basePath = isSubPage ? '../' : '';
        
        return [
            `${basePath}assets/images/logo/logo.png`,
            `${basePath}assets/images/logo/icon.png`,
            `${basePath}assets/images/logo/favicon.png`,
            this.faviconSetup?.getFallbackSVG() || this.createFallbackSVG()
        ];
    }

    /**
     * Create white droplet SVG as final fallback
     */
    createFallbackSVG() {
        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <defs>
                    <radialGradient id="heroDropletGradient" cx="0.3" cy="0.3" r="0.8">
                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                        <stop offset="70%" style="stop-color:#e0e0e0;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#c0c0c0;stop-opacity:1" />
                    </radialGradient>
                    <filter id="heroDropShadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <path d="M50 10 
                         Q30 30 25 50 
                         Q25 70 35 80 
                         Q45 90 50 90 
                         Q55 90 65 80 
                         Q75 70 75 50 
                         Q70 30 50 10 Z" 
                      fill="url(#heroDropletGradient)" 
                      filter="url(#heroDropShadow)"
                      stroke="#a0a0a0" 
                      stroke-width="1"/>
                <ellipse cx="42" cy="35" rx="8" ry="12" fill="#ffffff" opacity="0.6"/>
                <ellipse cx="45" cy="30" rx="4" ry="6" fill="#ffffff" opacity="0.8"/>
            </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(svgString);
    }

    /**
     * Create animation elements
     */
    createAnimationElements() {
        // Create main container
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'hero-animation-overlay';
        this.animationContainer.setAttribute('role', 'presentation');
        this.animationContainer.setAttribute('aria-hidden', 'true');

        // Create bubble container
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'bubble-container';

        // Create golden ratio bubbles - 25 bubbles for large burst effect
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'golden-bubble';
            bubble.setAttribute('aria-hidden', 'true');
            bubbleContainer.appendChild(bubble);
        }

        // Create logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'hero-logo-container';

        const logo = document.createElement('img');
        logo.className = 'hero-logo';
        logo.src = 'assets/images/logo/icon.png';
        logo.alt = 'DAMP Smart Drinkware Logo';
        logo.loading = 'eager';
        logo.onerror = () => {
            // Fallback if logo doesn't load
            logo.src = 'assets/images/logo/favicon.png';
        };
        logoContainer.appendChild(logo);

        // Create text container
        const textContainer = document.createElement('div');
        textContainer.className = 'hero-animated-text';

        const title = document.createElement('h1');
        title.className = 'hero-animated-title';
        title.textContent = 'Never Leave Your Drink Behind';

        const subtitle = document.createElement('p');
        subtitle.className = 'hero-animated-subtitle';
        subtitle.textContent = 'Smart Drinkware Technology';

        textContainer.appendChild(title);
        textContainer.appendChild(subtitle);

        // Assemble elements
        this.animationContainer.appendChild(bubbleContainer);
        this.animationContainer.appendChild(logoContainer);
        this.animationContainer.appendChild(textContainer);

        // Add to DOM
        document.body.appendChild(this.animationContainer);
    }

    /**
     * Start the animation sequence
     */
    startAnimation() {
        // Ensure body is hidden during animation
        document.body.classList.add('page-loading');
        
        // Set up animation timing
        setTimeout(() => {
            this.fadeOut();
        }, this.animationDuration);

        // Add event listeners for skip functionality
        this.addSkipListeners();
    }

    /**
     * Add event listeners to allow skipping animation
     */
    addSkipListeners() {
        const skipAnimation = () => {
            this.fadeOut();
        };

        // Allow clicking or pressing any key to skip
        document.addEventListener('click', skipAnimation, { once: true });
        document.addEventListener('keydown', skipAnimation, { once: true });
        document.addEventListener('touchstart', skipAnimation, { once: true });
    }

    /**
     * Fade out animation and reveal main content
     */
    fadeOut() {
        if (!this.animationContainer) return;

        this.animationContainer.classList.add('fade-out');
        
        setTimeout(() => {
            this.cleanup();
            this.showMainContent();
        }, this.fadeOutDuration);
    }

    /**
     * Skip animation entirely
     */
    skipAnimation() {
        document.body.classList.add('page-loaded');
        document.body.classList.remove('page-loading');
    }

    /**
     * Show main content
     */
    showMainContent() {
        document.body.classList.add('page-loaded');
        document.body.classList.remove('page-loading');
        
        // Trigger any other initialization functions
        this.initializeMainContent();
    }

    /**
     * Initialize main content after animation
     */
    initializeMainContent() {
        // Trigger intersection observer for animations
        if (window.IntersectionObserver) {
            const animateElements = document.querySelectorAll('.animate-fade-in-up');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            animateElements.forEach(element => {
                observer.observe(element);
            });
        }

        // Dispatch custom event for other components
        const event = new CustomEvent('damp:heroAnimationComplete', {
            detail: { 
                timestamp: Date.now(),
                bubblesCount: this.bubbleCount
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Clean up animation elements
     */
    cleanup() {
        if (this.animationContainer) {
            this.animationContainer.classList.add('hidden');
            setTimeout(() => {
                if (this.animationContainer && this.animationContainer.parentNode) {
                    this.animationContainer.parentNode.removeChild(this.animationContainer);
                }
            }, 100);
        }
    }

    /**
     * Reset animation (for testing purposes)
     */
    static reset() {
        localStorage.removeItem('damp-hero-animation-played');
    }
}

// Initialize hero animation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DAMPHeroAnimation();
    });
} else {
    new DAMPHeroAnimation();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPHeroAnimation;
}

// Add to global namespace for debugging
window.DAMPHeroAnimation = DAMPHeroAnimation; 