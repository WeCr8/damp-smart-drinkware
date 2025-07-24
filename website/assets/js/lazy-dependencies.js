// DAMP Lazy Dependency Loader - Load Heavy SDKs After Animation
class DAMPLazyLoader {
    constructor() {
        this.loaded = new Set();
        this.loading = new Map();
        this.callbacks = new Map();
        
        // Initialize after animation or user interaction
        this.initializationDelay = 2000; // 2s after animation starts
        this.userInteractionTypes = ['click', 'scroll', 'touchstart', 'keydown'];
        
        this.setupUserInteractionLoading();
    }
    
    setupUserInteractionLoading() {
        const loadOnInteraction = () => {
            this.preloadCriticalDependencies();
            // Remove listeners after first interaction
            this.userInteractionTypes.forEach(type => {
                document.removeEventListener(type, loadOnInteraction, { passive: true });
            });
        };
        
        // Load on first user interaction
        this.userInteractionTypes.forEach(type => {
            document.addEventListener(type, loadOnInteraction, { passive: true });
        });
        
        // Or after animation completes
        document.addEventListener('heroAnimationComplete', () => {
            setTimeout(() => this.preloadCriticalDependencies(), 1000);
        });
        
        // Fallback timer
        setTimeout(() => this.preloadCriticalDependencies(), this.initializationDelay);
    }
    
    async preloadCriticalDependencies() {
        // Start loading in background, don't block
        this.loadFirebase().catch(console.warn);
        this.loadStripe().catch(console.warn);
        this.loadAnalytics().catch(console.warn);
    }
    
    async loadFirebase() {
        if (this.loaded.has('firebase')) return window.firebaseServices;
        
        if (this.loading.has('firebase')) {
            return this.loading.get('firebase');
        }
        
        const loadPromise = this.loadFirebaseSDK();
        this.loading.set('firebase', loadPromise);
        return loadPromise;
    }
    
    async loadFirebaseSDK() {
        try {
            // Use CDN for better caching
            const [
                { initializeApp },
                { getAuth },
                { getFirestore },
                { getAnalytics }
            ] = await Promise.all([
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'),
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'),
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
            ]);
            
            // Initialize Firebase (you'll need to add your config)
            const firebaseConfig = {
                // Your Firebase config here
                apiKey: "your-api-key",
                authDomain: "your-project.firebaseapp.com",
                projectId: "your-project-id",
                // ... rest of config
            };
            
            const app = initializeApp(firebaseConfig);
            
            window.firebaseServices = {
                app,
                auth: getAuth(app),
                db: getFirestore(app),
                analytics: getAnalytics(app)
            };
            
            this.loaded.add('firebase');
            console.log('✅ Firebase loaded lazily');
            return window.firebaseServices;
            
        } catch (error) {
            console.warn('Firebase loading failed:', error);
            return null;
        }
    }
    
    async loadStripe() {
        if (this.loaded.has('stripe')) return window.Stripe;
        
        if (this.loading.has('stripe')) {
            return this.loading.get('stripe');
        }
        
        const loadPromise = this.loadStripeSDK();
        this.loading.set('stripe', loadPromise);
        return loadPromise;
    }
    
    async loadStripeSDK() {
        try {
            const { loadStripe } = await import('https://js.stripe.com/v3/');
            window.Stripe = await loadStripe('pk_test_your_publishable_key_here');
            
            this.loaded.add('stripe');
            console.log('✅ Stripe loaded lazily');
            return window.Stripe;
            
        } catch (error) {
            console.warn('Stripe loading failed:', error);
            return null;
        }
    }
    
    async loadAnalytics() {
        if (this.loaded.has('analytics')) return window.gtag;
        
        try {
            // Load Google Analytics
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            document.head.appendChild(script);
            
            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
            
            window.gtag = gtag;
            
            this.loaded.add('analytics');
            console.log('✅ Analytics loaded lazily');
            return window.gtag;
            
        } catch (error) {
            console.warn('Analytics loading failed:', error);
            return null;
        }
    }
    
    // Helper method for components that need these services
    async requireFirebase() {
        return this.loadFirebase();
    }
    
    async requireStripe() {
        return this.loadStripe();
    }
    
    isLoaded(service) {
        return this.loaded.has(service);
    }
}

// Initialize global lazy loader
window.lazyLoader = new DAMPLazyLoader();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPLazyLoader;
} 