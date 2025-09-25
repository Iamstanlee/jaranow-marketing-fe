// Service Worker for caching and performance optimization
const CACHE_NAME = 'jaranow-v1.0.0';
const STATIC_CACHE = 'jaranow-static-v1';
const DYNAMIC_CACHE = 'jaranow-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo-brand.png',
  '/logo-wash.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Cache dynamic resources
            if (request.method === 'GET' &&
                (request.destination === 'document' ||
                 request.destination === 'script' ||
                 request.destination === 'style' ||
                 request.destination === 'image')) {

              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseClone));
            }

            return networkResponse;
          });
      })
      .catch(() => {
        // Fallback for offline
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for analytics (if supported)
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'background-analytics') {
      event.waitUntil(sendAnalytics());
    }
  });
}

async function sendAnalytics() {
  // Send queued analytics data
  console.log('Sending queued analytics data...');
}