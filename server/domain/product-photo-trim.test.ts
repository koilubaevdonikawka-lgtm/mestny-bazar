import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { PhotonImage } from "@cf-wasm/photon";
import { trimProductPhotoBackground } from "@server/domain/product-photo-trim";

/**
 * sharp is a test-only tool here (constructing synthetic fixture PNGs) —
 * it never ships in production code, which is exactly why
 * product-photo-trim.ts uses @cf-wasm/photon instead (see that file's own
 * comment: sharp is a native addon, unusable in the Cloudflare Workers
 * runtime this app actually deploys to).
 */
async function makeCanvasWithContentRect(
  canvasWidth: number,
  canvasHeight: number,
  rect: { left: number; top: number; width: number; height: number },
): Promise<Buffer> {
  const svg = `<svg width="${canvasWidth}" height="${canvasHeight}">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <rect x="${rect.left}" y="${rect.top}" width="${rect.width}" height="${rect.height}" fill="#3388cc"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function dimensionsOf(buffer: Buffer): { width: number; height: number } {
  const img = PhotonImage.new_from_byteslice(new Uint8Array(buffer));
  return { width: img.get_width(), height: img.get_height() };
}

describe("trimProductPhotoBackground", () => {
  it("crops a small off-center content block down to content + padding, matching the real 'Олейна 5л' shape", async () => {
    // Mirrors the real diagnosed case in proportion: content occupying a
    // small fraction of a much taller canvas.
    const canvas = await makeCanvasWithContentRect(704, 1472, {
      left: 254,
      top: 514,
      width: 185,
      height: 422,
    });
    const result = trimProductPhotoBackground(canvas, "image/png");
    const { width, height } = dimensionsOf(result.data);

    // Cropped canvas must be meaningfully smaller than the original...
    expect(width).toBeLessThan(704);
    expect(height).toBeLessThan(1472);
    // ...but still comfortably bigger than the bare content (padding was added).
    expect(width).toBeGreaterThan(185);
    expect(height).toBeGreaterThan(422);
    expect(result.mimeType).toBe("image/png");
  });

  it("leaves an already tightly-framed photo unchanged (no-op)", async () => {
    const canvas = await makeCanvasWithContentRect(960, 1280, {
      left: 0,
      top: 0,
      width: 960,
      height: 1280,
    });
    const result = trimProductPhotoBackground(canvas, "image/jpeg");
    const { width, height } = dimensionsOf(result.data);

    expect(width).toBe(960);
    expect(height).toBe(1280);
    // Untouched — same bytes returned, not a re-encode.
    expect(result.data).toBe(canvas);
  });

  it("returns the original image unchanged when there is no content at all (pure background)", async () => {
    const blank = await sharp({
      create: { width: 200, height: 200, channels: 3, background: "#ffffff" },
    })
      .png()
      .toBuffer();
    const result = trimProductPhotoBackground(blank, "image/png");
    expect(result.data).toBe(blank);
  });

  it("ignores minor near-white compression noise at the edges (doesn't wrongly expand the bounding box)", async () => {
    // A canvas whose very corner pixel is (247,247,241) — real compression
    // noise measured on the actual "Олейна 5л" file — must still be
    // treated as background, not as content.
    const svg = `<svg width="500" height="500">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="0" y="0" width="2" height="2" fill="rgb(247,247,241)"/>
      <rect x="200" y="200" width="100" height="100" fill="#3388cc"/>
    </svg>`;
    const canvas = await sharp(Buffer.from(svg)).png().toBuffer();
    const result = trimProductPhotoBackground(canvas, "image/png");
    const { width, height } = dimensionsOf(result.data);

    // If the noisy corner were wrongly treated as content, the crop would
    // span almost the entire 500x500 canvas instead of tightly following
    // the real 100x100 block.
    expect(width).toBeLessThan(200);
    expect(height).toBeLessThan(200);
  });

  it("gracefully returns the original bytes if decoding fails (not a real image)", () => {
    const garbage = Buffer.from("not a real image");
    const result = trimProductPhotoBackground(garbage, "image/png");
    expect(result.data).toBe(garbage);
    expect(result.mimeType).toBe("image/png");
  });
});
