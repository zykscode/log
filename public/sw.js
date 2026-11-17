/* Zykson service worker — offline reading and fast repeat visits.
 *
 *  pages      network-first (4 s), falls back to the saved/recent copy, then /offline
 *  saved      pages the reader chose "Save for offline" — kept until removed
 *  static     /_next/static/*, fonts, icons — cache-first (file names are hashed)
 *  images     stale-while-revalidate, capped
 *  never      /admin, /api (except media files), /next/* (except share images),
 *             author-mode / private responses, Next.js data requests
 */
const VERSION = 'v1';
const STATIC_CACHE = `zyk-static-${VERSION}`;
const PAGES_CACHE = 'zyk-pages';
const SAVED_CACHE = 'zyk-saved';
const IMAGES_CACHE = 'zyk-images';
const OFFLINE_URL = '/offline';
const PRECACHE = [OFFLINE_URL, '/manifest.webmanifest', '/favicon.ico', '/icons/icon-192.png', '/icons/icon-512.png'];
const MAX_PAGES = 60;
const MAX_IMAGES = 300;
const NEVER = [/^\/admin/, /^\/api\/(?!media\/file\/)/, /^\/next\/(?!og)/, /^\/_next\/webpack-hmr/, /^\/sw\.js$/, /^\/__nextjs/];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('zyk-static-') && k !== STATIC_CACHE).map((k) => caches.delete(k)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

/** Drop tracking params so "/?source=pwa" and "/" share one cache entry. */
function pageKey(request) {
  const url = new URL(request.url);
  for (const p of ['source', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref']) url.searchParams.delete(p);
  url.hash = '';
  return url.toString();
}

function storable(response) {
  if (!response || !response.ok || response.redirected) return false;
  const cc = response.headers.get('Cache-Control') || '';
  return !/no-store|private/i.test(cc); // author mode & private pages are never stored
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function cachedPage(request) {
  const key = pageKey(request);
  return (
    (await caches.match(key, { cacheName: SAVED_CACHE, ignoreVary: true })) ||
    (await caches.match(key, { cacheName: PAGES_CACHE, ignoreVary: true }))
  );
}

/** Network first; after 4 s fall back to a cached copy (if any) while the network keeps updating it. */
function handlePage(event) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (response) => {
      if (!settled && response) {
        settled = true;
        resolve(response);
      }
    };
    const network = (async () => {
      const preload = await event.preloadResponse;
      return preload || fetch(event.request);
    })();
    network
      .then((response) => {
        if (storable(response)) {
          const copy = response.clone();
          event.waitUntil(
            caches
              .open(PAGES_CACHE)
              .then((cache) => cache.put(pageKey(event.request), copy))
              .then(() => trim(PAGES_CACHE, MAX_PAGES)),
          );
        }
        finish(response);
      })
      .catch(async () => {
        finish((await cachedPage(event.request)) || (await caches.match(OFFLINE_URL)) || new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
      });
    setTimeout(async () => {
      const cached = await cachedPage(event.request);
      if (cached) finish(cached);
    }, 4000);
  });
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { cacheName });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(event, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  const refresh = fetch(event.request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') {
        cache.put(event.request, response.clone()).then(() => trim(cacheName, max));
      }
      return response;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return refresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && NEVER.some((re) => re.test(url.pathname))) return;
  // Next.js client-navigation / prefetch data: let the browser handle it. When it
  // fails offline, Next falls back to a full navigation, which we serve below.
  if (request.headers.get('RSC') || request.headers.get('Next-Router-Prefetch') || url.searchParams.has('_rsc')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handlePage(event));
    return;
  }
  if (sameOrigin && (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/fonts/'))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  if (request.destination === 'font') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  if (request.destination === 'image' || (sameOrigin && url.pathname.startsWith('/api/media/file/'))) {
    event.respondWith(staleWhileRevalidate(event, IMAGES_CACHE, MAX_IMAGES));
  }
});

/* Messages from the site: save / remove a page for offline reading. */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  const reply = (message) => event.ports[0] && event.ports[0].postMessage(message);
  if (data.type === 'SAVE_PAGE' && typeof data.url === 'string') {
    event.waitUntil(
      (async () => {
        try {
          const saved = await caches.open(SAVED_CACHE);
          const response = await fetch(data.url, { credentials: 'same-origin', cache: 'reload' });
          if (!storable(response)) throw new Error('This page can’t be saved.');
          await saved.put(pageKey(new Request(data.url)), response);
          const images = await caches.open(IMAGES_CACHE);
          await Promise.all(
            (Array.isArray(data.assets) ? data.assets : []).slice(0, 80).map(async (asset) => {
              try {
                const assetUrl = new URL(asset, self.location.origin);
                const target = assetUrl.pathname.startsWith('/_next/static/') ? await caches.open(STATIC_CACHE) : images;
                if (await target.match(assetUrl.href)) return;
                const res = await fetch(assetUrl.href, { mode: assetUrl.origin === self.location.origin ? 'same-origin' : 'no-cors' });
                if (res.ok || res.type === 'opaque') await target.put(assetUrl.href, res);
              } catch {
                /* skip asset */
              }
            }),
          );
          reply({ ok: true });
        } catch (error) {
          reply({ ok: false, error: String(error && error.message ? error.message : error) });
        }
      })(),
    );
  } else if (data.type === 'REMOVE_PAGE' && typeof data.url === 'string') {
    event.waitUntil(
      caches
        .open(SAVED_CACHE)
        .then((cache) => cache.delete(pageKey(new Request(data.url))))
        .then(() => reply({ ok: true })),
    );
  }
});
