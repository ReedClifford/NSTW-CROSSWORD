// v5 – bump this when you change assets
const CACHE_NAME = 'crossword-v5';

// IMPORTANT: GitHub Pages base path
const BASE = '/NSTW-CROSSWORD/';

// Only list files that really exist
const ASSETS = [
  '',                 // the start URL → /NSTW-CROSSWORD/
  'index.html',
  'assets/POWERPOINT COVER PAGE.jpg',
  'assets/ZOOM BG.jpg',
  'assets/icon-192.png',
  'assets/icon-512.png'
].map(p => BASE + p);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GET requests
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(BASE)) // fallback to app shell
    )
  );
});
