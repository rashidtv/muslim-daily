const CACHE_NAME = 'muslim-daily-v4.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Enhanced background sync for mobile
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

// Enhanced fetch with network-first strategy for reliability
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network first for API calls
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});

// Enhanced push with background sync for mobile reliability
self.addEventListener('push', (event) => {
  console.log('📢 Push event received:', event);
  
  // Ensure service worker stays alive
  event.waitUntil(
    self.registration.showNotification('Prayer Time', {
      body: 'Checking prayer times...',
      requireInteraction: false
    })
  );

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
    tag: data.tag || 'prayer-notification-' + Date.now(),
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
      url: '/',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Prayer Time',
      options
    ).then(() => {
      console.log('✅ Mobile notification shown successfully');
    }).catch(error => {
      console.error('❌ Mobile notification error:', error);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'snooze') {
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

// Periodic sync for reliable background updates (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'prayer-notification-check') {
    console.log('🔄 Periodic sync for prayer notifications');
    event.waitUntil(checkPrayerNotifications());
  }
});

async function checkPrayerNotifications() {
  // This would check if any notifications were missed
  console.log('🔍 Checking for missed notifications');
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});