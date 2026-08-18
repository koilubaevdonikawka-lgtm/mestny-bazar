import { MEDIA_UPLOAD_MAX_BYTES } from "@shared/contracts/media-upload";

/**
 * Generous above any legitimate JSON payload in this app (the largest, a
 * 100-item checkout cart with per-item snapshots, comes in well under 250KB)
 * but far below Cloudflare's own platform-level cap (100MB) — this rejects an
 * oversized request before it's ever parsed as JSON deep in the framework,
 * rather than only bounding individual fields after the fact (see
 * shared/validation/*.schema.ts for those).
 *
 * Does NOT apply to multipart/form-data (file uploads) — see
 * MULTIPART_BODY_MAX_BYTES below.
 */
export const MAX_REQUEST_BODY_BYTES = 1024 * 1024;

/**
 * multipart/form-data bodies (uploadImageFn, see src/api/media-upload.functions.ts)
 * carry more than the raw file: a boundary delimiter repeated at the start of
 * each part and at the end (browsers/webviews generate short random
 * boundaries, well under 100 bytes each), a Content-Disposition header per
 * part — including `filename="..."` on the file part — a Content-Type header
 * on the file part, and a second, tiny "context" text part (one of
 * "category"/"product"/"banner"/"courier", see MediaUploadContext). Measured
 * against the real multipart shape built in src/api/media-upload.ts
 * (exactly one file field + one short text field, nothing else), that
 * framing overhead is well under 1KB even with an unusually long filename.
 *
 * 16KB is deliberately generous — 16x+ the realistic worst case — so this
 * never false-positives on a legitimate upload, while still being nowhere
 * near enough headroom to blunt the guard's actual purpose (rejecting
 * multi-MB abuse payloads well before MediaUploadService's own MIME/size
 * validation runs).
 *
 * MEDIA_UPLOAD_MAX_BYTES (shared/contracts/media-upload.ts) stays the single
 * source of truth for the real per-file limit; importing it here is safe per
 * Project_Rules/03_Стандарты_разработки/Architecture.md — shared/contracts/*
 * is the foundational, dependency-free layer everything else may depend on
 * (media-upload.ts itself has zero imports), so shared/http depending on it
 * introduces no upward or circular dependency.
 */
const MULTIPART_OVERHEAD_BYTES = 16 * 1024;
export const MULTIPART_BODY_MAX_BYTES = MEDIA_UPLOAD_MAX_BYTES + MULTIPART_OVERHEAD_BYTES;

const BODY_BEARING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isMultipartFormData(request: Request): boolean {
  const contentType = request.headers.get("content-type");
  return contentType !== null && contentType.toLowerCase().startsWith("multipart/form-data");
}

/** Declared-size check only — a request with no Content-Length (or one that
 * understates it) falls through to Cloudflare's own platform-level cap.
 * Applies MULTIPART_BODY_MAX_BYTES to multipart/form-data (file uploads) and
 * MAX_REQUEST_BODY_BYTES to everything else. */
export function isDeclaredBodyTooLarge(request: Request): boolean {
  if (!BODY_BEARING_METHODS.has(request.method)) return false;
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;
  const size = Number(contentLength);
  if (!Number.isFinite(size)) return false;
  const limit = isMultipartFormData(request) ? MULTIPART_BODY_MAX_BYTES : MAX_REQUEST_BODY_BYTES;
  return size > limit;
}
