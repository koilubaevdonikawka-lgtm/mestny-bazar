/**
 * Задача №261 — client-side HEIC/HEIF → JPEG conversion (heic2any, pure
 * JS/WASM via libheif.js — no native/server dependency, same Cloudflare
 * Workers constraint already documented in image-compression.ts, since
 * this also has to run in the browser rather than on the server). iPhone
 * cameras default to HEIC; Chrome (desktop and Android) cannot decode it
 * at all, so without this step a HEIC file never reaches
 * compressImageForUpload/normalizeExifOrientation — it's rejected by the
 * MEDIA_UPLOAD_ALLOWED_MIME_TYPES check before either ever runs.
 *
 * Loaded via dynamic import — heic2any bundles libheif's WASM decoder
 * (several hundred KB), so it should never ship in the base bundle for
 * the common non-HEIC upload path.
 */
const HEIC_MIME_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

/** Extension-only browsers/OSes (notably Windows/Chrome for an
 * unregistered .heic association) report `file.type` as `""` for a HEIC
 * file — the accept attribute still lets it through via extension
 * matching, so detection here has to fall back to the filename too. */
export function isHeicFile(file: File): boolean {
  if (HEIC_MIME_TYPES.has(file.type.toLowerCase())) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

export class HeicConversionError extends Error {}

/**
 * heic2any's own docs confirm it copies no metadata at all from the
 * source file — whatever orientation the decoded pixels come out in
 * (however libheif.js resolves the HEIF container's own rotation
 * property internally) is final; there is no EXIF tag left afterward for
 * normalizeExifOrientation() to read. Callers on the "без обработки ИИ"
 * path should still run normalizeExifOrientation() after this — it's a
 * harmless no-op if there's truly nothing left to correct, and still
 * fixes things if a future heic2any version changes that behavior.
 *
 * Known limitation, confirmed against real iPhone HEIC photos (Задача
 * №261 diagnostics): the bundled libheif.js applies the HEIF container's
 * own rotation property (irot) correctly for a 90°/270° correction (it's
 * entangled with tile-grid reconstruction, so it can't skip it), but NOT
 * for a plain 180° one — verified with two independent decoders (this
 * library and heic-to/libheif 1.22.2), both reproduced the same gap, and
 * heic2any's source has no rotation logic of its own to patch (no config
 * option either). A HEIC shot with the phone rotated a half-turn from
 * upright will still convert successfully but can come out ~90° off. No
 * fix shipped for this — same accepted-limitation category as the
 * AI-background path's rotation gap (see google-ai-image.adapter.ts):
 * revisit only with a lower-level libheif-js integration (bypassing this
 * wrapper to force an untransformed decode + our own EXIF-driven
 * rotation), a deliberately bigger change than this task's scope.
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  let heic2any: (options: {
    blob: Blob;
    toType?: string;
    quality?: number;
  }) => Promise<Blob | Blob[]>;
  try {
    heic2any = (await import("heic2any")).default;
  } catch {
    throw new HeicConversionError(
      "Не удалось загрузить конвертер HEIC-изображений, попробуйте другой файл",
    );
  }

  let result: Blob | Blob[];
  try {
    result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  } catch {
    throw new HeicConversionError(
      "Не удалось преобразовать HEIC-изображение, попробуйте другой файл",
    );
  }

  const blob = Array.isArray(result) ? result[0] : result;
  const base = file.name.replace(/\.[^./\\]+$/, "");
  return new File([blob], `${base || "photo"}.jpg`, { type: "image/jpeg" });
}
