// DAMP Service Worker - Google Engineering Best Practices
// Implements caching strategies, offline support, and performance optimization

const CACHE_NAME = 'damp-v1.2.0';
const CACHE_STATIC_NAME = 'damp-static-v1.2.0';
const CACHE_DYNAMIC_NAME = 'damp-dynamic-v1.2.0';
const CACHE_IMAGES_NAME = 'damp-images-v1.2.0';

// Files to cache immediately (App Shell)
const STATIC_FILES = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/css/navigation.css',
    '/assets/css/pricing-system.css',
    '/assets/js/scripts.js',
    '/assets/js/navigation.js',
    '/assets/js/lazy-loading.js',
    '/assets/js/performance-monitor.js',
    '/assets/images/logo/icon.png',
    '/assets/images/logo/icon-192.png',
    '/assets/images/logo/icon-512.png',
    '/pages/about.html',
    '/pages/support.html',
    '/pages/privacy.html',
    '/offline.html'
];

// Files to cache on demand
const DYNAMIC_CACHE_ROUTES = [
    '/pages/',
    '/api/',
    '/assets/images/products/',
    '/assets/images/hero/'
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Critical files - Cache First
    static: {
        pattern: /\.(css|js|woff|woff2|ttf|eot)$/,
        strategy: 'cacheFirst',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    
    // Images - Cache First with fallback
    images: {
        pattern: /\.(jpg|jpeg|png|gif|svg|webp|ico)$/,
        strategy: 'cacheFirst',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    
    // HTML pages - Network First
    pages: {
        pattern: /\.html$/,
        strategy: 'networkFirst',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    },
    
    // API calls - Network First
    api: {
        pattern: /\/api\//,
        strategy: 'networkFirst',
        maxAge: 5 * 60 * 1000 // 5 minutes
    },
    
    // External resources - Stale While Revalidate
    external: {
        pattern: /^https?:\/\//,
        strategy: 'staleWhileRevalidate',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
};

// Performance monitoring
let performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    offlineRequests: 0,
    lastUpdated: Date.now()
};

// Install event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_STATIC_NAME).then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            }),
            createOfflinePage()
        ])
    );
    
    // Force activation of new service worker
    self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_STATIC_NAME && 
                            cacheName !== CACHE_DYNAMIC_NAME &&
                            cacheName !== CACHE_IMAGES_NAME) {
                            console.log('Service Worker: Removing old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Claim all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - Handle all network requests
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Determine cache strategy
    const strategy = getCacheStrategy(request);
    
    event.respondWith(
        handleRequest(request, strategy)
            .catch(() => {
                // Fallback to offline page for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                
                // Fallback for images
                if (request.destination === 'image') {
                    return createFallbackImage();
                }
                
                // Generic fallback
                return new Response('Network error occurred', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});

// Determine cache strategy for request
function getCacheStrategy(request) {
    const url = request.url;
    
    // Check each strategy pattern
    for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
        if (config.pattern.test(url)) {
            return { ...config, name };
        }
    }
    
    // Default strategy
    return {
        name: 'networkFirst',
        strategy: 'networkFirst',
        maxAge: 60 * 60 * 1000 // 1 hour
    };
}

// Handle request based on strategy
async function handleRequest(request, strategy) {
    const cacheName = getCacheName(strategy.name);
    
    switch (strategy.strategy) {
        case 'cacheFirst':
            return cacheFirst(request, cacheName, strategy);
        
        case 'networkFirst':
            return networkFirst(request, cacheName, strategy);
        
        case 'staleWhileRevalidate':
            return staleWhileRevalidate(request, cacheName, strategy);
        
        default:
            return networkFirst(request, cacheName, strategy);
    }
}

// Cache First Strategy
async function cacheFirst(request, cacheName, strategy) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Check if cached response is expired
        const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
        const isExpired = Date.now() - cacheDate.getTime() > strategy.maxAge;
        
        if (!isExpired) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
    }
    
    // Fetch from network
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            responseToCache.headers.set('sw-cache-date', new Date().toISOString());
            cache.put(request, responseToCache);
            performanceMetrics.networkRequests++;
            return networkResponse;
        }
    } catch (error) {
        console.warn('Network fetch failed:', error);
    }
    
    // Return cached response even if expired
    if (cachedResponse) {
        performanceMetrics.cacheHits++;
        return cachedResponse;
    }
    
    performanceMetrics.cacheMisses++;
    throw new Error('No cached response available');
}

// Network First Strategy
async function networkFirst(request, cacheName, strategy) {
    const cache = await caches.open(cacheName);
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            responseToCache.headers.set('sw-cache-date', new Date().toISOString());
            cache.put(request, responseToCache);
            performanceMetrics.networkRequests++;
            return networkResponse;
        }
    } catch (error) {
        console.warn('Network fetch failed, trying cache:', error);
    }
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        performanceMetrics.cacheHits++;
        return cachedResponse;
    }
    
    performanceMetrics.cacheMisses++;
    performanceMetrics.offlineRequests++;
    throw new Error('No network or cached response available');
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName, strategy) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Start network request (don't wait for it)
    const networkResponsePromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                responseToCache.headers.set('sw-cache-date', new Date().toISOString());
                cache.put(request, responseToCache);
                performanceMetrics.networkRequests++;
            }
            return networkResponse;
        })
        .catch(error => {
            console.warn('Background network fetch failed:', error);
            return null;
        });
    
    // Return cached response immediately if available
    if (cachedResponse) {
        performanceMetrics.cacheHits++;
        return cachedResponse;
    }
    
    // Wait for network response if no cache
    const networkResponse = await networkResponsePromise;
    if (networkResponse && networkResponse.ok) {
        return networkResponse;
    }
    
    performanceMetrics.cacheMisses++;
    throw new Error('No response available');
}

// Get appropriate cache name for strategy
function getCacheName(strategyName) {
    switch (strategyName) {
        case 'static':
            return CACHE_STATIC_NAME;
        case 'images':
            return CACHE_IMAGES_NAME;
        default:
            return CACHE_DYNAMIC_NAME;
    }
}

// Create offline page
async function createOfflinePage() {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DAMP - Offline</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    text-align: center;
                }
                .offline-container {
                    max-width: 500px;
                    padding: 2rem;
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.7;
                }
                .offline-title {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    font-weight: 300;
                }
                .offline-message {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    opacity: 0.9;
                }
                .offline-button {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 30px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }
                .offline-button:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📱</div>
                <h1 class="offline-title">You're offline</h1>
                <p class="offline-message">
                    No internet connection found. Some features may be limited, 
                    but you can still browse previously visited pages.
                </p>
                <button class="offline-button" onclick="window.location.reload()">
                    Try Again
                </button>
            </div>
        </body>
        </html>
    `;
    
    const cache = await caches.open(CACHE_STATIC_NAME);
    await cache.put('/offline.html', new Response(offlineHTML, {
        headers: { 'Content-Type': 'text/html' }
    }));
}

// Create fallback image
function createFallbackImage() {
    const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#grad)"/>
            <text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="16">
                Image unavailable
            </text>
        </svg>
    `;
    
    return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
    });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// Handle background sync
async function handleBackgroundSync() {
    try {
        // Process any queued offline actions
        console.log('Processing background sync...');
        
        // Example: Sync analytics data
        if ('indexedDB' in self) {
            // Process offline analytics queue
            await processOfflineAnalytics();
        }
        
        // Example: Sync form submissions
        await processOfflineFormSubmissions();
        
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Process offline analytics
async function processOfflineAnalytics() {
    // Implementation for offline analytics sync
    console.log('Processing offline analytics...');
}

// Process offline form submissions
async function processOfflineFormSubmissions() {
    // Implementation for offline form sync
    console.log('Processing offline form submissions...');
}

// Push notification handling
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/assets/images/logo/icon-192.png',
        badge: '/assets/images/logo/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/images/logo/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/logo/icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('DAMP Smart Drinkware', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Performance monitoring message handling
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_PERFORMANCE_METRICS') {
        event.ports[0].postMessage({
            type: 'PERFORMANCE_METRICS',
            metrics: {
                ...performanceMetrics,
                cacheSize: getCacheSize(),
                lastUpdated: Date.now()
            }
        });
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(clearAllCaches());
    }
});

// Get cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    // Reset performance metrics
    performanceMetrics = {
        cacheHits: 0,
        cacheMisses: 0,
        networkRequests: 0,
        offlineRequests: 0,
        lastUpdated: Date.now()
    };
}

// Update cache statistics
function updateCacheStats() {
    performanceMetrics.lastUpdated = Date.now();
}

// Periodic cache cleanup
setInterval(async () => {
    try {
        const cacheNames = await caches.keys();
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const cacheDate = new Date(response.headers.get('sw-cache-date') || 0);
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days default
                    
                    if (Date.now() - cacheDate.getTime() > maxAge) {
                        await cache.delete(request);
                    }
                }
            }
        }
        
        updateCacheStats();
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}, 60 * 60 * 1000); // Run every hour

console.log('DAMP Service Worker loaded successfully'); 