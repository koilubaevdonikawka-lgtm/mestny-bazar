/**
 * Generous above any legitimate payload in this app (the largest, a 100-item
 * checkout cart with per-item snapshots, comes in well under 250KB) but far
 * below Cloudflare's own platform-level cap (100MB) — this rejects an
 * oversized request before it's ever parsed as JSON deep in the framework,
 * rather than only bounding individual fields after the fact (see
 * shared/validation/*.schema.ts for those).
 */
export const MAX_REQUEST_BODY_BYTES = 1024 * 1024;

const BODY_BEARING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Declared-size check only — a request with no Content-Length (or one that
 * understates it) falls through to Cloudflare's own platform-level cap. */
export function isDeclaredBodyTooLarge(request: Request): boolean {
  if (!BODY_BEARING_METHODS.has(request.method)) return false;
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;
  const size = Number(contentLength);
  return Number.isFinite(size) && size > MAX_REQUEST_BODY_BYTES;
}
