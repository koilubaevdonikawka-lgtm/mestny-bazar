import { describe, expect, it } from "vitest";
import { MediaQualityAnalyzerService } from "@server/domain/marketplace-ai/media/media-quality-analyzer.service";
import type { ResolvedMediaAsset } from "@server/ports/marketplace-ai/media-analysis.port";

function fakeAsset(overrides: Partial<ResolvedMediaAsset> = {}): ResolvedMediaAsset {
  return {
    id: "asset-1",
    url: "https://example.com/photo.jpg",
    hash: "hash-1",
    width: 1200,
    height: 1200,
    fileSizeBytes: 1024 * 1024,
    aspectRatio: 1,
    ...overrides,
  };
}

const analyzer = new MediaQualityAnalyzerService();

describe("MediaQualityAnalyzerService", () => {
  describe("per-photo checks", () => {
    it("flags unknown resolution when width or height is missing", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ width: null })],
      });
      expect(result.photos[0]?.issues).toContain("resolution:unknown");
    });

    it("flags resolution below the minimum", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ width: 100, height: 100 })],
      });
      expect(result.photos[0]?.issues).toContain("resolution:below-minimum(100x100)");
    });

    it("flags unknown file size when missing", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ fileSizeBytes: null })],
      });
      expect(result.photos[0]?.issues).toContain("file-size:unknown");
    });

    it("flags file size above the maximum", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ fileSizeBytes: 6 * 1024 * 1024 })],
      });
      expect(result.photos[0]?.issues).toContain(`file-size:above-maximum(${6 * 1024 * 1024})`);
    });

    it("flags unknown aspect ratio when missing", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ aspectRatio: null })],
      });
      expect(result.photos[0]?.issues).toContain("aspect-ratio:unknown");
    });

    it("flags aspect ratio outside the allowed range", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ aspectRatio: 2 })],
      });
      expect(result.photos[0]?.issues).toContain("aspect-ratio:out-of-range(2)");
    });

    it("passes a photo with no issues at all", () => {
      const result = analyzer.analyze({ productId: "p1", assets: [fakeAsset()] });
      expect(result.photos[0]?.issues).toEqual([]);
    });
  });

  describe("photo count", () => {
    it("fails when below the minimum", () => {
      const result = analyzer.analyze({ productId: "p1", assets: [] });
      expect(result.checks.photoCount.passed).toBe(false);
      expect(result.checks.photoCount.actual).toBe(0);
    });

    it("fails when above the maximum", () => {
      const assets = Array.from({ length: 11 }, (_, i) =>
        fakeAsset({ id: `asset-${i}`, hash: `hash-${i}` }),
      );
      const result = analyzer.analyze({ productId: "p1", assets });
      expect(result.checks.photoCount.passed).toBe(false);
    });

    it("passes within [min, max] and honors overridden rules", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset()],
        rules: { minPhotos: 1, maxPhotos: 1 },
      });
      expect(result.checks.photoCount.passed).toBe(true);
      expect(result.minPhotos).toBe(1);
      expect(result.maxPhotos).toBe(1);
    });
  });

  describe("duplicate detection", () => {
    it("groups assets sharing the same hash", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [
          fakeAsset({ id: "a", hash: "same" }),
          fakeAsset({ id: "b", hash: "same" }),
          fakeAsset({ id: "c", hash: "different" }),
        ],
      });
      expect(result.duplicateGroups).toEqual([["a", "b"]]);
      expect(result.checks.duplicates.duplicateCount).toBe(1);
    });

    it("reports zero duplicates when all hashes are unique", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ id: "a", hash: "h1" }), fakeAsset({ id: "b", hash: "h2" })],
      });
      expect(result.duplicateGroups).toEqual([]);
      expect(result.checks.duplicates.passed).toBe(true);
    });

    it("counts n-1 duplicates for a group of n identical hashes", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [
          fakeAsset({ id: "a", hash: "same" }),
          fakeAsset({ id: "b", hash: "same" }),
          fakeAsset({ id: "c", hash: "same" }),
        ],
      });
      expect(result.checks.duplicates.duplicateCount).toBe(2);
    });
  });

  describe("mediaScore", () => {
    it("scores a perfect single photo at 100", () => {
      const result = analyzer.analyze({ productId: "p1", assets: [fakeAsset()] });
      expect(result.mediaScore).toBe(100);
    });

    it("deducts 30 for being below the minimum photo count", () => {
      const result = analyzer.analyze({ productId: "p1", assets: [] });
      expect(result.mediaScore).toBe(70);
    });

    it("deducts 15 per resolution violation, 10 per file-size, 10 per aspect-ratio", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [
          fakeAsset({
            id: "a",
            hash: "h1",
            width: 10,
            height: 10,
            fileSizeBytes: 999 * 1024 * 1024,
            aspectRatio: 5,
          }),
        ],
      });
      expect(result.mediaScore).toBe(100 - 15 - 10 - 10);
    });

    it("deducts 20 per duplicate", () => {
      const result = analyzer.analyze({
        productId: "p1",
        assets: [fakeAsset({ id: "a", hash: "same" }), fakeAsset({ id: "b", hash: "same" })],
      });
      expect(result.mediaScore).toBe(80);
    });

    it("never scores below 0 even with every penalty stacked", () => {
      const badAsset = fakeAsset({
        id: "a",
        hash: "same",
        width: 1,
        height: 1,
        fileSizeBytes: 999 * 1024 * 1024,
        aspectRatio: 5,
      });
      const result = analyzer.analyze({
        productId: "p1",
        assets: [
          badAsset,
          { ...badAsset, id: "b" },
          { ...badAsset, id: "c" },
          { ...badAsset, id: "d" },
        ],
      });
      expect(result.mediaScore).toBe(0);
    });
  });
});
