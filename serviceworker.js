const VERSION = 'crossword-v5'; // bump this
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/POWERPOINT COVER PAGE.jpg',
  './assets/ZOOM BG.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE_URLS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== VERSION ? caches.delete(k) : null)))
    )
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))
  );
});
