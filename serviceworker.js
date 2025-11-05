// Bump this when you change cached files
const VERSION = 'v3';

// Compute base (works for / and /REPO_NAME/)
const url = new URL(self.registration.scope);
const BASE = url.pathname; // e.g. "/" or "/NSTW-CROSSWORD/"

const ASSETS = [
  '',                    // index.html
  'index.html',
  'manifest.webmanifest',
  'assets/POWERPOINT COVER PAGE.jpg',
  'assets/ZOOM BG.jpg',
  'assets/Blank Event Banner.jpg'
].map(p => new URL(p, self.registration.scope).pathname);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('crossword-' + VERSION).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k.startsWith('crossword-') && k !== 'crossword-' + VERSION) ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Only handle same-origin GET
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(cached =>
      cached ||
      fetch(req).then(resp => {
        // Cache successful GETs
        const copy = resp.clone();
        caches.open('crossword-' + VERSION).then(c => c.put(req, copy));
        return resp;
      }).catch(() => {
        // Fallback to index for navigation requests (SPA-like)
        if (req.mode === 'navigate') return caches.match(new URL('index.html', self.registration.scope).pathname);
      })
    )
  );
});
