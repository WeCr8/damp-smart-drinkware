/* DAMP Smart Drinkware - Hero Animation Component */
/* Performance-Optimized Bubble Curtain Reveal with Massive Logo */

class DAMPHeroAnimation {
    constructor(options = {}) {
        this.animationDuration = options.duration || 9000; // 9 seconds for dramatic sequence
        this.fadeOutDuration = options.fadeOutDuration || 2000; // 2 second fade out
        this.bubbleCount = this.getOptimalBubbleCount(); // Optimized bubble count based on device
        this.animationContainer = null;
        this.hasPlayed = false;
        this.faviconSetup = null;
        
        // Animation control options - FIXED: Make animation play more reliably
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
        
        // FIXED: Initialize immediately instead of waiting
        this.initializeAnimation();
    }

    /**
     * Get optimal bubble count based on device capabilities
     */
    getOptimalBubbleCount() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const screenArea = screenWidth * screenHeight;
        
        // Check if it's a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = screenWidth < 768;
        
        // Performance-based bubble count calculation
        if (isMobile || isSmallScreen) {
            if (screenWidth < 480) {
                return 150; // Small mobile: 150 bubbles
            } else if (screenWidth < 768) {
                return 200; // Large mobile/tablet: 200 bubbles
            } else {
                return 250; // Tablet landscape: 250 bubbles
            }
        } else {
            // Desktop: Base on screen area
            if (screenArea < 1000000) { // Small desktop/laptop
                return 300;
            } else if (screenArea < 2000000) { // Standard desktop
                return 350;
            } else {
                return 400; // Large desktop: Maximum 400 bubbles
            }
        }
    }

    /**
     * Initialize the hero animation - FIXED: Simplified initialization
     */
    initializeAnimation() {
        // Wait for favicon setup to be available
        if (window.DAMPFaviconSetup) {
            this.faviconSetup = new window.DAMPFaviconSetup();
        }

        // FIXED: Simplified animation check - make it more reliable
        if (this.shouldPlayAnimation() && !this.hasPlayed) {
            console.log('DAMP: Starting hero animation');
            this.createAnimationElements();
            this.startAnimation();
            this.hasPlayed = true;
        } else {
            console.log('DAMP: Skipping hero animation');
            this.skipAnimation();
        }
    }

    /**
     * Determine if animation should play based on configuration - FIXED: Simplified logic
     */
    shouldPlayAnimation() {
        // Check URL parameters for override
        const urlParams = new URLSearchParams(window.location.search);
        const skipParam = urlParams.get('skip-animation');
        const playParam = urlParams.get('play-animation');
        
        // URL parameter overrides
        if (skipParam === 'true') {
            console.log('DAMP: Animation skipped by URL parameter');
            return false;
        }
        if (playParam === 'true') {
            console.log('DAMP: Animation forced by URL parameter');
            return true;
        }
        
        // FIXED: Simplified device check - only skip on extremely low-end devices
        if (this.isVeryLowEndDevice()) {
            console.log('DAMP: Skipping animation on very low-end device');
            return false;
        }
        
        // FIXED: Only check reduced motion preference, remove other restrictive checks
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('DAMP: Skipping animation due to reduced motion preference');
            return false;
        }
        
        // FIXED: Always play animation by default (removed restrictive checks)
        console.log('DAMP: Animation will play');
        return true;
    }

    /**
     * Detect very low-end devices - FIXED: More lenient detection
     */
    isVeryLowEndDevice() {
        // FIXED: Only block on extremely low-end devices
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        const deviceMemory = navigator.deviceMemory || 4;
        const isVerySmallScreen = window.innerWidth < 320 && window.innerHeight < 568; // iPhone 5 and below
        
        return (
            hardwareConcurrency <= 1 ||
            deviceMemory <= 1 ||
            isVerySmallScreen
        );
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

        // Create optimized curtain of bubbles - performance-friendly!
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'artistic-curtain-bubble';
            bubble.setAttribute('aria-hidden', 'true');
            
            // Create cleaner bubble types with only blues/whites/grays
            const bubbleType = i % 3; // Reduced to 3 types for better performance
            bubble.classList.add(`artistic-bubble-type-${bubbleType}`);
            
            // Position bubbles to form a clean artistic curtain
            const isMobile = window.innerWidth < 768;
            const baseSize = isMobile ? 25 : 40; // Smaller base size for mobile
            const sizeVariation = isMobile ? 15 : 25; // Less variation for mobile
            const size = Math.random() * sizeVariation + baseSize; // Smaller, cleaner bubbles
            
            const xPos = Math.random() * 100; // 0-100% horizontal
            const yPos = Math.random() * 100; // 0-100% vertical
            
            // Determine which side of curtain the bubble belongs to for dramatic parting
            const isLeftSide = xPos < 50;
            const curtainSide = isLeftSide ? 'left' : 'right';
            bubble.classList.add(`curtain-${curtainSide}`);
            
            // Calculate optimized reveal movement - smaller distances for better performance
            const maxDistance = isMobile ? 200 : 250; // Reduced movement distance
            const minDistance = isMobile ? 80 : 100;
            const revealDistance = isLeftSide ? 
                -Math.random() * maxDistance - minDistance : 
                Math.random() * maxDistance + minDistance;
            
            const verticalDrift = (Math.random() - 0.5) * (isMobile ? 80 : 120); // Reduced vertical movement
            const rotationDrift = (Math.random() - 0.5) * (isMobile ? 360 : 540); // Reduced rotation
            
            bubble.style.cssText = `
                --bubble-size: ${size}px;
                --bubble-x: ${xPos}%;
                --bubble-y: ${yPos}%;
                --reveal-distance: ${revealDistance}px;
                --vertical-drift: ${verticalDrift}px;
                --rotation-drift: ${rotationDrift}deg;
                --bubble-delay: ${Math.random() * 800}ms; // Faster formation
                --reveal-delay: ${Math.random() * 1200 + 2500}ms; // Optimized staggered reveal
                --bubble-opacity: ${Math.random() * 0.25 + 0.75}; // 0.75-1.0 opacity for cleaner look
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
                animationType: 'optimized-curtain-reveal',
                deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
                performanceOptimized: true
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