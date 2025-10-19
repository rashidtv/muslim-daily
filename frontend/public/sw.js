// public/sw.js - Working update version
const APP_VERSION = '2.3.0';
const CACHE_NAME = `muslim-daily-${APP_VERSION}`;

self.addEventListener('install', (event) => {
  console.log(`🔄 Installing SW v${APP_VERSION}...`);
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log(`🔄 Activating SW v${APP_VERSION}...`);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control immediately
      return self.clients.claim();
    }).then(() => {
      // Force notify all clients
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        console.log('📢 Notifying client about update');
        client.postMessage({
          type: 'NEW_VERSION_AVAILABLE',
          version: APP_VERSION,
          timestamp: Date.now()
        });
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});