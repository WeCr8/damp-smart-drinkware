/* DAMP Smart Drinkware - Hero Animation Component */
/* Performance-Optimized Bubble Curtain Reveal with Massive Logo */

class DAMPHeroAnimation {
    constructor(options = {}) {
        this.animationDuration = options.duration || 12000; // 12 seconds for proper sequence
        this.fadeOutDuration = options.fadeOutDuration || 1500; // 1.5 second fade out
        this.bubbleCount = this.getOptimalBubbleCount();
        this.animationContainer = null;
        this.hasPlayed = false;
        this.faviconSetup = null;
        
        // Animation control options
        this.playOnEveryLoad = options.playOnEveryLoad ?? true;
        this.allowSkip = options.allowSkip ?? true;
        this.playOnlyOnce = options.playOnlyOnce ?? false;
        this.skipIfReturningUser = options.skipIfReturningUser ?? false;
        
        // FIXED: Proper timing sequence with no overlaps
        this.phases = {
            curtainFormation: 0,        // 0s - Bubbles start forming
            curtainRise: 2000,          // 2s - Bubbles rise up screen
            curtainDisappear: 3500,     // 3.5s - Bubbles completely disappear
            logoReveal: 4000,           // 4s - Logo appears where bubbles were
            logoDisplay: 6000,          // 6s - Logo fully visible
            logoFade: 7500,             // 7.5s - Logo starts fading out
            logoGone: 8500,             // 8.5s - Logo completely gone
            dampText: 9000,             // 9s - "DAMP" text appears
            mainText: 10000,            // 10s - Main text appears
            contentReveal: 11500        // 11.5s - Main content reveals
        };
        
        this.initializeAnimation();
    }

    /**
     * Get optimal bubble count based on device capabilities
     */
    getOptimalBubbleCount() {
        const screenWidth = window.innerWidth;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = screenWidth < 768;
        
        if (isMobile || isSmallScreen) {
            if (screenWidth < 480) {
                return 120; // Fewer bubbles for better performance
            } else if (screenWidth < 768) {
                return 180;
            } else {
                return 220;
            }
        } else {
            if (screenWidth < 1200) {
                return 280;
            } else if (screenWidth < 1920) {
                return 320;
            } else {
                return 360; // 4K displays
            }
        }
    }

    /**
     * Initialize the hero animation
     */
    initializeAnimation() {
        if (window.DAMPFaviconSetup) {
            this.faviconSetup = new window.DAMPFaviconSetup();
        }

        const shouldPlay = this.shouldPlayAnimation();
        const canPlay = this.canPlayAnimation();
        
        if (shouldPlay && canPlay) {
            console.log('DAMP: Starting hero animation with proper sequence');
            this.createAnimationElements();
            this.startAnimation();
            this.hasPlayed = true;
        } else {
            console.log('DAMP: Skipping hero animation');
            this.skipAnimation();
        }
    }

    /**
     * Check if animation can play
     */
    canPlayAnimation() {
        if (this.playOnEveryLoad) {
            return true;
        }
        
        if (this.playOnlyOnce) {
            const hasPlayedBefore = localStorage.getItem('damp-hero-animation-played');
            if (hasPlayedBefore) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if animation should play
     */
    shouldPlayAnimation() {
        const urlParams = new URLSearchParams(window.location.search);
        const skipParam = urlParams.get('skip-animation');
        const playParam = urlParams.get('play-animation');
        
        if (skipParam === 'true') {
            return false;
        }
        if (playParam === 'true') {
            return true;
        }
        
        if (this.isVeryLowEndDevice()) {
            return false;
        }
        
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }
        
        return true;
    }

    /**
     * Detect very low-end devices
     */
    isVeryLowEndDevice() {
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        const deviceMemory = navigator.deviceMemory || 4;
        const isVerySmallScreen = window.innerWidth < 320 && window.innerHeight < 568;
        
        return (
            hardwareConcurrency <= 1 ||
            deviceMemory <= 1 ||
            isVerySmallScreen
        );
    }

    /**
     * Create animation elements
     */
    createAnimationElements() {
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'hero-animation-overlay';
        this.animationContainer.setAttribute('role', 'presentation');
        this.animationContainer.setAttribute('aria-hidden', 'true');

        // Create bubble curtain
        const bubbleCurtain = document.createElement('div');
        bubbleCurtain.className = 'artistic-bubble-curtain';
        
        // Generate bubbles
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = `artistic-curtain-bubble artistic-bubble-type-${i % 3}`;
            
            // Random positioning
            const x = Math.random() * 100;
            const y = Math.random() * 120 + 100; // Start below screen
            const size = Math.random() * 60 + 20;
            const delay = Math.random() * 2000;
            
            bubble.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                animation-delay: ${delay}ms;
            `;
            
            bubbleCurtain.appendChild(bubble);
        }

        // Create logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'massive-logo-background';
        logoContainer.innerHTML = `
            <img src="assets/images/logo/icon.png" alt="DAMP Logo" class="massive-reveal-logo">
            <h1 class="damp-brand-text">DAMP</h1>
        `;

        // Create text container
        const textContainer = document.createElement('div');
        textContainer.className = 'main-text-container';
        textContainer.innerHTML = `
            <h2 class="main-brand-text">Never Leave Your Drink Behind</h2>
        `;

        this.animationContainer.appendChild(bubbleCurtain);
        this.animationContainer.appendChild(logoContainer);
        this.animationContainer.appendChild(textContainer);
        
        document.body.appendChild(this.animationContainer);
    }

    /**
     * Start the animation sequence
     */
    startAnimation() {
        this.runAnimationPhases();

        if (this.allowSkip) {
            this.addSkipListeners();
        }
    }

    /**
     * FIXED: Run animation phases in proper sequence with no overlaps
     */
    runAnimationPhases() {
        // Phase 1: Bubbles start forming and rising (0s)
        this.animationContainer.classList.add('phase-curtain-formation');
        console.log('DAMP Animation: Bubbles forming');
        
        // Phase 2: Bubbles rise up screen (2s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-curtain-rise');
            console.log('DAMP Animation: Bubbles rising');
        }, this.phases.curtainRise);
        
        // Phase 3: Bubbles completely disappear (3.5s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-curtain-disappear');
            console.log('DAMP Animation: Bubbles disappearing');
        }, this.phases.curtainDisappear);
        
        // Phase 4: Logo appears where bubbles were (4s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-logo-reveal');
            console.log('DAMP Animation: Logo appearing');
        }, this.phases.logoReveal);
        
        // Phase 5: Logo fully visible (6s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-logo-display');
            console.log('DAMP Animation: Logo fully visible');
        }, this.phases.logoDisplay);
        
        // Phase 6: Logo starts fading out (7.5s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-logo-fade');
            console.log('DAMP Animation: Logo fading');
        }, this.phases.logoFade);
        
        // Phase 7: Logo completely gone (8.5s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-logo-gone');
            console.log('DAMP Animation: Logo gone');
        }, this.phases.logoGone);
        
        // Phase 8: DAMP text appears (9s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-damp-text');
            console.log('DAMP Animation: DAMP text appearing');
        }, this.phases.dampText);
        
        // Phase 9: Main text appears (10s)
        setTimeout(() => {
            this.animationContainer.classList.add('phase-main-text');
            console.log('DAMP Animation: Main text appearing');
        }, this.phases.mainText);
        
        // Phase 10: Content reveals (11.5s)
        setTimeout(() => {
            console.log('DAMP Animation: Revealing main content');
            this.fadeOut();
        }, this.phases.contentReveal);
    }

    /**
     * Add skip functionality
     */
    addSkipListeners() {
        const skipAnimation = () => {
            console.log('DAMP Animation: Skipped by user');
            this.fadeOut();
        };

        document.addEventListener('click', skipAnimation, { once: true });
        document.addEventListener('keydown', skipAnimation, { once: true });
        document.addEventListener('touchstart', skipAnimation, { once: true });
        
        this.addSkipButton();
    }

    /**
     * Add skip button
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
        `;
        
        skipButton.addEventListener('click', () => {
            this.fadeOut();
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
        
        this.initializeMainContent();
    }

    /**
     * Initialize main content
     */
    initializeMainContent() {
        // Trigger animations for main content
        if (window.IntersectionObserver) {
            const animateElements = document.querySelectorAll('.animate-fade-in-up');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                    }
                });
            });

            animateElements.forEach(element => {
                observer.observe(element);
            });
        }
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
     * Static methods
     */
    static create(options = {}) {
        return new DAMPHeroAnimation(options);
    }

    static reset() {
        localStorage.removeItem('damp-hero-animation-played');
    }
}

// Make available globally
window.DAMPHeroAnimation = DAMPHeroAnimation; 