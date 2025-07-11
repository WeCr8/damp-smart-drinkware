/* DAMP Smart Drinkware - Hero Animation Component */
/* Brand Messaging Sequence with Carbonation Screen */

class DAMPHeroAnimation {
    constructor(options = {}) {
        this.animationDuration = options.duration || 8000; // 8 seconds for full sequence
        this.fadeOutDuration = options.fadeOutDuration || 1500; // 1.5 second fade out
        this.bubbleCount = 300; // Massive carbonation screen - 300 bubbles!
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
            carbonationScreen: 0,        // 0s - Full screen of bubbles starts
            logoEmergence: 2000,         // 2s - Logo emerges from bubbles with large aura
            firstText: 4000,             // 4s - "Never Leave a Drink Behind"
            secondText: 6000,            // 6s - "DAMP Drink Abandonment Monitoring Protocol"
            contentReveal: 7500          // 7.5s - Main content reveals
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
     * Create brand messaging animation elements
     */
    createAnimationElements() {
        // Create main overlay container
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'hero-animation-overlay';
        this.animationContainer.setAttribute('role', 'presentation');
        this.animationContainer.setAttribute('aria-hidden', 'true');

        // Create full-screen carbonation background
        const carbonationScreen = document.createElement('div');
        carbonationScreen.className = 'carbonation-screen';

        // Create massive carbonation effect - 300 bubbles filling the screen!
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'screen-bubble';
            bubble.setAttribute('aria-hidden', 'true');
            
            // Create 3 bubble types with brand colors (no green!)
            const bubbleType = i % 3;
            bubble.classList.add(`bubble-type-${bubbleType}`);
            
            // Enhanced random positioning for full screen coverage
            const size = Math.random() * 40 + 15; // 15-55px bubbles
            const delay = Math.random() * 2000; // 0-2s delay (immediate burst)
            const duration = Math.random() * 6000 + 4000; // 4-10s duration
            const xPos = Math.random() * 100; // 0-100% horizontal
            const yPos = Math.random() * 100; // 0-100% vertical
            const xDrift = (Math.random() - 0.5) * 60; // -30% to +30% horizontal drift
            const yDrift = (Math.random() - 0.5) * 60; // -30% to +30% vertical drift
            
            bubble.style.cssText = `
                --bubble-size: ${size}px;
                --bubble-delay: ${delay}ms;
                --bubble-duration: ${duration}ms;
                --bubble-x: ${xPos}%;
                --bubble-y: ${yPos}%;
                --bubble-x-drift: ${xDrift}%;
                --bubble-y-drift: ${yDrift}%;
                --bubble-rotation: ${Math.random() * 360}deg;
                --bubble-opacity: ${Math.random() * 0.4 + 0.3}; // 0.3-0.7 opacity
            `;
            
            carbonationScreen.appendChild(bubble);
        }

        // Create logo container with large aura
        const logoContainer = document.createElement('div');
        logoContainer.className = 'logo-emergence-container';

        // Create multiple aura layers for impressive effect
        const auraLayers = document.createElement('div');
        auraLayers.className = 'logo-aura-layers';

        // Create 5 aura layers with increasing size
        for (let i = 0; i < 5; i++) {
            const aura = document.createElement('div');
            aura.className = `logo-aura aura-layer-${i + 1}`;
            aura.style.cssText = `
                --aura-scale: ${1 + i * 0.4}; // 1x to 2.6x scale
                --aura-delay: ${i * 0.1}s;
                --aura-opacity: ${0.8 - i * 0.15}; // Decreasing opacity
            `;
            auraLayers.appendChild(aura);
        }

        const logo = document.createElement('img');
        logo.className = 'emergence-logo';
        logo.src = 'assets/images/logo/icon.png';
        logo.alt = 'DAMP Smart Drinkware Logo';
        logo.loading = 'eager';
        logo.onerror = () => {
            logo.src = 'assets/images/logo/favicon.png';
        };

        logoContainer.appendChild(auraLayers);
        logoContainer.appendChild(logo);

        // Create text messaging container
        const textContainer = document.createElement('div');
        textContainer.className = 'brand-text-container';

        // Create first text: "Never Leave a Drink Behind"
        const firstText = document.createElement('h1');
        firstText.className = 'brand-text brand-text-primary';
        firstText.textContent = 'Never Leave a Drink Behind';

        // Create second text: "DAMP Drink Abandonment Monitoring Protocol"
        const secondText = document.createElement('h2');
        secondText.className = 'brand-text brand-text-secondary';
        secondText.textContent = 'DAMP Drink Abandonment Monitoring Protocol';

        textContainer.appendChild(firstText);
        textContainer.appendChild(secondText);

        // Assemble all elements
        this.animationContainer.appendChild(carbonationScreen);
        this.animationContainer.appendChild(logoContainer);
        this.animationContainer.appendChild(textContainer);

        // Add to DOM
        document.body.appendChild(this.animationContainer);
    }

    /**
     * Start the brand messaging animation sequence
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
        // Phase 1: Carbonation screen starts immediately
        this.animationContainer.classList.add('phase-carbonation-screen');
        
        // Phase 2: Logo emerges from bubbles with large aura
        setTimeout(() => {
            this.animationContainer.classList.add('phase-logo-emergence');
        }, this.phases.logoEmergence);
        
        // Phase 3: First text appears - "Never Leave a Drink Behind"
        setTimeout(() => {
            this.animationContainer.classList.add('phase-first-text');
        }, this.phases.firstText);
        
        // Phase 4: Second text appears - "DAMP Drink Abandonment Monitoring Protocol"
        setTimeout(() => {
            this.animationContainer.classList.add('phase-second-text');
        }, this.phases.secondText);
        
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
                animationType: 'brand-messaging-carbonation'
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