const CACHE_NAME = 'muslim-daily-v1.3';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'prayer-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'track-prayer',
        title: '📿 Mark as Completed',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'snooze',
        title: '⏰ Remind in 10 min',
        icon: '/icons/icon-192x192.png'
      }
    ],
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'track-prayer') {
    // Mark prayer as completed
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        if (windowClients.length > 0) {
          windowClients[0].postMessage({
            type: 'TRACK_PRAYER',
            prayer: event.notification.data.prayerName
          });
          return windowClients[0].focus();
        } else {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'snooze') {
    // Snooze for 10 minutes
    event.waitUntil(
      self.registration.showNotification(event.notification.title, {
        body: `⏰ Reminder: ${event.notification.body}`,
        icon: '/icons/icon-192x192.png',
        tag: 'prayer-reminder',
        requireInteraction: true,
        data: event.notification.data
      })
    );
  } else {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        if (windowClients.length > 0) {
          return windowClients[0].focus();
        } else {
          return clients.openWindow('/');
        }
      })
    );
  }
});