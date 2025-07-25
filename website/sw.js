// DAMP Smart Drinkware - Advanced Service Worker
// Google Engineering Standards with Hot Module Replacement & Intelligent Caching
// Copyright 2025 WeCr8 Solutions LLC

const CACHE_NAME = 'damp-v2.1.0';
const CACHE_STRATEGY_VERSION = '2.1.0';
const HOT_RELOAD_CHANNEL = 'damp-hot-reload';
const PERFORMANCE_CHANNEL = 'damp-performance';

// Google-level caching strategies
const CACHE_STRATEGIES = {
    CRITICAL: 'critical-resources',     // HTML, critical CSS/JS
    STATIC: 'static-assets',           // Images, fonts, non-critical CSS/JS
    API: 'api-responses',              // API calls with TTL
    DYNAMIC: 'dynamic-content',        // User-generated content
    OFFLINE: 'offline-fallbacks'       // Offline pages and assets
};

// Cache configurations with Google-optimized TTL
const CACHE_CONFIGS = {
    [CACHE_STRATEGIES.CRITICAL]: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24,        // 24 hours
        strategy: 'NetworkFirst'
    },
    [CACHE_STRATEGIES.STATIC]: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,   // 30 days
        strategy: 'CacheFirst'
    },
    [CACHE_STRATEGIES.API]: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 5,              // 5 minutes
        strategy: 'NetworkFirst'
    },
    [CACHE_STRATEGIES.DYNAMIC]: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60,             // 1 hour
        strategy: 'StaleWhileRevalidate'
    },
    [CACHE_STRATEGIES.OFFLINE]: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,  // 1 year
        strategy: 'CacheOnly'
    }
};

// Performance monitoring
let performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    failedRequests: 0,
    backgroundSyncJobs: 0,
    hotReloads: 0
};

// Hot Module Replacement state
let hmrEnabled = false;
let hmrClients = new Set();

class DAMPServiceWorker {
    constructor() {
        this.initializeEventListeners();
        this.setupPerformanceMonitoring();
        this.enableHotModuleReplacement();
    }

    initializeEventListeners() {
        self.addEventListener('install', this.handleInstall.bind(this));
        self.addEventListener('activate', this.handleActivate.bind(this));
        self.addEventListener('fetch', this.handleFetch.bind(this));
        self.addEventListener('message', this.handleMessage.bind(this));
        self.addEventListener('sync', this.handleBackgroundSync.bind(this));
        self.addEventListener('push', this.handlePush.bind(this));
        self.addEventListener('notificationclick', this.handleNotificationClick.bind(this));
    }

    async handleInstall(event) {
        console.log('[DAMP SW] Installing advanced service worker v' + CACHE_STRATEGY_VERSION);
        
        event.waitUntil(
            this.preloadCriticalResources()
                .then(() => {
                    console.log('[DAMP SW] Critical resources preloaded');
                    return self.skipWaiting();
                })
                .catch(error => {
                    console.error('[DAMP SW] Installation failed:', error);
                    // Don't fail installation completely
                    return self.skipWaiting();
                })
        );
    }

    async handleActivate(event) {
        console.log('[DAMP SW] Activating advanced service worker');
        
        event.waitUntil(
            Promise.all([
                this.cleanupOldCaches(),
                this.initializeBackgroundSync(),
                self.clients.claim()
            ]).then(() => {
                console.log('[DAMP SW] Activation complete');
                this.notifyClients('sw-activated', { version: CACHE_STRATEGY_VERSION });
            })
        );
    }

    async handleFetch(event) {
        const { request } = event;
        const url = new URL(request.url);
        
        // Skip non-HTTP requests
        if (!url.protocol.startsWith('http')) return;
        
        // Skip Hot Module Replacement requests
        if (this.isHMRRequest(request)) {
            return this.handleHMRRequest(event);
        }

        // Route to appropriate caching strategy
        const strategy = this.getCachingStrategy(request);
        
        event.respondWith(
            this.executeStrategy(request, strategy)
                .then(response => {
                    this.trackPerformance('cacheHit', request.url);
                    return response;
                })
                .catch(error => {
                    this.trackPerformance('cacheMiss', request.url);
                    return this.handleFetchError(request, error);
                })
        );
    }

    async handleMessage(event) {
        const { type, payload } = event.data || {};
        
        switch (type) {
            case 'HMR_ENABLE':
                this.enableHMR(event.source);
                break;
            case 'HMR_DISABLE':
                this.disableHMR(event.source);
                break;
            case 'GET_PERFORMANCE':
                event.ports[0].postMessage(performanceMetrics);
                break;
            case 'CLEAR_CACHE':
                await this.clearSpecificCache(payload.cacheName);
                event.ports[0].postMessage({ success: true });
                break;
            case 'PREFETCH_RESOURCES':
                await this.prefetchResources(payload.urls);
                break;
            default:
                console.log('[DAMP SW] Unknown message type:', type);
        }
    }

    async handleBackgroundSync(event) {
        console.log('[DAMP SW] Background sync triggered:', event.tag);
        
        switch (event.tag) {
            case 'analytics-sync':
                event.waitUntil(this.syncAnalytics());
                break;
            case 'form-submission':
                event.waitUntil(this.syncFormSubmissions());
                break;
            case 'preorder-sync':
                event.waitUntil(this.syncPreorders());
                break;
            default:
                console.log('[DAMP SW] Unknown sync tag:', event.tag);
        }
    }

    async handlePush(event) {
        const options = {
            body: event.data ? event.data.text() : 'New update available!',
            icon: '/assets/images/logo/icon.png',
            badge: '/assets/images/logo/icon.png',
            tag: 'damp-notification',
            actions: [
                { action: 'view', title: 'View Update' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification('DAMP Smart Drinkware', options)
        );
    }

    getCachingStrategy(request) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        
        // Critical resources (HTML, critical CSS/JS)
        if (pathname.endsWith('.html') || 
            pathname.includes('critical') || 
            pathname.includes('main.css') ||
            pathname.includes('header.js')) {
            return CACHE_STRATEGIES.CRITICAL;
        }
        
        // Static assets (images, fonts, etc.)
        if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf)$/)) {
            return CACHE_STRATEGIES.STATIC;
        }
        
        // API calls
        if (pathname.includes('/api/') || url.hostname !== location.hostname) {
            return CACHE_STRATEGIES.API;
        }
        
        // Dynamic content
        if (pathname.includes('/pages/') || request.method === 'POST') {
            return CACHE_STRATEGIES.DYNAMIC;
        }
        
        // Default to critical for unknown resources
        return CACHE_STRATEGIES.CRITICAL;
    }

    async executeStrategy(request, strategyName) {
        const config = CACHE_CONFIGS[strategyName];
        
        switch (config.strategy) {
            case 'NetworkFirst':
                return this.networkFirst(request, strategyName);
            case 'CacheFirst':
                return this.cacheFirst(request, strategyName);
            case 'StaleWhileRevalidate':
                return this.staleWhileRevalidate(request, strategyName);
            case 'CacheOnly':
                return this.cacheOnly(request, strategyName);
            default:
                return this.networkFirst(request, strategyName);
        }
    }

    async networkFirst(request, cacheName) {
        try {
            const networkResponse = await fetch(request);
            
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return this.getOfflineFallback(request);
        }
    }

    async cacheFirst(request, cacheName) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Optionally refresh cache in background
            this.refreshCacheInBackground(request, cacheName);
            return cachedResponse;
        }
        
        try {
            const networkResponse = await fetch(request);
            
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            return this.getOfflineFallback(request);
        }
    }

    async staleWhileRevalidate(request, cacheName) {
        const cachedResponse = await caches.match(request);
        
        // Always try to refresh from network
        const networkPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                const cache = caches.open(cacheName);
                cache.then(c => c.put(request, networkResponse.clone()));
            }
            return networkResponse;
        }).catch(() => null);
        
        // Return cached version immediately if available
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Otherwise wait for network
        const networkResponse = await networkPromise;
        return networkResponse || this.getOfflineFallback(request);
    }

    async cacheOnly(request, cacheName) {
        return await caches.match(request) || this.getOfflineFallback(request);
    }

    async preloadCriticalResources() {
        const criticalResources = [
            '/',
            '/assets/css/main.css',
            '/assets/js/components/header.js',
            '/assets/js/scripts.js',
            '/assets/images/logo/icon.png',
            '/manifest.json'
        ];

        const cache = await caches.open(CACHE_STRATEGIES.CRITICAL);
        
        const promises = criticalResources.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (error) {
                console.warn(`[DAMP SW] Failed to preload: ${url}`, error);
            }
        });

        await Promise.allSettled(promises);
    }

    async cleanupOldCaches() {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name.startsWith('damp-') && name !== CACHE_NAME
        );

        await Promise.all(
            oldCaches.map(name => caches.delete(name))
        );

        console.log(`[DAMP SW] Cleaned up ${oldCaches.length} old caches`);
    }

    // Hot Module Replacement Implementation
    enableHotModuleReplacement() {
        if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
            hmrEnabled = true;
            console.log('[DAMP SW] Hot Module Replacement enabled for development');
        }
    }

    isHMRRequest(request) {
        return hmrEnabled && request.url.includes('/__hmr__');
    }

    async handleHMRRequest(event) {
        // Handle hot reload requests
        performanceMetrics.hotReloads++;
        
        event.respondWith(
            fetch(event.request).then(response => {
                if (response.ok) {
                    this.broadcastHMRUpdate(event.request.url);
                }
                return response;
            })
        );
    }

    enableHMR(client) {
        hmrClients.add(client);
        client.postMessage({ type: 'HMR_ENABLED' });
    }

    disableHMR(client) {
        hmrClients.delete(client);
    }

    broadcastHMRUpdate(url) {
        const message = {
            type: 'HMR_UPDATE',
            url: url,
            timestamp: Date.now()
        };

        hmrClients.forEach(client => {
            client.postMessage(message);
        });

        // Also notify via broadcast channel
        if (self.BroadcastChannel) {
            const channel = new BroadcastChannel(HOT_RELOAD_CHANNEL);
            channel.postMessage(message);
        }
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        // Report performance metrics every 5 minutes
        setInterval(() => {
            this.reportPerformanceMetrics();
        }, 5 * 60 * 1000);
    }

    trackPerformance(type, url) {
        performanceMetrics[type]++;
        
        // Sample detailed tracking (10% of requests)
        if (Math.random() < 0.1) {
            this.reportDetailedMetric(type, url);
        }
    }

    reportPerformanceMetrics() {
        if (self.BroadcastChannel) {
            const channel = new BroadcastChannel(PERFORMANCE_CHANNEL);
            channel.postMessage({
                type: 'SW_PERFORMANCE',
                metrics: { ...performanceMetrics },
                timestamp: Date.now()
            });
        }
    }

    // Background sync handlers
    async syncAnalytics() {
        // Sync queued analytics events
        try {
            const analyticsData = await this.getStoredData('analytics-queue');
            if (analyticsData && analyticsData.length > 0) {
                await this.sendAnalytics(analyticsData);
                await this.clearStoredData('analytics-queue');
            }
            performanceMetrics.backgroundSyncJobs++;
        } catch (error) {
            console.error('[DAMP SW] Analytics sync failed:', error);
        }
    }

    async syncFormSubmissions() {
        // Sync queued form submissions
        try {
            const formData = await this.getStoredData('form-queue');
            if (formData && formData.length > 0) {
                await this.sendFormData(formData);
                await this.clearStoredData('form-queue');
            }
            performanceMetrics.backgroundSyncJobs++;
        } catch (error) {
            console.error('[DAMP SW] Form sync failed:', error);
        }
    }

    async syncPreorders() {
        // Sync queued preorders
        try {
            const preorderData = await this.getStoredData('preorder-queue');
            if (preorderData && preorderData.length > 0) {
                await this.sendPreorderData(preorderData);
                await this.clearStoredData('preorder-queue');
            }
            performanceMetrics.backgroundSyncJobs++;
        } catch (error) {
            console.error('[DAMP SW] Preorder sync failed:', error);
        }
    }

    // Utility methods
    async getOfflineFallback(request) {
        const url = new URL(request.url);
        
        if (request.destination === 'document') {
            return caches.match('/offline.html') || 
                   new Response('Offline', { status: 503 });
        }
        
        if (url.pathname.includes('images/')) {
            return caches.match('/assets/images/offline-placeholder.png') ||
                   new Response('', { status: 503 });
        }
        
        return new Response('Service Unavailable', { status: 503 });
    }

    async refreshCacheInBackground(request, cacheName) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, response);
            }
        } catch (error) {
            // Silent fail for background refresh
        }
    }

    notifyClients(type, data) {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({ type, data });
            });
        });
    }

    async getStoredData(key) {
        // Implementation would use IndexedDB or similar
        return [];
    }

    async clearStoredData(key) {
        // Implementation would clear IndexedDB data
    }

    async sendAnalytics(data) {
        // Send analytics data to server
        return fetch('/api/analytics', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async sendFormData(data) {
        // Send form data to server
        return fetch('/api/forms', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async sendPreorderData(data) {
        // Send preorder data to server
        return fetch('/api/preorders', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Initialize the advanced service worker
new DAMPServiceWorker();

// Global error handler
self.addEventListener('error', (event) => {
    console.error('[DAMP SW] Service Worker Error:', event.error);
    performanceMetrics.failedRequests++;
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[DAMP SW] Unhandled Promise Rejection:', event.reason);
    performanceMetrics.failedRequests++;
});

console.log('[DAMP SW] Advanced Service Worker loaded successfully'); 