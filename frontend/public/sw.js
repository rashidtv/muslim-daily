const CACHE_NAME = 'muslim-daily-v3.2.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Enhanced push event handler for PWA
self.addEventListener('push', (event) => {
  console.log('📢 Push event received:', event);
  
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.log('Push data parsing error:', error);
    data = {
      title: 'Prayer Time',
      body: 'Time for prayer',
      tag: 'prayer-notification'
    };
  }

  const options = {
    body: data.body || 'It\'s time for prayer. May your prayers be accepted. 🌙',
    tag: data.tag || 'prayer-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      {
        action: 'snooze',
        title: '⏰ Snooze 5 min'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss'
      }
    ],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Prayer Time',
      options
    ).then(() => {
      console.log('✅ Notification shown successfully');
    }).catch(error => {
      console.error('❌ Notification error:', error);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'snooze') {
    // Reschedule notification after 5 minutes
    event.waitUntil(
      self.registration.showNotification(
        event.notification.title,
        {
          body: '⏰ Reminder: ' + event.notification.body,
          tag: 'snoozed-' + Date.now(),
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
        }
      )
    );
  } else if (event.action === 'dismiss') {
    console.log('Notification dismissed');
  } else {
    // Default click behavior - open app
    event.waitUntil(
      clients.matchAll({ 
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});