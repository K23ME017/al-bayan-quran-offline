// Al-Bayan Offline Service Worker
const CACHE_NAME_STATIC = 'albayan-static-v2';
const CACHE_NAME_QURAN_DATA = 'albayan-quran-data-v1';
const CACHE_NAME_AUDIO = 'albayan-quran-audio-v1';

const STATIC_ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/surahs/manifest.json',
  '/data/surahs/1.json',
  '/data/surahs/108.json',
  '/data/surahs/112.json',
  '/data/surahs/113.json',
  '/data/surahs/114.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW pre-cache warning:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (
            key !== CACHE_NAME_STATIC &&
            key !== CACHE_NAME_QURAN_DATA &&
            key !== CACHE_NAME_AUDIO
          ) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle local Surah JSON data (/data/surahs/*.json)
  if (url.pathname.startsWith('/data/surahs/')) {
    event.respondWith(
      caches.open(CACHE_NAME_QURAN_DATA).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // If offline and not in cache, fallback
          return cachedResponse || new Response('{"error": "Offline Surah not cached"}', {
            headers: { 'Content-Type': 'application/json' },
            status: 404
          });
        }
      })
    );
    return;
  }

  // Handle Audio files (EveryAyah or CDN)
  if (url.hostname.includes('everyayah.com') || url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(CACHE_NAME_AUDIO).then(async (cache) => {
        const cachedAudio = await cache.match(request);
        if (cachedAudio) {
          return cachedAudio;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return cachedAudio || new Response(null, { status: 504, statusText: 'Audio Gateway Timeout' });
        }
      })
    );
    return;
  }

  // Handle static assets & page navigations (Cache first, falling back to network)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next load
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME_STATIC).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME_STATIC).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(async () => {
        // If navigation request fails offline, return index.html
        if (request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME_STATIC);
          return (await cache.match('/index.html')) || (await cache.match('/'));
        }
      });
    })
  );
});
