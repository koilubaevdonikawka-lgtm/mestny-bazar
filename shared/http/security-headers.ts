/**
 * Security headers applied to every response via requestMiddleware in
 * src/start.ts. No CORS policy or security headers existed anywhere in this
 * app before this — checkout/admin/seller pages could be iframed by any
 * third-party site (clickjacking), and there was no defense-in-depth against
 * XSS, MIME-sniffing, or protocol downgrade.
 *
 * script-src intentionally allows 'unsafe-inline' rather than a per-request
 * nonce: TanStack Start supports nonces natively (router.options.ssr.nonce,
 * read by <Scripts/>), but this app has no route using loader()/defer(), and
 * whether the framework's own internal SSR state serialization
 * (takeBufferedScripts in @tanstack/router-core) emits an inline script here
 * could not be confirmed against a real browser in this environment — a
 * mismatched nonce would silently break hydration on every page. The other
 * directives (frame-ancestors, object-src, base-uri, form-action) still
 * deliver real protection independent of that choice. Revisit once nonce
 * wiring can be verified against a real deployment.
 */

const SUPABASE_CONNECT_SRC = "https://*.supabase.co";
// Cloudflare's own Web Analytics (RUM) beacon — auto-injected by Cloudflare
// at the edge into every HTML response when the zone has Web Analytics
// enabled, entirely outside this app's own <script> tags. Without these,
// enabling that Cloudflare feature causes a CSP violation for a script this
// app never chose to add and can't remove from its own source.
const CLOUDFLARE_INSIGHTS_SRC = "https://static.cloudflareinsights.com";

/**
 * Задача №158 — Yandex Maps JS API 2.1, quoted verbatim from the official
 * docs (yandex.com/dev/jsapi-v2-1/doc/en/v2-1/dg/concepts/load), for both
 * script-src and connect-src ("the same five domains"). csp=true is also
 * required on the loader URL itself (YandexMapPicker.tsx) for the API to
 * respect any of this instead of relying on patterns a strict CSP blocks.
 */
const YANDEX_MAPS_SRC =
  "https://api-maps.yandex.ru https://*.api-maps.yandex.ru https://suggest-maps.yandex.ru https://*.maps.yandex.net https://yandex.ru";

/**
 * Задача №158 — 2GIS publishes no CSP/network-requirements documentation
 * (checked docs.2gis.com/en/mapgl/{overview/features,start/first-steps} —
 * neither mentions CSP or an allowed-domains list at all). Determined
 * empirically instead: downloaded the actual production script
 * (https://mapgl.2gis.com/api/js/v1, 2026-08) and grepped its minified
 * source for every distinct hostname literal it references:
 *   - tile{subdomain}.maps.2gis.com / tile{subdomain}-sdk.maps.2gis.com —
 *     tile servers ({subdomain} is substituted at runtime) -> *.maps.2gis.com
 *   - keys.api.2gis.com — API key validation (.../public/v1/keys/{keyID}/...)
 *   - styles.api.2gis.com — map style definitions
 *   - disk.2gis.com — style icon assets (/styles/assets/icons) + 3D models
 *   - jam.api.2gis.com — traffic-jams layer, referenced in the same core
 *     init block as the two domains above
 *   - s1.bss.2gis.com — the SDK's own internal telemetry endpoint
 * (dev.2gis.ru and web-staging.2gis.ru also appear in the source, but only
 * as a plain attribution `<a href>` link and inside clearly-named
 * test/staging tile configs (relief_test/dem_pre_prod) this app's basic
 * usage never selects — not added here; revisit only if a real console
 * error names one of them). Not verified against 2GIS's own documentation
 * since none exists on this topic — flag this list for re-check if 2GIS
 * changes their infrastructure or publishes official guidance later.
 */
const TWOGIS_MAPGL_SRC =
  "https://mapgl.2gis.com https://*.maps.2gis.com https://keys.api.2gis.com https://styles.api.2gis.com https://disk.2gis.com https://jam.api.2gis.com https://s1.bss.2gis.com";

/** Задача №151/153 — client-side reverse geocoding for the map picker (src/lib/reverseGeocode.ts). */
const NOMINATIM_CONNECT_SRC = "https://nominatim.openstreetmap.org";

/**
 * Задача №302 — the Telegram Login Widget (src/components/TelegramLoginButton.tsx)
 * loads its script from telegram.org and renders the actual login UI in an
 * iframe served from oauth.telegram.org (per Telegram's own widget
 * architecture, https://core.telegram.org/widgets/login) — the two official
 * hosts the embed needs, nothing wider. Confirmed live: without telegram.org
 * on script-src, Chrome's own CSP report blocked the widget script outright
 * before this was added ("violates ... script-src ... blocked").
 */
const TELEGRAM_WIDGET_SCRIPT_SRC = "https://telegram.org";
const TELEGRAM_WIDGET_FRAME_SRC = "https://oauth.telegram.org";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // Задача №158 — 'unsafe-eval' is Yandex's own documented requirement
  // ("нужен для работы шаблонов API") for their JS API 2.1, not something
  // this app would otherwise choose to allow — it lets any script already
  // permitted above run eval()/new Function(), a real widening of what a
  // successful XSS could do. Accepted deliberately for Yandex Maps
  // specifically; revisit if Yandex ever drops the requirement.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${CLOUDFLARE_INSIGHTS_SRC} ${YANDEX_MAPS_SRC} https://mapgl.2gis.com ${TELEGRAM_WIDGET_SCRIPT_SRC}`,
  // blob: — Yandex's own documented style-src requirement (their JS API
  // constructs stylesheets from blob: URLs internally).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com blob:",
  "font-src 'self' https://fonts.gstatic.com",
  // Seller-submitted product image URLs can point to any host, so img-src
  // can't be locked to a fixed allow-list without breaking real listings.
  // Yandex's docs also list img-src domains (*.maps.yandex.net,
  // api-maps.yandex.ru, yandex.ru) plus data: — already fully covered by
  // the existing "https:" + "data:" below, so nothing to add here; those
  // specific hosts would be no-op duplicates of a strictly broader rule
  // already in place.
  "img-src 'self' data: https:",
  `connect-src 'self' ${SUPABASE_CONNECT_SRC} ${CLOUDFLARE_INSIGHTS_SRC} ${YANDEX_MAPS_SRC} ${TWOGIS_MAPGL_SRC} ${NOMINATIM_CONNECT_SRC} ${TELEGRAM_WIDGET_FRAME_SRC}`,
  // Задача №158 — new directive. Yandex's docs call for frame-src (and
  // child-src for older-browser compatibility) to allow
  // api-maps.yandex.ru; 'self' is kept so this doesn't silently remove the
  // default-src 'self' fallback this app relied on before either directive
  // existed (no same-origin iframe use exists today, but nothing should
  // regress if one is ever added).
  // Задача №302 — oauth.telegram.org added the same way, for the Login
  // Widget's own login iframe.
  `frame-src 'self' https://api-maps.yandex.ru ${TELEGRAM_WIDGET_FRAME_SRC}`,
  `child-src 'self' https://api-maps.yandex.ru ${TELEGRAM_WIDGET_FRAME_SRC}`,
  // Задача №158 — new directive, found empirically (not in Yandex's docs):
  // 2GIS MapGL's actual script creates Web Workers from blob: URLs
  // (`new Worker(URL.createObjectURL(new Blob([...], {type:"text/javascript"})))`)
  // — without this, 2GIS's tile rendering/labeling workers fail even with
  // every domain above correctly allowed.
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

/** CSP is production-only — Vite's dev-mode HMR client relies on patterns
 * (eval-based module replacement) this policy doesn't account for, and dev
 * traffic isn't the threat model this header set protects against. */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function applySecurityHeaders(headers: Headers): void {
  if (isProduction()) {
    headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // geolocation=(self): the app's own Geolocation capability
  // (src/lib/capabilities/web/geolocation.ts) calls navigator.geolocation
  // directly, which Permissions-Policy gates — geolocation=() would silently
  // break it the moment it's wired into a component. Camera/microphone stay
  // fully blocked: photo capture goes through <input type="file" capture>
  // (an OS picker, ungoverned by this policy, see web/image-picker.ts), and
  // nothing uses getUserMedia. Third-party iframes still get nothing either way.
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
}
