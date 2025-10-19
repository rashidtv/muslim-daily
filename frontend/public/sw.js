// public/sw.js - Complete working version
const CACHE_NAME = 'muslim-daily-v2.0';
const APP_VERSION = '2.0.0';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log(`🔄 Service Worker v${APP_VERSION} installing...`);
  self.skipWaiting(); // Activate immediately
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Opened cache');
      return cache.addAll(urlsToCache).catch(error => {
        console.warn('Some files failed to cache:', error);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`🔄 Service Worker v${APP_VERSION} activating...`);
  
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
      // Take control of all clients
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
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        return response;
      }

      return fetch(event.request).catch(() => {
        console.log('❌ Network failed for:', event.request.url);
      });
    })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: data.tag || 'prayer-notification',
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('❌ Push notification error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    self.registration.showNotification(
      event.data.notification.title,
      event.data.notification
    );
  }
});