/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'eduwingz-cache-v1';

// Assets to cache on install (app shell)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/eduwingz_logo.png',
];

// Install: cache static shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and Chrome extensions
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }

    // Network-first for API calls (don't cache API responses)
    if (
        url.pathname.startsWith('/api/') ||
        url.hostname !== self.location.hostname
    ) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ error: 'You are offline. Please check your connection.' }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
        return;
    }

    // Cache-first for everything else (static assets, JS, CSS, images)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request)
                .then((networkResponse) => {
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === 'basic'
                    ) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // For navigation requests, serve the cached index.html (SPA fallback)
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
        })
    );
});
