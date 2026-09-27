/**
 * Задача №239 — client-side compression, entirely via the Canvas API (no
 * new dependency: `createImageBitmap` + `<canvas>.toBlob()` cover exactly
 * what a compression library would do — decode, downscale, re-encode —
 * and are supported in every engine this app already targets, including
 * Capacitor's Android/iOS WebView). MEDIA_UPLOAD_MAX_BYTES (5 MB,
 * shared/contracts/media-upload.ts) stays the server's real limit.
 *
 * Originally this only kicked in above 4 MB, purely to fit that limit — so
 * a 2–4 MB camera photo was stored and served to every shopper as-is
 * (measured on the live storefront: category images of 2.5–5 MB shown in
 * ~180px tiles). Now every upload is capped to a web-appropriate size: the
 * stored file IS what customers download (public Supabase URL, no resizer
 * in between), so this is the only place it can be made small.
 */

/** Longer-side cap in pixels — enough for the product page's full-width
 * photo on a phone at DPR 2–3, far more than any card/tile needs. */
export const MAX_DIMENSION_PX = 1200;

/** Encoder quality for the re-encode — visually indistinguishable from the
 * original for product photos, a fraction of the bytes. */
const QUALITY = 0.8;

/** Fallback steps if (unusually) the first encode is still over target. */
const FALLBACK_QUALITY_STEPS = [0.65, 0.5];

/** Files already within MAX_DIMENSION_PX and at/under this are left as-is —
 * re-encoding an already web-sized image only costs quality. */
const ALREADY_OPTIMIZED_MAX_BYTES = 300 * 1024;

/** Hard ceiling for a compressed result — a margin under the real 5 MB
 * server limit (MEDIA_UPLOAD_MAX_BYTES), not flush against it. */
const TARGET_MAX_BYTES = 4.5 * 1024 * 1024;

export class ImageCompressionError extends Error {}

/**
 * Standard-camera EXIF-orientation fallback for product photos uploaded
 * with the AI-processing toggle OFF (MultiImageUploadField's "Без обработки
 * ИИ" mode) — that mode intentionally never touches the photo via Gemini,
 * so it gets only this simpler, purely mechanical correction instead of
 * content-aware rotation. `sharp` (used elsewhere in this repo only for the
 * one-off scripts/generate-pwa-icons.mjs build step) is a native addon and
 * cannot run in the Cloudflare Workers production runtime (nitro's
 * `cloudflare-module` preset — no Node native bindings), so this can't be
 * done server-side the way that script does it. `createImageBitmap`'s
 * `imageOrientation: "from-image"` is the standards-compliant browser
 * equivalent — it reads the same EXIF orientation tag a camera writes and
 * decodes the bitmap already rotated/flipped to upright, which a canvas
 * redraw then bakes into plain pixels (the re-encoded output carries no
 * orientation tag to lose). This is explicitly passed rather than relied on
 * as an implicit default, since older WebView builds (Capacitor's Android
 * System WebView) may not default to it. Only covers the standard 8 EXIF
 * orientation values a camera can write — it has no idea what's actually
 * printed on the product, so a photo with no EXIF tag (e.g. already
 * re-saved by another tool) or one that's sideways for a reason other than
 * camera rotation passes through unchanged. That gap is exactly what the
 * AI-processing branch above covers instead.
 */
export async function normalizeExifOrientation(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);

    const blob = await canvasToBlob(canvas, 0.92);
    if (!blob) return file;
    return new File([blob], toJpegFileName(file.name), { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

export interface CompressionPlan {
  /** false → upload the original file untouched. */
  reencode: boolean;
  width: number;
  height: number;
}

/**
 * Pure sizing decision (no Canvas — unit-testable in Node): scale the longer
 * side down to MAX_DIMENSION_PX, never up, and skip the re-encode entirely
 * for an image that's already both small in pixels and in bytes.
 */
export function planCompression(width: number, height: number, bytes: number): CompressionPlan {
  const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(width, height));
  const alreadyOptimized = scale === 1 && bytes <= ALREADY_OPTIMIZED_MAX_BYTES;
  return {
    reencode: !alreadyOptimized,
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function toJpegFileName(originalName: string): string {
  return withExtension(originalName, "jpg");
}

function withExtension(originalName: string, ext: string): string {
  const base = originalName.replace(/\.[^./\\]+$/, "");
  return `${base || "photo"}.${ext}`;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

/**
 * Downscales `file` to at most MAX_DIMENSION_PX on its longer side and
 * re-encodes it at QUALITY — WebP where the engine can encode it (smaller
 * than JPEG, and keeps a PNG's transparency), otherwise JPEG drawn over a
 * white background (JPEG has no alpha; transparent pixels would turn
 * black). An engine without WebP encoding silently hands back PNG from
 * toBlob, so the returned blob's type is checked rather than assumed.
 *
 * Runs BEFORE the upload, so for PRODUCT photos it also precedes the
 * server's AI background-removal step (Gemini gets the smaller input); that
 * step itself is untouched.
 *
 * Decode failure (a format createImageBitmap can't handle in a given
 * engine) degrades to returning the original file unchanged rather than
 * blocking the upload — the server-side size/type checks still apply.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const plan = planCompression(bitmap.width, bitmap.height, file.size);
    if (!plan.reencode) return file;

    const canvas = document.createElement("canvas");
    canvas.width = plan.width;
    canvas.height = plan.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, plan.width, plan.height);

    const webp = await canvasToWebp(canvas, QUALITY);
    let result: File | null =
      webp && webp.type === "image/webp"
        ? new File([webp], withExtension(file.name, "webp"), { type: "image/webp" })
        : null;

    if (!result || result.size > TARGET_MAX_BYTES) {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, plan.width, plan.height);
      ctx.globalCompositeOperation = "source-over";
      result = null;
      for (const quality of [QUALITY, ...FALLBACK_QUALITY_STEPS]) {
        const jpeg = await canvasToBlob(canvas, quality);
        if (jpeg && jpeg.size <= TARGET_MAX_BYTES) {
          result = new File([jpeg], toJpegFileName(file.name), { type: "image/jpeg" });
          break;
        }
      }
    }

    if (!result) {
      throw new ImageCompressionError(
        "Не удалось сжать фото до нужного размера, попробуйте другое изображение",
      );
    }
    // Never make a file bigger just for the sake of re-encoding it (only
    // possible when no downscale was needed).
    const downscaled = plan.width !== bitmap.width || plan.height !== bitmap.height;
    return !downscaled && result.size >= file.size ? file : result;
  } finally {
    bitmap.close();
  }
}
