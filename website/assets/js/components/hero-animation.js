/* DAMP Smart Drinkware - Hero Animation Component */
/* Dramatic Bubble Curtain Reveal with Massive Logo */

class DAMPHeroAnimation {
    constructor(options = {}) {
        this.animationDuration = options.duration || 9000; // 9 seconds for dramatic sequence
        this.fadeOutDuration = options.fadeOutDuration || 2000; // 2 second fade out
        this.bubbleCount = 500; // Dense curtain of bubbles - 500 bubbles!
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
            curtainFormation: 0,        // 0s - Dense bubble curtain forms
            logoReveal: 3000,           // 3s - Curtain parts dramatically for massive logo
            dampText: 4500,             // 4.5s - "DAMP" text appears with logo
            mainText: 6000,             // 6s - "Never Leave Your Cup Behind" appears
            contentReveal: 8500         // 8.5s - Main content reveals
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
     * Create dramatic bubble curtain animation elements
     */
    createAnimationElements() {
        // Create main overlay container
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'hero-animation-overlay';
        this.animationContainer.setAttribute('role', 'presentation');
        this.animationContainer.setAttribute('aria-hidden', 'true');

        // Create the massive logo behind the curtain
        const logoBackground = document.createElement('div');
        logoBackground.className = 'massive-logo-background';

        const massiveLogo = document.createElement('img');
        massiveLogo.className = 'massive-reveal-logo';
        massiveLogo.src = 'assets/images/logo/icon.png';
        massiveLogo.alt = 'DAMP Smart Drinkware Logo';
        massiveLogo.loading = 'eager';
        massiveLogo.onerror = () => {
            massiveLogo.src = 'assets/images/logo/favicon.png';
        };
        logoBackground.appendChild(massiveLogo);

        // Create DAMP text that appears with logo
        const dampTextElement = document.createElement('h1');
        dampTextElement.className = 'damp-brand-text';
        dampTextElement.textContent = 'DAMP';
        logoBackground.appendChild(dampTextElement);

        // Create dense bubble curtain container
        const bubbleCurtain = document.createElement('div');
        bubbleCurtain.className = 'artistic-bubble-curtain';

        // Create dense curtain of bubbles - 500 bubbles for full coverage!
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'artistic-curtain-bubble';
            bubble.setAttribute('aria-hidden', 'true');
            
            // Create artistic bubble types with only blues/whites/grays
            const bubbleType = i % 5; // 5 types for more artistic variety
            bubble.classList.add(`artistic-bubble-type-${bubbleType}`);
            
            // Position bubbles to form a dense artistic curtain
            const size = Math.random() * 80 + 30; // 30-110px bubbles for dense coverage
            const xPos = Math.random() * 100; // 0-100% horizontal
            const yPos = Math.random() * 100; // 0-100% vertical
            
            // Determine which side of curtain the bubble belongs to for dramatic parting
            const isLeftSide = xPos < 50;
            const curtainSide = isLeftSide ? 'left' : 'right';
            bubble.classList.add(`curtain-${curtainSide}`);
            
            // Calculate dramatic reveal movement - bubbles move far outward
            const revealDistance = isLeftSide ? -Math.random() * 300 - 150 : Math.random() * 300 + 150;
            const verticalDrift = (Math.random() - 0.5) * 150; // Up/down movement
            const rotationDrift = (Math.random() - 0.5) * 720; // Full rotation effects
            
            bubble.style.cssText = `
                --bubble-size: ${size}px;
                --bubble-x: ${xPos}%;
                --bubble-y: ${yPos}%;
                --reveal-distance: ${revealDistance}px;
                --vertical-drift: ${verticalDrift}px;
                --rotation-drift: ${rotationDrift}deg;
                --bubble-delay: ${Math.random() * 1000}ms; // Formation timing
                --reveal-delay: ${Math.random() * 1500 + 3000}ms; // Dramatic staggered reveal
                --bubble-opacity: ${Math.random() * 0.3 + 0.7}; // 0.7-1.0 opacity for density
            `;
            
            bubbleCurtain.appendChild(bubble);
        }

        // Create main messaging text container
        const textContainer = document.createElement('div');
        textContainer.className = 'main-text-container';

        // Create main text: "Never Leave Your Drink Behind"
        const mainText = document.createElement('h2');
        mainText.className = 'main-brand-text';
        mainText.textContent = 'Never Leave Your Drink Behind';

        textContainer.appendChild(mainText);

        // Assemble all elements (massive logo behind curtain)
        this.animationContainer.appendChild(logoBackground);
        this.animationContainer.appendChild(bubbleCurtain);
        this.animationContainer.appendChild(textContainer);

        // Add to DOM
        document.body.appendChild(this.animationContainer);
    }

    /**
     * Start the dramatic bubble curtain animation sequence
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
     * Run the dramatic animation phases in sequence
     */
    runAnimationPhases() {
        // Phase 1: Dense bubble curtain forms
        this.animationContainer.classList.add('phase-curtain-formation');
        
        // Phase 2: Curtain parts dramatically to reveal massive logo
        setTimeout(() => {
            this.animationContainer.classList.add('phase-logo-reveal');
        }, this.phases.logoReveal);
        
        // Phase 3: "DAMP" text appears with logo
        setTimeout(() => {
            this.animationContainer.classList.add('phase-damp-text');
        }, this.phases.dampText);
        
        // Phase 4: Main text appears - "Never Leave Your Cup"
        setTimeout(() => {
            this.animationContainer.classList.add('phase-main-text');
        }, this.phases.mainText);
        
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
            background: rgba(255, 255, 255, 0.15);
            color: rgba(255, 255, 255, 0.9);
            border: 2px solid rgba(255, 255, 255, 0.25);
            border-radius: 30px;
            padding: 10px 18px;
            cursor: pointer;
            z-index: 10000;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(15px);
            letter-spacing: 0.05em;
        `;
        
        skipButton.addEventListener('click', () => {
            this.fadeOut();
        });
        
        skipButton.addEventListener('mouseenter', () => {
            skipButton.style.background = 'rgba(255, 255, 255, 0.25)';
            skipButton.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            skipButton.style.transform = 'scale(1.05)';
        });
        
        skipButton.addEventListener('mouseleave', () => {
            skipButton.style.background = 'rgba(255, 255, 255, 0.15)';
            skipButton.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            skipButton.style.transform = 'scale(1)';
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
                animationType: 'dramatic-curtain-reveal'
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