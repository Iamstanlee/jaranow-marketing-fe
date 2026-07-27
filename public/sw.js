// Service Worker for caching and performance optimization
const STATIC_CACHE = 'jaranow-static-v4';
const DYNAMIC_CACHE = 'jaranow-runtime-v4';

// The shell each installed app launches into. Both are precached so an offline launch
// still boots on its own route.
const SHELLS = ['/', '/__/book'];

// Assets to cache immediately
const STATIC_ASSETS = [
  ...SHELLS,
  '/brand/jaranow-logo-white.svg',
  '/manifest.json',
  '/bookkeeping-manifest.json',
  '/jaranow/icon-192.png',
  '/jaranow/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      // Cached one by one rather than with addAll(), which is all-or-nothing: a single
      // asset that 404s would fail the install and leave the site with no worker at all.
      .then(cache => Promise.all(STATIC_ASSETS.map(asset => cache.add(asset).catch(
        error => console.warn('Service Worker could not precache', asset, error)
      ))))
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

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and anything that isn't a plain read
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // HTML and the manifests go to the network first. Serving them from cache pins an
  // installed app to whichever build it happened to see first — including the manifest
  // that decides which route the app launches into — and no deploy ever reaches it.
  const isDocument = request.mode === 'navigate' || request.destination === 'document';
  if (isDocument || url.pathname.endsWith('manifest.json')) {
    event.respondWith(networkFirst(request, isDocument));
    return;
  }

  // Everything else (hashed bundles, images, fonts, logos) is immutable in practice.
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request, isDocument) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      const copy = response.clone();
      caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreVary: true });
    if (cached) return cached;
    if (!isDocument) throw error;
    // Fall back to the shell of the app being asked for, never a different one: an
    // offline launch of the books app must not quietly come up on the marketing site.
    const shell = new URL(request.url).pathname.startsWith('/__/') ? '/__/book' : '/';
    const fallback = await caches.match(shell, { ignoreVary: true });
    if (fallback) return fallback;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.status === 200 && response.type === 'basic' &&
      ['script', 'style', 'image', 'font'].includes(request.destination)) {
    const copy = response.clone();
    caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
  }
  return response;
}

// Background sync for analytics (if supported)
if ('sync' in self.registration) {
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
