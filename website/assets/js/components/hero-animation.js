/* DAMP Smart Drinkware - Sequential Hero Animation */
/* Mobile-friendly sequential animation: Bubbles → Logo → Text → Content */

class DAMPHeroAnimation {
    constructor(options = {}) {
        this.animationDuration = options.duration || 10000; // 10 seconds total
        this.fadeOutDuration = options.fadeOutDuration || 1000;
        this.bubbleCount = this.getOptimalBubbleCount();
        this.animationContainer = null;
        this.hasPlayed = false;
        
        // Sequential timing - ONE ELEMENT AT A TIME
        this.phases = {
            bubblesRise: 0,          // 0s - Bubbles rise up
            bubblesGone: 2000,       // 2s - Bubbles completely gone
            logoFadeIn: 2500,        // 2.5s - Logo fades in
            logoFadeOut: 4500,       // 4.5s - Logo fades out
            dampFadeIn: 5000,        // 5s - "DAMP" fades in
            dampFadeOut: 6500,       // 6.5s - "DAMP" fades out
            textFadeIn: 7000,        // 7s - "Never Leave Your Drink Again" fades in
            textFadeOut: 8500,       // 8.5s - Text fades out
            showContent: 9000        // 9s - Show main page
        };
        
        this.playOnEveryLoad = options.playOnEveryLoad ?? true;
        this.allowSkip = options.allowSkip ?? true;
        
        this.initializeAnimation();
    }

    getOptimalBubbleCount() {
        const isMobile = window.innerWidth < 768;
        return isMobile ? 80 : 150; // Fewer bubbles for better mobile performance
    }

    initializeAnimation() {
        if (this.shouldPlayAnimation()) {
            console.log('DAMP: Starting sequential animation');
            this.createAnimationElements();
            this.startAnimation();
        } else {
            console.log('DAMP: Skipping animation');
            this.skipAnimation();
        }
    }

    shouldPlayAnimation() {
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('skip-animation') === 'true') return false;
        if (urlParams.get('play-animation') === 'true') return true;

        // Check for reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }

        // Check for very low-end devices
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        const deviceMemory = navigator.deviceMemory || 4;
        if (hardwareConcurrency <= 1 || deviceMemory <= 1) {
            return false;
        }

        return true;
    }

    createAnimationElements() {
        // Create main container
        this.animationContainer = document.createElement('div');
        this.animationContainer.className = 'hero-animation-overlay';
        this.animationContainer.setAttribute('role', 'presentation');
        this.animationContainer.setAttribute('aria-hidden', 'true');

        // Create bubbles container
        const bubblesContainer = document.createElement('div');
        bubblesContainer.className = 'bubbles-container';
        
        // Generate bubbles
        for (let i = 0; i < this.bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'animation-bubble';
            
            const x = Math.random() * 100;
            const y = 100 + Math.random() * 20; // Start below screen
            const size = 20 + Math.random() * 40;
            const delay = Math.random() * 1000;
            
            bubble.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(0, 212, 255, 0.4));
                border-radius: 50%;
                opacity: 0;
                animation-delay: ${delay}ms;
                backdrop-filter: blur(5px);
            `;
            
            bubblesContainer.appendChild(bubble);
        }

        // Create logo element
        const logoElement = document.createElement('div');
        logoElement.className = 'animation-logo';
        logoElement.innerHTML = `
            <img src="assets/images/logo/icon.png" alt="DAMP Logo" style="
                width: min(40vw, 300px);
                height: min(40vw, 300px);
                object-fit: contain;
                filter: drop-shadow(0 0 50px rgba(0, 212, 255, 0.6));
            ">
        `;

        // Create DAMP text
        const dampText = document.createElement('div');
        dampText.className = 'animation-damp-text';
        dampText.innerHTML = `
            <h1 style="
                font-size: clamp(3rem, 8vw, 6rem);
                font-weight: 900;
                color: #00d4ff;
                text-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
                letter-spacing: 0.2em;
                margin: 0;
            ">DAMP</h1>
        `;

        // Create main text
        const mainText = document.createElement('div');
        mainText.className = 'animation-main-text';
        mainText.innerHTML = `
            <h2 style="
                font-size: clamp(1.5rem, 4vw, 3rem);
                font-weight: 600;
                color: white;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                margin: 0;
                text-align: center;
                line-height: 1.2;
            ">Never Leave Your<br>Drink Again</h2>
        `;

        // Style containers
        [logoElement, dampText, mainText].forEach(element => {
            element.style.cssText += `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
                text-align: center;
                z-index: 10;
            `;
        });

        // Append all elements
        this.animationContainer.appendChild(bubblesContainer);
        this.animationContainer.appendChild(logoElement);
        this.animationContainer.appendChild(dampText);
        this.animationContainer.appendChild(mainText);
        
        // Add skip button
        this.addSkipButton();
        
        document.body.appendChild(this.animationContainer);
    }

    startAnimation() {
        this.runSequentialPhases();

        if (this.allowSkip) {
            this.addSkipListeners();
        }
    }

    runSequentialPhases() {
        console.log('DAMP: Starting sequential animation phases');

        // Phase 1: Bubbles rise up (0s)
        this.animateBubblesRise();

        // Phase 2: Bubbles disappear (2s)
        setTimeout(() => this.animateBubblesDisappear(), this.phases.bubblesGone);

        // Phase 3: Logo fades in (2.5s)
        setTimeout(() => this.animateLogoFadeIn(), this.phases.logoFadeIn);

        // Phase 4: Logo fades out (4.5s)
        setTimeout(() => this.animateLogoFadeOut(), this.phases.logoFadeOut);

        // Phase 5: DAMP text fades in (5s)
        setTimeout(() => this.animateDampFadeIn(), this.phases.dampFadeIn);

        // Phase 6: DAMP text fades out (6.5s)
        setTimeout(() => this.animateDampFadeOut(), this.phases.dampFadeOut);

        // Phase 7: Main text fades in (7s)
        setTimeout(() => this.animateTextFadeIn(), this.phases.textFadeIn);

        // Phase 8: Main text fades out (8.5s)
        setTimeout(() => this.animateTextFadeOut(), this.phases.textFadeOut);

        // Phase 9: Show content (9s)
        setTimeout(() => this.showContent(), this.phases.showContent);
    }

    animateBubblesRise() {
        console.log('DAMP: Bubbles rising');
        const bubbles = this.animationContainer.querySelectorAll('.animation-bubble');
        bubbles.forEach((bubble, index) => {
            setTimeout(() => {
                bubble.style.animation = 'bubbleRise 2s ease-out forwards';
                bubble.style.opacity = '1';
            }, index * 50);
        });
    }

    animateBubblesDisappear() {
        console.log('DAMP: Bubbles disappearing');
        const bubbles = this.animationContainer.querySelectorAll('.animation-bubble');
        bubbles.forEach((bubble, index) => {
            setTimeout(() => {
                bubble.style.animation = 'bubbleDisappear 0.5s ease-out forwards';
            }, index * 20);
        });
    }

    animateLogoFadeIn() {
        console.log('DAMP: Logo fading in');
        const logo = this.animationContainer.querySelector('.animation-logo');
        logo.style.animation = 'fadeIn 1s ease-out forwards';
    }

    animateLogoFadeOut() {
        console.log('DAMP: Logo fading out');
        const logo = this.animationContainer.querySelector('.animation-logo');
        logo.style.animation = 'fadeOut 0.5s ease-out forwards';
    }

    animateDampFadeIn() {
        console.log('DAMP: DAMP text fading in');
        const dampText = this.animationContainer.querySelector('.animation-damp-text');
        dampText.style.animation = 'fadeIn 1s ease-out forwards';
    }

    animateDampFadeOut() {
        console.log('DAMP: DAMP text fading out');
        const dampText = this.animationContainer.querySelector('.animation-damp-text');
        dampText.style.animation = 'fadeOut 0.5s ease-out forwards';
    }

    animateTextFadeIn() {
        console.log('DAMP: Main text fading in');
        const mainText = this.animationContainer.querySelector('.animation-main-text');
        mainText.style.animation = 'fadeIn 1s ease-out forwards';
    }

    animateTextFadeOut() {
        console.log('DAMP: Main text fading out');
        const mainText = this.animationContainer.querySelector('.animation-main-text');
        mainText.style.animation = 'fadeOut 0.5s ease-out forwards';
    }

    showContent() {
        console.log('DAMP: Showing main content');
        // Remove animation overlay
        if (this.animationContainer) {
            this.animationContainer.style.animation = 'fadeOut 1s ease-out forwards';
            setTimeout(() => {
                this.animationContainer.remove();
                this.hasPlayed = true;
            }, 1000);
        }
        
        // Show main content
        document.body.style.overflow = 'auto';
        const mainContent = document.querySelector('main, .main-content, body > *:not(.hero-animation-overlay)');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.animation = 'fadeIn 1s ease-out forwards';
        }
    }

    addSkipButton() {
        const skipButton = document.createElement('button');
        skipButton.className = 'animation-skip-button';
        skipButton.innerHTML = 'Skip';
        skipButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;
        
        skipButton.addEventListener('mouseenter', () => {
            skipButton.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        
        skipButton.addEventListener('mouseleave', () => {
            skipButton.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        this.animationContainer.appendChild(skipButton);
    }

    addSkipListeners() {
        const skipButton = this.animationContainer.querySelector('.animation-skip-button');
        if (skipButton) {
            skipButton.addEventListener('click', () => this.skipAnimation());
        }

        // Allow ESC key to skip
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.animationContainer) {
                this.skipAnimation();
            }
        }, { once: true });

        // Allow click anywhere to skip
        this.animationContainer.addEventListener('click', (e) => {
            if (e.target === this.animationContainer) {
                this.skipAnimation();
            }
        });
    }

    skipAnimation() {
        console.log('DAMP: Skipping animation');
        if (this.animationContainer) {
            this.animationContainer.remove();
            this.hasPlayed = true;
        }
        
        // Show main content immediately
        document.body.style.overflow = 'auto';
        const mainContent = document.querySelector('main, .main-content, body > *:not(.hero-animation-overlay)');
        if (mainContent) {
            mainContent.style.opacity = '1';
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DAMP: DOM ready, initializing hero animation');
    new DAMPHeroAnimation();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, event listener will handle it
} else {
    // DOM is already loaded
    console.log('DAMP: DOM already loaded, initializing hero animation');
    new DAMPHeroAnimation();
}