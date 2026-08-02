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

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Seller-submitted product image URLs can point to any host, so img-src
  // can't be locked to a fixed allow-list without breaking real listings.
  "img-src 'self' data: https:",
  `connect-src 'self' ${SUPABASE_CONNECT_SRC}`,
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
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}
