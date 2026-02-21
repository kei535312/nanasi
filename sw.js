// Service Worker for コリドール PWA
const CACHE_NAME = 'quoridor-v12';
const ASSETS = [
  '/nanasi/',
  '/nanasi/index.html',
  '/nanasi/manifest.json',
  '/nanasi/icon-192.png',
  '/nanasi/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap'
];

// Install: cache all assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first strategy (auto-update support)
// Skip caching for /bp/ and /docs/ paths
self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if (url.indexOf('/bp/') !== -1 || url.indexOf('/docs/') !== -1) {
    return;
  }
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
