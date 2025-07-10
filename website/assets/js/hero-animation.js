/**
 * DAMP Hero Animation Controller - Enhanced with Professional Tagline Fade-in
 * Creates spectacular logo burst effect with smooth tagline transition
 */

class HeroAnimationController {
    constructor() {
        this.animationContainer = null;
        this.bubbleBurstContainer = null;
        this.heroContent = null;
        this.heroTagline = null;
        this.scrollIndicator = null;
        this.animationComplete = false;
        this.bubbleCount = 30;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.animationContainer = document.getElementById('hero-animation');
        this.bubbleBurstContainer = document.getElementById('bubble-burst');
        this.heroContent = document.getElementById('hero-content');
        this.heroTagline = document.getElementById('hero-tagline');
        this.scrollIndicator = document.getElementById('scroll-indicator');

        if (!this.animationContainer || !this.bubbleBurstContainer || !this.heroContent) {
            console.error('Hero animation elements not found');
            return;
        }

        this.startAnimation();
        this.setupViewportObserver();
    }

    startAnimation() {
        // Start with bubble burst
        this.createBubbleBurst();
        
        // 🔥 NEW: Enhanced timing for professional tagline fade-in
        // After tagline animation completes, transition to main content
        setTimeout(() => {
            this.transitionToMainContent();
        }, 5000); // 5 seconds total: bubbles (2s) + logo (1.5s) + tagline (1.5s)
    }

    createBubbleBurst() {
        for (let i = 0; i < this.bubbleCount; i++) {
            this.createBubble(i);
        }
    }

    createBubble(index) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size between 20px and 80px
        const size = Math.random() * 60 + 20;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position around center
        const angle = (Math.PI * 2 * index) / this.bubbleCount + (Math.random() - 0.5) * 0.5;
        const distance = Math.random() * 200 + 100;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        
        // Set CSS custom properties for animation
        bubble.style.setProperty('--dx', `${dx}px`);
        bubble.style.setProperty('--dy', `${dy}px`);
        
        // Random animation delay
        const delay = Math.random() * 0.5;
        bubble.style.animationDelay = `${delay}s`;
        
        // Random opacity variation
        const opacity = Math.random() * 0.4 + 0.6;
        bubble.style.setProperty('--opacity', opacity);
        
        this.bubbleBurstContainer.appendChild(bubble);
        
        // Remove bubble after animation
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, 2500);
    }

    transitionToMainContent() {
        // 🔥 NEW: Fade out entire logo animation container (including tagline)
        this.animationContainer.classList.add('hidden');
        
        // 🔥 NEW: Fade in main content with enhanced timing
        setTimeout(() => {
            this.heroContent.classList.add('visible');
            this.animationComplete = true;
            
            // Show scroll indicator
            if (this.scrollIndicator) {
                this.scrollIndicator.classList.add('visible');
            }
            
            // 🔥 NEW: Dispatch custom event for other components
            this.dispatchEvent('heroAnimationComplete');
            
            // 🔥 NEW: Track animation completion for analytics
            if (typeof trackEvent === 'function') {
                trackEvent('hero_animation_complete', {
                    duration: 5000,
                    user_waited: true
                });
            }
            
        }, 800); // Longer transition for smoother effect
    }

    setupViewportObserver() {
        // Intersection Observer for performance optimization
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleViewportEnter();
                } else {
                    this.handleViewportExit();
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(