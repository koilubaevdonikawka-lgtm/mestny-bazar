// Minimal, deliberately conservative service worker for AIKUR.
//
// This is a live-pricing/live-stock marketplace rendered per-request via
// TanStack Start SSR on Cloudflare Workers — there is no static/offline
// snapshot of the catalog that would be safe to serve from a cache. This SW
// therefore does NOT precache the app shell or intercept navigation/API
// requests; it only speeds up repeat loads of immutable, content-hashed
// static assets (JS/CSS chunks under /assets/, PWA icons) via cache-first,
// and offers a tiny offline fallback page for navigations when the network
// is truly unreachable. Pages, /api/*, and every Supabase call that can
// return live price/stock/availability data always go to the network
// untouched — never cached.
//
// Задача №207 — the one deliberate exception: product/category/banner/
// courier PHOTOS served from the two public Supabase Storage buckets
// (marketplace-media, category-images) are stale-while-revalidate cached
// (see isStorageImage/IMAGE_CACHE_NAME below) — a photo is not "live pricing
// data"; showing yesterday's photo for one extra background-refresh trip
// while browsing is a fine trade for not re-downloading the same product
// photo on every category visit. This is scoped to image bytes only, by
// bucket path — it does not touch /rest/v1, /auth/v1, or any other Supabase
// endpoint that might share the same *.supabase.co host.
const CACHE_NAME = "mestny-bazar-static-v3";
const IMAGE_CACHE_NAME = "mestny-bazar-images-v1";
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
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
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

/**
 * Задача №207 — public objects in the two Storage buckets actually used for
 * images (server/di/container.ts: SupabaseStorageAdapter("category-images"),
 * SupabaseStorageAdapter("marketplace-media")). Matched by pathname prefix
 * (not a hardcoded project-ref host) so this keeps working if the project
 * ref ever changes; still scoped tightly enough by path that it can never
 * match a REST/Auth/Realtime call on the same *.supabase.co host — those
 * live under entirely different path prefixes (/rest/v1/, /auth/v1/, ...),
 * never /storage/v1/object/public/.
 */
function isStorageImage(url) {
  if (!url.hostname.endsWith(".supabase.co")) return false;
  return (
    url.pathname.startsWith("/storage/v1/object/public/marketplace-media/") ||
    url.pathname.startsWith("/storage/v1/object/public/category-images/")
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

  if (isStorageImage(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cached = await cache.match(request);

        // An <img> tag's own request is always mode:"no-cors" (an opaque,
        // unreadable response — status 0, headers empty, ok always false),
        // so it can never pass an ok/content-type check and would silently
        // never get cached. Supabase Storage's public objects do send real
        // CORS headers, confirmed directly (a cors-mode fetch to the same
        // URL returns status 200 with a real content-type) — fetching by
        // URL with an explicit mode:"cors" here, instead of re-issuing the
        // original no-cors `request`, gets a response this check can
        // actually read. Cache lookup/storage is keyed by URL either way, so
        // this cors-mode response still satisfies the original no-cors
        // request on the next cache.match().
        const networkUpdate = fetch(request.url, { mode: "cors" }).then((response) => {
          if (response.ok && (response.headers.get("content-type") || "").startsWith("image/")) {
            cache.put(request, response.clone());
          }
          return response;
        });

        if (cached) {
          // Stale-while-revalidate: the already-seen photo shows instantly;
          // the background refresh quietly catches an admin-side photo
          // replacement for next time, without making this navigation wait
          // on it. Errors here are deliberately swallowed — nothing is
          // awaiting this promise for a response.
          event.waitUntil(networkUpdate.catch(() => {}));
          return cached;
        }
        // Nothing cached yet — behaves like an ordinary fetch, including a
        // genuine network failure propagating exactly as it did before this
        // SW touched storage-image requests at all.
        return networkUpdate;
      })(),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
  // Everything else (pages, server functions, every other Supabase call):
  // untouched network pass-through — never served from cache.
});
