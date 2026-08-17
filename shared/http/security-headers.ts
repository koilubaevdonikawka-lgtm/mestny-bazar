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

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${CLOUDFLARE_INSIGHTS_SRC}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Seller-submitted product image URLs can point to any host, so img-src
  // can't be locked to a fixed allow-list without breaking real listings.
  "img-src 'self' data: https:",
  `connect-src 'self' ${SUPABASE_CONNECT_SRC} ${CLOUDFLARE_INSIGHTS_SRC}`,
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
