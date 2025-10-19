// public/sw.js - Fixed version for instant PWA updates
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
    }).then(() => self.clients.claim()) // Take control immediately
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

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});