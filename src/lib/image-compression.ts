/**
 * Задача №239 — client-side compression, entirely via the Canvas API (no
 * new dependency: `createImageBitmap` + `<canvas>.toBlob()` cover exactly
 * what a compression library would do — decode, downscale, re-encode —
 * and are supported in every engine this app already targets, including
 * Capacitor's Android/iOS WebView). Keeps MEDIA_UPLOAD_MAX_BYTES (5 MB,
 * shared/contracts/media-upload.ts) as the server's real, untouched limit;
 * this only makes it rare for a real phone photo to ever hit that limit.
 */

/** Files at or under this are sent as-is — compressing an already-small
 * file just burns time/quality for nothing. Comfortably under the 5 MB
 * server limit on its own. */
const SKIP_COMPRESSION_AT_OR_BELOW_BYTES = 4 * 1024 * 1024;

/** Target ceiling for a compressed result — a margin under the real 5 MB
 * server limit (MEDIA_UPLOAD_MAX_BYTES), not flush against it. */
const TARGET_MAX_BYTES = 4.5 * 1024 * 1024;

/** Longer-side cap in pixels — plenty for a product/category/banner photo;
 * tried first, then once more at a smaller size only if still over target. */
const DIMENSION_TIERS_PX = [1600, 1200];

/** Re-encoded as JPEG (see toJpegFile below); tried largest-quality-first
 * so the result stays as close to the original as the size budget allows. */
const JPEG_QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];

export class ImageCompressionError extends Error {}

function toJpegFileName(originalName: string): string {
  const base = originalName.replace(/\.[^./\\]+$/, "");
  return `${base || "photo"}.jpg`;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Resizes/re-encodes `file` down toward TARGET_MAX_BYTES if (and only if)
 * it's already above SKIP_COMPRESSION_AT_OR_BELOW_BYTES. Always re-encodes
 * to JPEG (source PNG/WebP/AVIF included) — JPEG is what actually shrinks a
 * real photo; a lossless format re-encoded losslessly wouldn't help.
 *
 * Decode failure (e.g. a format createImageBitmap can't handle in a given
 * engine) degrades to returning the original file unchanged rather than
 * blocking the upload — the existing server-side size/type checks still
 * apply either way, so this is never a silent bypass, just a best-effort
 * optimization that can decline to run.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (file.size <= SKIP_COMPRESSION_AT_OR_BELOW_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    for (const maxDimensionPx of DIMENSION_TIERS_PX) {
      const scale = Math.min(1, maxDimensionPx / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of JPEG_QUALITY_STEPS) {
        const blob = await canvasToBlob(canvas, quality);
        if (blob && blob.size <= TARGET_MAX_BYTES) {
          return new File([blob], toJpegFileName(file.name), { type: "image/jpeg" });
        }
      }
    }

    throw new ImageCompressionError(
      "Не удалось сжать фото до нужного размера, попробуйте другое изображение",
    );
  } finally {
    bitmap.close();
  }
}
