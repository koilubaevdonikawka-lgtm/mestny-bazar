import { describe, expect, it } from "vitest";
import { compressImageForUpload } from "./image-compression";

// Node has no Canvas/createImageBitmap implementation, so only the
// size-based skip branch (runs before any Canvas call) is covered here —
// see vitest.config.ts's comment and Задача №239's report for how the
// actual resize/re-encode path was verified instead (a real browser).
describe("compressImageForUpload — skip branch (Задача №239)", () => {
  it("returns the same File unchanged when already at or under the skip threshold", async () => {
    const file = new File([new Uint8Array(1024)], "small.jpg", { type: "image/jpeg" });

    const result = await compressImageForUpload(file);

    expect(result).toBe(file);
  });

  it("returns a 4 MB file unchanged (still at/under the 4 MB skip threshold)", async () => {
    const file = new File([new Uint8Array(4 * 1024 * 1024)], "four-mb.jpg", {
      type: "image/jpeg",
    });

    const result = await compressImageForUpload(file);

    expect(result).toBe(file);
  });
});
