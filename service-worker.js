// Service Worker for Luxury Travel Sweden
// Caches images and assets for better performance

const CACHE_VERSION = 'v13';
const CACHE_NAME = `lts-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/styles.css',
    '/scripts.js',
    '/component-loader.js',
    '/menu-init.js',
    '/liv-ai.js',
    '/supabase-client.js',
    '/inline-editor.js'
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Images from Supabase - Cache first, then network (long-term cache)
    IMAGES: {
        pattern: /fjnfsabvuiyzuzfhxzcc\.supabase\.co\/storage\/v1\/object\/public\/(pillar-images|media|video)/,
        strategy: 'cache-first',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    // CSS and JS - Network first, fallback to cache
    ASSETS: {
        pattern: /\.(css|js)$/,
        strategy: 'network-first',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    // External libraries - Cache first (they rarely change)
    EXTERNAL: {
        pattern: /(unpkg\.com|cdn\.jsdelivr\.net)/,
        strategy: 'cache-first',
        maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    }
};

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('[Service Worker] Precache failed:', err))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('lts-cache-') && name !== CACHE_NAME)
                        .map(name => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Chrome extensions and dev server requests
    if (url.protocol === 'chrome-extension:' || url.hostname === 'localhost') {
        return;
    }

    // Determine strategy based on request URL
    let strategy = null;
    let maxAge = null;

    for (const [key, config] of Object.entries(CACHE_STRATEGIES)) {
        if (config.pattern.test(request.url)) {
            strategy = config.strategy;
            maxAge = config.maxAge;
            break;
        }
    }

    // If no strategy matched, use network-first for same-origin, network-only for cross-origin
    if (!strategy) {
        strategy = url.origin === self.location.origin ? 'network-first' : 'network-only';
    }

    // Apply the strategy
    if (strategy === 'cache-first') {
        event.respondWith(cacheFirst(request, maxAge));
    } else if (strategy === 'network-first') {
        event.respondWith(networkFirst(request, maxAge));
    } else if (strategy === 'network-only') {
        event.respondWith(fetch(request));
    }
});

// Cache-first strategy: Try cache, fallback to network
async function cacheFirst(request, maxAge) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        // Check if cached response is still fresh
        const cachedDateHeader = cached.headers.get('sw-cached-date');

        if (cachedDateHeader && maxAge) {
            const cachedTime = new Date(cachedDateHeader);
            const now = new Date();

            // Only check freshness if we have a valid date
            if (!isNaN(cachedTime.getTime())) {
                if (now - cachedTime < maxAge) {
                    console.log('[Service Worker] Cache hit (fresh):', request.url);
                    return cached;
                }
                // Stale but valid - update in background
                console.log('[Service Worker] Cache hit (stale, updating in background):', request.url);
                fetchAndCache(request, cache);
                return cached;
            }
        }

        // If no date header or invalid, just return the cached version
        // Images should be cached indefinitely once fetched
        console.log('[Service Worker] Cache hit (serving cached):', request.url);
        return cached;
    }

    console.log('[Service Worker] Cache miss, fetching:', request.url);
    return fetchAndCache(request, cache);
}

// Network-first strategy: Try network, fallback to cache
async function networkFirst(request, maxAge) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);
        if (response.ok) {
            const responseToCache = response.clone();
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cached-date', new Date().toISOString());

            const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
            });

            cache.put(request, cachedResponse);
        }
        return response;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        throw error;
    }
}

// Helper function to fetch and cache
async function fetchAndCache(request, cache) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const responseToCache = response.clone();
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cached-date', new Date().toISOString());

            const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
            });

            await cache.put(request, cachedResponse);
        }
        return response;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        throw error;
    }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                console.log('[Service Worker] Cache cleared');
            })
        );
    }
});
