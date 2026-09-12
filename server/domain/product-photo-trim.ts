import { PhotonImage, crop } from "@cf-wasm/photon";
import { logger } from "@shared/observability/logger";

/**
 * Задача №271 — real failure diagnosed on a bot-created product
 * ("Олейна 5л"): the saved file itself (not any CSS) had the product
 * occupying only ~7.6% of the canvas (measured: 704×1472 canvas, actual
 * content 185×423) — Gemini's removeBackground (google-ai-image.adapter.ts)
 * returns a canvas sized however it decides, and evidently doesn't always
 * frame the product close to the edges the way a normal form-uploaded
 * photo does. This trims the result back down to the actual content plus
 * a small margin, purely geometrically (crop — no resampling), so it
 * can't hit the color-corruption bug already found and rejected for this
 * same library's rotate() (see google-ai-image.adapter.ts's own comment).
 *
 * "Content" = any pixel that isn't close to pure white. Gemini's prompt
 * explicitly asks for a solid #FFFFFF background, but real output isn't
 * pixel-perfect — a corner pixel measured at (247,247,241) on the real
 * "Олейна 5л" file (ordinary PNG re-encoding noise) is well within normal
 * tolerance and must NOT be treated as content, or the whole canvas edge
 * gets pulled into the bounding box. BACKGROUND_MIN_CHANNEL=230 (matches
 * a manual cross-check against sharp's own trim({threshold:15}) on the
 * same real file — both agree on the same content bounding box).
 */
const BACKGROUND_MIN_CHANNEL = 230;
/** Padding re-added around the detected content, as a fraction of its larger dimension — a bare crop-to-content would leave the product touching the frame edge. */
const PADDING_RATIO = 0.06;
/** Skip re-encoding entirely when content already fills the canvas (a normal, already-well-framed photo) — avoids a pointless decode/crop/encode round trip and any tiny quality loss from re-compression. */
const SKIP_IF_CONTENT_FILLS_CANVAS = 0.97;

export interface TrimmedPhoto {
  data: Buffer;
  mimeType: string;
}

/**
 * Best-effort — any failure here (unexpected format, WASM error, an
 * all-background image with nothing to bound) returns the input
 * unchanged rather than blocking the upload. The background-removed
 * photo is already valid on its own; this is a cosmetic improvement,
 * never a required step.
 */
export function trimProductPhotoBackground(imageData: Buffer, mimeType: string): TrimmedPhoto {
  try {
    const img = PhotonImage.new_from_byteslice(new Uint8Array(imageData));
    const width = img.get_width();
    const height = img.get_height();
    const pixels = img.get_raw_pixels();

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        if (
          r < BACKGROUND_MIN_CHANNEL ||
          g < BACKGROUND_MIN_CHANNEL ||
          b < BACKGROUND_MIN_CHANNEL
        ) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0) {
      // Nothing but background — no sensible bounding box to crop to.
      return { data: imageData, mimeType };
    }

    const contentWidth = maxX - minX + 1;
    const contentHeight = maxY - minY + 1;
    if (
      contentWidth / width > SKIP_IF_CONTENT_FILLS_CANVAS &&
      contentHeight / height > SKIP_IF_CONTENT_FILLS_CANVAS
    ) {
      return { data: imageData, mimeType };
    }

    const padding = Math.round(Math.max(contentWidth, contentHeight) * PADDING_RATIO);
    const x1 = Math.max(0, minX - padding);
    const y1 = Math.max(0, minY - padding);
    const x2 = Math.min(width, maxX + 1 + padding);
    const y2 = Math.min(height, maxY + 1 + padding);

    const cropped = crop(img, x1, y1, x2, y2);
    const isJpeg = mimeType === "image/jpeg";
    const data = Buffer.from(isJpeg ? cropped.get_bytes_jpeg(90) : cropped.get_bytes());
    return { data, mimeType: isJpeg ? "image/jpeg" : "image/png" };
  } catch (error) {
    logger.error("media-upload:photo-trim-failed", { error });
    return { data: imageData, mimeType };
  }
}
