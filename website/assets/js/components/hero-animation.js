/* DAMP Smart Drinkware - Hero Animation Component */
/* Golden Ratio Bubble Animation with Logo Emergence */

class DAMPHeroAnimation {
    constructor() {
        this.animationDuration = 5000; // 5 seconds
        this.fadeOutDuration = 1000; // 1 second fade out
        this.goldenRatio = 1.618;
        this.bubbleCount = 8;
        this.isFirstVisit = this.checkFirstVisit();
        this.animationContainer = null;
        this.hasPlayed = false;
        
        this.init();
    }

    /**
     * Initialize the hero animation
     */
    init() {
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

        // Create golden ratio bubbles
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
        logo. 