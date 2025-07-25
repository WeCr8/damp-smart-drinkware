// DAMP Lazy Dependency Loader - Load Heavy SDKs After Animation
class DAMPLazyLoader {
    constructor() {
        this.loaded = new Set();
        this.loading = new Map();
        
        // Initialize after user interaction or animation completion
        this.setupUserInteractionLoading();
    }
    
    setupUserInteractionLoading() {
        const loadOnInteraction = () => {
            this.preloadCriticalDependencies();
            // Remove listeners after first interaction
            ['click', 'scroll', 'touchstart', 'keydown'].forEach(type => {
                document.removeEventListener(type, loadOnInteraction, { passive: true });
            });
        };
        
        // Load on first user interaction
        ['click', 'scroll', 'touchstart', 'keydown'].forEach(type => {
            document.addEventListener(type, loadOnInteraction, { passive: true });
        });
        
        // Or after animation completes
        document.addEventListener('heroAnimationComplete', () => {
            setTimeout(() => this.preloadCriticalDependencies(), 1000);
        });
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
        
        const loadPromise = this._loadFirebaseCore();
        this.loading.set('firebase', loadPromise);
        
        try {
            const result = await loadPromise;
            this.loaded.add('firebase');
            this.loading.delete('firebase');
            return result;
        } catch (error) {
            this.loading.delete('firebase');
            throw error;
        }
    }
    
    async _loadFirebaseCore() {
        try {
            // Use CDN for better caching
            const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'),
                import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js')
            ]);
            
            // Initialize Firebase (add your config)
            const firebaseConfig = {
                apiKey: "your-api-key",
                authDomain: "damp-smart-drinkware.firebaseapp.com",
                projectId: "damp-smart-drinkware",
                storageBucket: "damp-smart-drinkware.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef123456"
            };
            
            const app = initializeApp(firebaseConfig);
            
            window.firebaseServices = {
                app,
                auth: getAuth(app),
                db: getFirestore(app),
                // Add voting service
                votingService: {
                    async getVotingData() {
                        // Implement voting data fetching
                        return {
                            totalVotes: 2847,
                            leadingProduct: 'Handle',
                            participationRate: 68
                        };
                    },
                    onPublicVotingChange(callback) {
                        // Setup real-time listener
                        callback({
                            totalVotes: 2847,
                            leadingProduct: 'Handle',
                            participationRate: 68
                        });
                    }
                }
            };
            
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
        
        const loadPromise = this._loadStripeCore();
        this.loading.set('stripe', loadPromise);
        
        try {
            const result = await loadPromise;
            this.loaded.add('stripe');
            this.loading.delete('stripe');
            return result;
        } catch (error) {
            this.loading.delete('stripe');
            throw error;
        }
    }
    
    async _loadStripeCore() {
        try {
            // Dynamic import for better performance
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            
            const loadPromise = new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
            
            document.head.appendChild(script);
            await loadPromise;
            
            window.Stripe = Stripe('pk_test_your_publishable_key_here');
            
            console.log('✅ Stripe loaded lazily');
            return window.Stripe;
            
        } catch (error) {
            console.warn('Stripe loading failed:', error);
            return null;
        }
    }
    
    async loadAnalytics() {
        if (this.loaded.has('analytics')) return window.gtag;
        
        if (this.loading.has('analytics')) {
            return this.loading.get('analytics');
        }
        
        const loadPromise = this._loadAnalyticsCore();
        this.loading.set('analytics', loadPromise);
        
        try {
            const result = await loadPromise;
            this.loaded.add('analytics');
            this.loading.delete('analytics');
            return result;
        } catch (error) {
            this.loading.delete('analytics');
            throw error;
        }
    }
    
    async _loadAnalyticsCore() {
        try {
            // Load Google Analytics
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            
            const loadPromise = new Promise((resolve) => {
                script.onload = resolve;
                script.onerror = resolve; // Don't fail if analytics fails
            });
            
            document.head.appendChild(script);
            await loadPromise;
            
            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
            
            window.gtag = gtag;
            
            console.log('✅ Analytics loaded lazily');
            return window.gtag;
            
        } catch (error) {
            console.warn('Analytics loading failed:', error);
            return null;
        }
    }
    
    // Public utility methods
    async ensureFirebase() {
        return this.loadFirebase();
    }
    
    async ensureStripe() {
        return this.loadStripe();
    }
    
    async ensureAnalytics() {
        return this.loadAnalytics();
    }
    
    getLoadedServices() {
        return Array.from(this.loaded);
    }
    
    isLoaded(service) {
        return this.loaded.has(service);
    }
    
    destroy() {
        this.loaded.clear();
        this.loading.clear();
    }
}

// Initialize globally
window.dampLazyDependencies = new DAMPLazyLoader();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAMPLazyLoader;
}