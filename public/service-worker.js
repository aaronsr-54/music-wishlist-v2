const CACHE_NAME = 'music-wishlist-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        console.log('Cache assets failed');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      const isUpdate = cacheNames.some((name) => name !== CACHE_NAME);
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
      if (isUpdate) {
        const clientList = await self.clients.matchAll({ type: 'window' });
        clientList.forEach((client) =>
          client.postMessage({ type: 'NEW_VERSION_AVAILABLE' })
        );
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external APIs
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

const RELEASE_EMOJI = { Álbum: '💿', EP: '🎧', Canción: '🎵' };

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();

  if (data.type === 'downloaded') {
    event.waitUntil(
      self.registration.showNotification(
        `¡Ya tienes listo ${data.itemName} de ${data.itemArtist}!`,
        {
          body: `Dale las gracias a ${data.downloadedBy} 😉`,
          icon: data.coverUrl,
          badge: '/favicon.png',
          data: { url: '/wishlist?tab=downloaded' },
        },
      ),
    );
    return;
  }

  const emoji = RELEASE_EMOJI[data.releaseType] ?? '🎵';
  event.waitUntil(
    self.registration.showNotification(`${emoji} Nuevo ${data.releaseType} de ${data.artist}`, {
      body: data.title,
      icon: data.coverUrl,
      image: data.coverUrl,
      badge: '/favicon.png',
      data: { albumId: data.albumId },
      actions: [
        { action: 'add', title: '+ Wishlist' },
        { action: 'view', title: 'Ver release' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { albumId, url } = event.notification.data;

  if (url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((list) => {
        for (const client of list) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
    );
    return;
  }

  const targetUrl =
    event.action === 'add'
      ? `/album/${albumId}?add=true`
      : `/album/${albumId}`;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
