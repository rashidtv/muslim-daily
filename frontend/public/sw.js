// public/sw.js - Fixed version
const APP_VERSION = '1.7.0';
const CACHE_NAME = `muslim-daily-${APP_VERSION}`;

// Only cache essential files that definitely exist
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/manifest.json'
  // Removed icons to avoid 404 errors
];

self.addEventListener('install', (event) => {
  console.log(`🔄 Installing SW v${APP_VERSION}...`);
  
  self.skipWaiting(); // Activate immediately
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // Delete all old caches first
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Caching essential resources...');
        
        // Cache each file individually with error handling
        const cachePromises = urlsToCache.map(url => {
          return fetch(url, { credentials: 'same-origin' })
            .then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
              throw new Error(`Bad response: ${response.status}`);
            })
            .catch(error => {
              console.warn(`⚠️ Could not cache ${url}:`, error.message);
              // Don't fail the entire installation
              return Promise.resolve();
            });
        });
        
        return Promise.all(cachePromises);
      });
    }).then(() => {
      console.log('✅ Service Worker installed successfully');
    }).catch(error => {
      console.log('❌ Service Worker installation failed:', error);
      // Don't fail - continue anyway
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`🔄 Activating SW v${APP_VERSION}...`);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.startsWith('muslim-daily-') || cacheName !== CACHE_NAME) {
            console.log('🗑️ Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    }).then(() => {
      console.log('✅ Service Worker activated');
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') ||
      event.request.url.includes('sockjs-node')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request).catch(() => {
          // If network fails, just let it fail naturally
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