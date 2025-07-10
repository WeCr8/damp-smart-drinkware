/* DAMP Smart Drinkware - Hero Animation Component */
/* Carbonation Bubble Explosion with Brand Colors */

class DAMPHeroAnimation {
    constructor(options = {}) {
        this.animationDuration = options.duration || 6000; // 6 seconds for full sequence
        this.fadeOutDuration = options.fadeOutDuration || 1500; // 1.5 second fade out
        this.goldenRatio = 1.618;
        this.bubbleCount = 150; // Massive carbonation effect - 150 bubbles!
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
            bubbleExplosion: 0, // Start immediately
            bubbleRising: 500, // 0.5s after start
            logoReveal: 2000, // 2s - logo appears full screen
            textReveal: 3500, // 3.5s - text appears
            contentReveal: 5000 // 5s - main content reveals
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
     * Create carbonation bubble explosion animation elements
     */
    createAnimationElements() {
        // Create main overlay container
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'hero-animation-overlay';
        this.animationContainer.setAttribute('role', 'presentation');
        this.animationContainer.setAttribute('aria-hidden', 'true');

        // Create bubble container for carbonation effect
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'carbonation-container';

        // Create massive carbonation bubble explosion - 150 bubbles!
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'carbonation-bubble';
            bubble.setAttribute('aria-hidden', 'true');
            
            // Add variety to bubble types
            const bubbleType = i % 4;
            bubble.classList.add(`bubble-type-${bubbleType}`);
            
            // Random positioning and sizing for natural carbonation effect
            const size = Math.random() * 20 + 5; // 5-25px bubbles
            const delay = Math.random() * 2000; // 0-2s delay
            const duration = Math.random() * 3000 + 2000; // 2-5s duration
            const xPos = Math.random() * 100; // 0-100% horizontal
            const yStart = 100 + Math.random() * 20; // Start below screen
            
            bubble.style.cssText = `
                --bubble-size: ${size}px;
                --bubble-delay: ${delay}ms;
                --bubble-duration: ${duration}ms;
                --bubble-x: ${xPos}%;
                --bubble-y-start: ${yStart}%;
                --bubble-rotation: ${Math.random() * 360}deg;
            `;
            
            bubbleContainer.appendChild(bubble);
        }

        // Create full-screen logo container (hidden initially)
        const logoContainer = document.createElement('div');
        logoContainer.className = 'hero-logo-container fullscreen-logo';

        const logo = document.createElement('img');
        logo.className = 'hero-logo';
        logo.src = 'assets/images/logo/icon.png';
        logo.alt = 'DAMP Smart Drinkware Logo';
        logo.loading = 'eager';
        logo.onerror = () => {
            logo.src = 'assets/images/logo/favicon.png';
        };
        logoContainer.appendChild(logo);

        // Create animated text container (hidden initially)
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

        // Assemble all elements
        this.animationContainer.appendChild(bubbleContainer);
        this.animationContainer.appendChild(logoContainer);
        this.animationContainer.appendChild(textContainer);

        // Add to DOM
        document.body.appendChild(this.animationContainer);
    }

    /**
     * Start the carbonation explosion animation sequence
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
        // Phase 1: Bubble explosion starts immediately
        this.animationContainer.classList.add('phase-explosion');
        
        // Phase 2: Bubbles start rising
        setTimeout(() => {
            this.animationContainer.classList.add('phase-rising');
        }, this.phases.bubbleRising);
        
        // Phase 3: Logo reveals full screen
        setTimeout(() => {
            this.animationContainer.classList.add('phase-logo-reveal');
        }, this.phases.logoReveal);
        
        // Phase 4: Text appears
        setTimeout(() => {
            this.animationContainer.classList.add('phase-text-reveal');
        }, this.phases.textReveal);
        
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
            color: #00d4ff;
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
            skipButton.style.borderColor = '#00d4ff';
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
                animationType: 'carbonation-explosion'
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