// Minimal, deliberately conservative service worker for «Местный Базар».
//
// This is a live-pricing/live-stock marketplace rendered per-request via
// TanStack Start SSR on Cloudflare Workers — there is no static/offline
// snapshot of the catalog that would be safe to serve from a cache. This SW
// therefore does NOT precache the app shell or intercept navigation/API
// requests; it only speeds up repeat loads of immutable, content-hashed
// static assets (JS/CSS chunks under /assets/, PWA icons) via cache-first,
// and offers a tiny offline fallback page for navigations when the network
// is truly unreachable. Everything else (HTML pages, /api/*, Supabase calls)
// always goes to the network untouched.
const CACHE_NAME = "mestny-bazar-static-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isImmutableStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isImmutableStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
  // Everything else (pages, server functions, Supabase, images from
  // storage): untouched network pass-through — never served from cache.
});
