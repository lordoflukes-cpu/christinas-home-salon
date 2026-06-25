/* Leo tracker service worker — app-shell offline cache.
 * All user data lives in IndexedDB, so this only caches the static shell
 * (HTML/JS/CSS). Bump CACHE_VERSION to invalidate old caches.
 */
const CACHE_VERSION = 'leo-v3';
const SHELL = [
  '/leo',
  '/leo/log',
  '/leo/health',
  '/leo/memories',
  '/leo/settings',
  '/leo/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Cache the Leo shell and Next static assets; ignore everything else.
  const inScope = url.pathname.startsWith('/leo') || url.pathname.startsWith('/_next/static');
  if (!inScope) return;

  // Stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
