/* DAMP Smart Drinkware - Hero Animation Component */
/* Water Droplet Logo with Ripple Effects and Carbonation */

class DAMPHeroAnimation {
    constructor(options = {}) {
        this.animationDuration = options.duration || 7000; // 7 seconds for full sequence
        this.fadeOutDuration = options.fadeOutDuration || 1500; // 1.5 second fade out
        this.bubbleCount = 200; // Massive carbonation effect - 200 bubbles!
        this.animationContainer = null;
        this.hasPlayed = false;
        this.faviconSetup = null;
        
        // Animation control options
        this.playOnEveryLoad = options.playOnEveryLoad ?? true;
        this.allowSkip = options.allowSkip ?? true;
        this.playOnlyOnce = options.playOnlyOnce ?? false;
        this.skipIfReturningUser = options.skipIfReturningUser ?? false;
        
        // Animation timing phases
        this.phases = {
            dropletFall: 0,        // 0s - Logo starts falling like water droplet
            dropletLanding: 2000,  // 2s - Logo lands with ripple effect
            carbonationBurst: 2500, // 2.5s - Carbonation bubbles explode
            rippleExpansion: 3000,  // 3s - Ripple expands outward
            contentReveal: 5500     // 5.5s - Main content reveals
        };
        
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

        // Check if animation should play
        if (this.shouldPlayAnimation() && !this.hasPlayed) {
            this.createAnimationElements();
            this.startAnimation();
            this.hasPlayed = true;
        } else {
            this.skipAnimation();
        }
    }

    /**
     * Determine if animation should play based on configuration
     */
    shouldPlayAnimation() {
        // Check URL parameters for override
        const urlParams = new URLSearchParams(window.location.search);
        const skipParam = urlParams.get('skip-animation');
        const playParam = urlParams.get('play-animation');
        
        // URL parameter overrides
        if (skipParam === 'true') return false;
        if (playParam === 'true') return true;
        
        // Check if should play only once
        if (this.playOnlyOnce) {
            const hasPlayedBefore = localStorage.getItem('damp-hero-animation-played');
            if (hasPlayedBefore) return false;
        }
        
        // Check if should skip for returning users
        if (this.skipIfReturningUser) {
            const hasVisitedBefore = localStorage.getItem('damp-hero-animation-played');
            if (hasVisitedBefore) return false;
        }
        
        // Check reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }
        
        // Default behavior based on playOnEveryLoad setting
        return this.playOnEveryLoad;
    }

    /**
     * Check if this is the user's first visit (for analytics/tracking)
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
     * Create water droplet animation elements
     */
    createAnimationElements() {
        // Create main overlay container
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'hero-animation-overlay';
        this.animationContainer.setAttribute('role', 'presentation');
        this.animationContainer.setAttribute('aria-hidden', 'true');

        // Create water droplet logo container (starts off-screen)
        const dropletContainer = document.createElement('div');
        dropletContainer.className = 'water-droplet-container';

        const logo = document.createElement('img');
        logo.className = 'water-droplet-logo';
        logo.src = 'assets/images/logo/icon.png';
        logo.alt = 'DAMP Smart Drinkware Logo';
        logo.loading = 'eager';
        logo.onerror = () => {
            logo.src = 'assets/images/logo/favicon.png';
        };
        dropletContainer.appendChild(logo);

        // Create ripple effect container
        const rippleContainer = document.createElement('div');
        rippleContainer.className = 'ripple-container';

        // Create multiple ripple rings
        for (let i = 0; i < 5; i++) {
            const ripple = document.createElement('div');
            ripple.className = `ripple-ring ripple-${i + 1}`;
            ripple.style.cssText = `
                --ripple-delay: ${i * 0.2}s;
                --ripple-scale: ${1 + i * 0.3};
            `;
            rippleContainer.appendChild(ripple);
        }

        // Create enhanced carbonation container
        const carbonationContainer = document.createElement('div');
        carbonationContainer.className = 'enhanced-carbonation-container';

        // Create massive carbonation effect - 200 bubbles!
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'carbonation-bubble';
            bubble.setAttribute('aria-hidden', 'true');
            
            // Create 3 bubble types (no green!)
            const bubbleType = i % 3;
            bubble.classList.add(`bubble-type-${bubbleType}`);
            
            // Enhanced random positioning for better carbonation effect
            const size = Math.random() * 30 + 10; // 10-40px bubbles
            const delay = Math.random() * 3000 + 2500; // 2.5-5.5s delay (after landing)
            const duration = Math.random() * 4000 + 3000; // 3-7s duration
            const xPos = Math.random() * 100; // 0-100% horizontal
            const yStart = 100 + Math.random() * 30; // Start well below screen
            const xDrift = (Math.random() - 0.5) * 40; // -20% to +20% horizontal drift
            
            bubble.style.cssText = `
                --bubble-size: ${size}px;
                --bubble-delay: ${delay}ms;
                --bubble-duration: ${duration}ms;
                --bubble-x: ${xPos}%;
                --bubble-y-start: ${yStart}%;
                --bubble-x-drift: ${xDrift}%;
                --bubble-rotation: ${Math.random() * 360}deg;
            `;
            
            carbonationContainer.appendChild(bubble);
        }

        // Assemble all elements
        this.animationContainer.appendChild(dropletContainer);
        this.animationContainer.appendChild(rippleContainer);
        this.animationContainer.appendChild(carbonationContainer);

        // Add to DOM
        document.body.appendChild(this.animationContainer);
    }

    /**
     * Start the water droplet animation sequence
     */
    startAnimation() {
        // Ensure body is hidden during animation
        document.body.classList.add('page-loading');
        
        // Mark as played for tracking
        this.checkFirstVisit();
        
        // Start the animation phases
        this.runAnimationPhases();

        // Add event listeners for skip functionality
        if (this.allowSkip) {
            this.addSkipListeners();
        }
    }

    /**
     * Run the animation phases in sequence
     */
    runAnimationPhases() {
        // Phase 1: Water droplet starts falling immediately
        this.animationContainer.classList.add('phase-droplet-fall');
        
        // Phase 2: Droplet lands with impact
        setTimeout(() => {
            this.animationContainer.classList.add('phase-droplet-landing');
        }, this.phases.dropletLanding);
        
        // Phase 3: Carbonation bubbles explode after landing
        setTimeout(() => {
            this.animationContainer.classList.add('phase-carbonation-burst');
        }, this.phases.carbonationBurst);
        
        // Phase 4: Ripple expands outward
        setTimeout(() => {
            this.animationContainer.classList.add('phase-ripple-expansion');
        }, this.phases.rippleExpansion);
        
        // Phase 5: Content reveals
        setTimeout(() => {
            this.fadeOut();
        }, this.phases.contentReveal);
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
        
        // Add skip button for accessibility
        this.addSkipButton();
    }

    /**
     * Add accessible skip button
     */
    addSkipButton() {
        if (!this.animationContainer) return;
        
        const skipButton = document.createElement('button');
        skipButton.className = 'hero-skip-button';
        skipButton.textContent = 'Skip Animation';
        skipButton.setAttribute('aria-label', 'Skip hero animation');
        skipButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 212, 255, 0.2);
            color: var(--color-primary-500);
            border: 2px solid rgba(0, 212, 255, 0.5);
            border-radius: 25px;
            padding: 8px 16px;
            cursor: pointer;
            z-index: 10000;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        skipButton.addEventListener('click', () => {
            this.fadeOut();
        });
        
        skipButton.addEventListener('mouseenter', () => {
            skipButton.style.background = 'rgba(0, 212, 255, 0.3)';
            skipButton.style.borderColor = 'var(--color-primary-500)';
        });
        
        skipButton.addEventListener('mouseleave', () => {
            skipButton.style.background = 'rgba(0, 212, 255, 0.2)';
            skipButton.style.borderColor = 'rgba(0, 212, 255, 0.5)';
        });
        
        this.animationContainer.appendChild(skipButton);
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
                bubblesCount: this.bubbleCount,
                animationType: 'water-droplet-carbonation'
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
     * Static method to create animation with custom options
     */
    static create(options = {}) {
        return new DAMPHeroAnimation(options);
    }

    /**
     * Static method to reset animation state
     */
    static reset() {
        localStorage.removeItem('damp-hero-animation-played');
    }
}

// Make available globally
window.DAMPHeroAnimation = DAMPHeroAnimation; 