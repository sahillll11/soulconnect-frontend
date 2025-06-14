const CACHE_NAME = 'soulconnect-pwa-v3.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('SoulConnect PWA installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching SoulConnect resources...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('SoulConnect PWA cached successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SoulConnect PWA activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SoulConnect PWA activated');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Don't cache API calls
          if (event.request.url.includes('/api/')) {
            return response;
          }

          // Cache other resources
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SoulConnect Mobile App activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New message in SoulConnect!',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><circle cx="96" cy="96" r="96" fill="%232563eb"/><text y="130" font-size="100" text-anchor="middle" x="96" fill="white">💬</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="%232563eb"/></svg>',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open SoulConnect',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="%232563eb"/><text y="65" font-size="40" text-anchor="middle" x="48" fill="white">💙</text></svg>'
      },
      {
        action: 'ai-chat',
        title: 'Chat with AI',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="%233b82f6"/><text y="65" font-size="40" text-anchor="middle" x="48" fill="white">🤖</text></svg>'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SoulConnect', options)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let urlToOpen = '/';

  if (event.action === 'ai-chat') {
    urlToOpen = '/?action=ai-chat';
  } else if (event.action === 'open') {
    urlToOpen = '/';
  } else if (event.action === 'close') {
    return; // Just close, don't open anything
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if SoulConnect is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Focus existing window and navigate if needed
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }

      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Sync offline messages when back online
  return fetch('/api/sync')
    .then(response => response.json())
    .then(data => {
      console.log('Background sync completed');
    })
    .catch(error => {
      console.log('Background sync failed');
    });
}
