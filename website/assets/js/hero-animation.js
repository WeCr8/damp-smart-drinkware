/**
 * DAMP Hero Animation Controller
 * Creates spectacular logo burst effect and smooth transitions
 */

class HeroAnimationController {
    constructor() {
        this.animationContainer = null;
        this.bubbleBurstContainer = null;
        this.heroContent = null;
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
        
        // After logo animation completes, transition to main content
        setTimeout(() => {
            this.transitionToMainContent();
        }, 3500); // 3.5 seconds for logo animation
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
        // Fade out logo animation
        this.animationContainer.classList.add('hidden');
        
        // Fade in main content
        setTimeout(() => {
            this.heroContent.classList.add('visible');
            this.animationComplete = true;
            
            // Show scroll indicator
            if (this.scrollIndicator) {
                this.scrollIndicator.style.opacity = '1';
            }
            
            // Dispatch custom event for other components
            this.dispatchEvent('heroAnimationComplete');
            
        }, 500);
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

        observer.observe(document.querySelector('.hero'));
    }

    handleViewportEnter() {
        // Resume animations if paused
        if (this.animationComplete) {
            this.resumeParticleAnimations();
        }
    }

    handleViewportExit() {
        // Pause non-essential animations for performance
        this.pauseParticleAnimations();
    }

    pauseParticleAnimations() {
        const particles = document.querySelectorAll('.floating-particle');
        particles.forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    }

    resumeParticleAnimations() {
        const particles = document.querySelectorAll('.floating-particle');
        particles.forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    // Public methods
    skipAnimation() {
        this.transitionToMainContent();
    }

    restartAnimation() {
        if (this.animationComplete) {
            this.heroContent.classList.remove('visible');
            this.animationContainer.classList.remove('hidden');
            this.animationComplete = false;
            this.startAnimation();
        }
    }
}

// Initialize the animation
const heroAnimation = new HeroAnimationController();

// Optional: Add skip button for users who want to skip the animation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === ' ') {
        if (!heroAnimation.animationComplete) {
            heroAnimation.skipAnimation();
        }
    }
});

// Export for potential use by other modules
window.HeroAnimationController = HeroAnimationController;
window.heroAnimation = heroAnimation; 