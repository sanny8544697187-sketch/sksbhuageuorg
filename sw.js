// ═══════════════════════════════════════════════════════════
// KrishiGyan — Service Worker  v3.1
// Strategy:
//   • HTML (index.html / navigation) → Network-first (always fresh)
//   • Firebase / API calls           → Bypass (never intercept)
//   • Fonts                          → Cache-first (long-lived)
//   • Images / CDN scripts           → Stale-while-revalidate
// ═══════════════════════════════════════════════════════════

const CACHE_NAME    = 'KRISHI-GYAN-v3.1';
const DYNAMIC_CACHE = 'KRISHI-GYAN-v3.1-dynamic';

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
  'cdnjs.cloudflare.com',
];

function shouldBypass(url) {
  if (url.pathname.startsWith('/.netlify/')) return true;
  if (url.pathname.startsWith('/api/')) return true;
  return BYPASS_DOMAINS.some(d => url.hostname.includes(d));
}

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  // Take over immediately without waiting
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(err => console.warn('[SW] Pre-cache failed:', err))
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

  // 1. Only handle GET requests
  if (request.method !== 'GET') return;

  // 2. Bypass Firebase, Razorpay, and other live-only services
  if (shouldBypass(url)) return;

  // 3. Navigation / HTML → Network-first (always get fresh index.html)
  if (request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./')))
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
