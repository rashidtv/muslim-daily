const CACHE_NAME = 'muslim-daily-v3.0.0';

self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
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
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Handle prayer time notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Prayer time notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'prayer-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'snooze',
        title: '⏰ Snooze 5 min'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Prayer Time',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'snooze') {
    // Reschedule notification after 5 minutes
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification(
            event.notification.title,
            {
              ...event.notification,
              body: '⏰ Reminder: ' + event.notification.body
            }
          );
          resolve();
        }, 5 * 60 * 1000); // 5 minutes
      })
    );
  } else if (event.action === 'dismiss') {
    // Notification dismissed, do nothing
  } else {
    // Default click behavior - open app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle update messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});