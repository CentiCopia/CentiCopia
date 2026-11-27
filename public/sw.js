const CACHE_NAME = 'centicopia-v2';
const BUILT_ASSETS = []; // replaced at build
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/CentiCopia.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const urls = [...APP_SHELL, ...BUILT_ASSETS];
      await cache.addAll([...new Set(urls)]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      const stale = keys.filter((key) => key !== CACHE_NAME);
      return Promise.all(stale.map((key) => caches.delete(key))).then(() =>
        self.clients.claim(),
      );
    }),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, response.clone()));
        return response;
      });
    }),
  );
});
