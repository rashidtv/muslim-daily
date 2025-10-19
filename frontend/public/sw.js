// public/sw.js - Version that actually triggers updates
const APP_VERSION = '2.2.0';
const CACHE_NAME = `muslim-daily-${APP_VERSION}`;

self.addEventListener('install', (event) => {
  console.log(`🔄 Installing SW v${APP_VERSION}...`);
  self.skipWaiting(); // This is crucial for updates
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
      return self.clients.claim();
    }).then(() => {
      // Notify all clients about the new version
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: APP_VERSION
          });
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

// Listen for messages to trigger notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    self.registration.showNotification(
      event.data.notification.title,
      event.data.notification
    );
  }
});