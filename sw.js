// ═══════════════════════════════════════════════════════════
// AGRI EDU RISE — Service Worker  v2.0
// Strategy:
//   • App shell (HTML + fonts)    → Cache-first  (offline capable)
//   • Firebase / API calls        → Network-first (skip SW)
//   • Images / CDN scripts        → Stale-while-revalidate
// ═══════════════════════════════════════════════════════════

const CACHE_NAME    = 'agri-edu-rise-v8';
const DYNAMIC_CACHE = 'agri-edu-rise-dynamic-v7';

// Resources pre-cached on install (app shell)
const PRECACHE_URLS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
];

// Domains that should NEVER be intercepted (always go to network)
const BYPASS_DOMAINS = [
  'firebaseio.com',
  'googleapis.com',
  'gstatic.com',
  'razorpay.com',
  'generativelanguage.googleapis.com',
  'checkout.razorpay.com',
  'cdnjs.cloudflare.com',   // PDF.js / Tesseract loaded on demand
];

function shouldBypass(url) {
  // Never intercept Netlify function calls or Anthropic API
  if (url.pathname.startsWith('/.netlify/')) return true;
  return BYPASS_DOMAINS.some(d => url.hostname.includes(d));
}

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pre-cache failed (some resources may be unavailable offline):', err))
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== DYNAMIC_CACHE)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests and HTTP/HTTPS
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // 2. Bypass Firebase, Razorpay, and other live-only services
  if (shouldBypass(url)) return;

  // 3. Navigation requests → Cache-first (serve shell, app handles routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./')
        .then(cached => cached || fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put('./', clone));
          return res;
        }))
        .catch(() => caches.match('./').then(res => res || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // 4. Fonts → Cache-first (long-lived)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // 5. Everything else → Stale-while-revalidate
  event.respondWith(
    caches.open(DYNAMIC_CACHE).then(cache =>
      cache.match(request).then(cached => {
        const networkFetch = fetch(request).then(res => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            cache.put(request, res.clone());
          }
          return res;
        }).catch(() => null);

        return cached || networkFetch;
      })
    )
  );
});

// ── MESSAGE — allow pages to trigger cache refresh ───────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});


