import { describe, expect, it } from "vitest";
import { MAX_DIMENSION_PX, compressImageForUpload, planCompression } from "./image-compression";

// Node has no Canvas/createImageBitmap implementation, so the pure sizing
// decision (planCompression) and the decode-failure passthrough are covered
// here; the actual Canvas resize/re-encode path is verified in a real browser.
describe("planCompression", () => {
  it("caps the longer side at MAX_DIMENSION_PX, keeping the aspect ratio", () => {
    expect(planCompression(3000, 4000, 3 * 1024 * 1024)).toEqual({
      reencode: true,
      width: 900,
      height: MAX_DIMENSION_PX,
    });
    expect(planCompression(4032, 3024, 2 * 1024 * 1024)).toEqual({
      reencode: true,
      width: MAX_DIMENSION_PX,
      height: 900,
    });
  });

  it("re-encodes a within-size but heavy file without upscaling it", () => {
    expect(planCompression(864, 1184, 2.5 * 1024 * 1024)).toEqual({
      reencode: true,
      width: 864,
      height: 1184,
    });
  });

  it("leaves an already web-sized image alone", () => {
    expect(planCompression(800, 600, 120 * 1024).reencode).toBe(false);
  });
});

describe("compressImageForUpload", () => {
  it("returns the original file when the image can't be decoded", async () => {
    const file = new File([new Uint8Array(1024)], "photo.jpg", { type: "image/jpeg" });

    expect(await compressImageForUpload(file)).toBe(file);
  });
});
