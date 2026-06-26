/* Leo tracker service worker — app-shell offline cache.
 * All user data lives in IndexedDB, so this only caches the static shell
 * (HTML/JS/CSS). Bump CACHE_VERSION to invalidate old caches.
 */
const CACHE_VERSION = 'leo-v19';
const SHELL = [
  '/leo',
  '/leo/timeline',
  '/leo/ask',
  '/leo/log',
  '/leo/health',
  '/leo/routine',
  '/leo/memories',
  '/leo/recap',
  '/leo/settings',
  '/leo/manifest.webmanifest',
  '/leo/art/savanna-night.jpg',
  '/leo/art/cub-portrait.jpg',
  '/leo/art/lion-and-cub.jpg',
  '/leo/art/acacia-night.webp',
  '/leo/art/family-sunset.jpg',
  '/leo/art/family-pride.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// --- Web Push: show reminders even when the app is closed -----------------
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Leo 🦁', body: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'Leo 🦁';
  const options = {
    body: payload.body || '',
    icon: '/leo/icon-192.png',
    badge: '/leo/icon-192.png',
    tag: payload.tag || 'leo-reminder',
    data: { url: payload.url || '/leo' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target =
    (event.notification.data && event.notification.data.url) || '/leo';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes('/leo') && 'focus' in client)
            return client.focus();
        }
        return self.clients.openWindow(target);
      }),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Cache the Leo shell and Next static assets; ignore everything else.
  const inScope =
    url.pathname.startsWith('/leo') || url.pathname.startsWith('/_next/static');
  if (!inScope) return;

  // Stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200)
            cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
