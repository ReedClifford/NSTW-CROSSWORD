// serviceworker.js
const BASE = new URL(self.registration.scope).pathname.replace(/\/+$/, '') || '';
const VERSION = 'v6';                        // bump this on every deploy
const CACHE = `crossword-${VERSION}`;

// only cache things that are guaranteed to exist
const PRECACHE = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/assets/POWERPOINT COVER PAGE.jpg`,
  `${BASE}/assets/ZOOM BG.jpg`,
  `${BASE}/assets/Blank Event Banner.jpg`,
  `${BASE}/assets/icon-192.png`,
  `${BASE}/assets/icon-152.png`
];

// install: cache what we can; skip missing files instead of failing all
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async (url) => {
      try { await cache.add(url); } catch (err) { /* skip 404s */ }
    }));
    self.skipWaiting();
  })());
});

// activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// network-first for html, cache-first for others
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // stay within our scope
  if (!url.pathname.startsWith(BASE)) return;

  const isHTML = request.destination === 'document' || url.pathname.endsWith('.html');

  e.respondWith((async () => {
    if (isHTML) {
      try {
        const net = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(request, net.clone());
        return net;
      } catch {
        const cache = await caches.open(CACHE);
        return (await cache.match(request)) || (await cache.match(`${BASE}/index.html`));
      }
    } else {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
      try {
        const net = await fetch(request, { cache: 'no-store' });
        cache.put(request, net.clone());
        return net;
      } catch {
        return new Response('', { status: 504 });
      }
    }
  })());
});
