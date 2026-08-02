import { describe, expect, it, vi } from "vitest";
import { AIMediaWorker } from "@server/domain/marketplace-ai/workers/ai-media.worker";
import type {
  IMediaMetadataService,
  IMediaQualityAnalyzer,
  MediaAnalysisResult,
  MediaAssetInput,
  ResolvedMediaAsset,
} from "@server/ports/marketplace-ai/media-analysis.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { AIJob } from "@server/ports/marketplace-ai.port";
import type { SellerProductDTO } from "@shared/contracts/seller-product";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

function fakeAnalysisResult(overrides: Partial<MediaAnalysisResult> = {}): MediaAnalysisResult {
  return {
    productId: null,
    photoCount: 0,
    minPhotos: 1,
    maxPhotos: 10,
    photos: [],
    duplicateGroups: [],
    mediaScore: 100,
    checks: {
      photoCount: { passed: true, actual: 0, min: 1, max: 10 },
      resolution: { passed: true, violations: 0 },
      fileSize: { passed: true, violations: 0 },
      aspectRatio: { passed: true, violations: 0 },
      duplicates: { passed: true, duplicateCount: 0 },
    },
    ...overrides,
  };
}

function fakeMetadataService(): IMediaMetadataService {
  return {
    resolveAssets: vi.fn(async (inputs: MediaAssetInput[]) =>
      inputs.map((input): ResolvedMediaAsset => ({
        id: input.id,
        url: input.url,
        hash: input.hash ?? input.id,
        width: input.width ?? null,
        height: input.height ?? null,
        fileSizeBytes: input.fileSizeBytes ?? null,
        aspectRatio: null,
      })),
    ),
  };
}

function fakeAnalyzer(): IMediaQualityAnalyzer {
  return { analyze: vi.fn((input) => fakeAnalysisResult({ productId: input.productId })) };
}

function fakeEventBus(): IMarketplaceEventBus {
  return { publish: vi.fn(async () => {}), subscribe: vi.fn() };
}

function fakeJob(event: MarketplaceEvent): AIJob {
  return { id: "job-1", event, createdAt: new Date().toISOString() };
}

function fakeProduct(overrides: Partial<SellerProductDTO> = {}): SellerProductDTO {
  return {
    id: "prod-1",
    name: "Apples",
    slug: "apples",
    description: null,
    price: 100,
    currency: "KGS",
    unit: null,
    imageUrl: "https://example.com/apples.jpg",
    stock: 10,
    publicationStatus: ProductPublicationStatus.PUBLISHED,
    categoryId: null,
    ...overrides,
  };
}

describe("AIMediaWorker", () => {
  describe("canHandle", () => {
    it("handles product.published and product.media.analysis.requested", () => {
      const worker = new AIMediaWorker(fakeMetadataService(), fakeAnalyzer(), fakeEventBus());
      expect(worker.canHandle({ type: "product.published", product: fakeProduct() })).toBe(true);
      expect(
        worker.canHandle({ type: "product.media.analysis.requested", productId: "p1", photos: [] }),
      ).toBe(true);
    });

    it("rejects unrelated event types", () => {
      const worker = new AIMediaWorker(fakeMetadataService(), fakeAnalyzer(), fakeEventBus());
      expect(
        worker.canHandle({
          type: "product.catalog.analysis.requested",
          productId: "p1",
          product: { name: "x" },
        }),
      ).toBe(false);
    });
  });

  describe("process", () => {
    it("resolves and analyzes the requested photos directly for an analysis-requested event", async () => {
      const metadata = fakeMetadataService();
      const analyzer = fakeAnalyzer();
      const events = fakeEventBus();
      const worker = new AIMediaWorker(metadata, analyzer, events);

      const result = await worker.process(
        fakeJob({
          type: "product.media.analysis.requested",
          productId: "prod-42",
          photos: [{ id: "photo-1", url: "https://example.com/1.jpg" }],
        }),
      );

      expect(metadata.resolveAssets).toHaveBeenCalledWith([
        { id: "photo-1", url: "https://example.com/1.jpg" },
      ]);
      expect(analyzer.analyze).toHaveBeenCalledWith(
        expect.objectContaining({ productId: "prod-42" }),
      );
      expect(result.status).toBe("completed");
      expect(events.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: "photo.analysis.completed", productId: "prod-42" }),
      );
    });

    it("extracts the published product's single image, using productId as the photo id", async () => {
      const metadata = fakeMetadataService();
      const worker = new AIMediaWorker(metadata, fakeAnalyzer(), fakeEventBus());

      await worker.process(
        fakeJob({
          type: "product.published",
          product: fakeProduct({ id: "prod-1", imageUrl: "https://example.com/a.jpg" }),
        }),
      );

      expect(metadata.resolveAssets).toHaveBeenCalledWith([
        { id: "prod-1", url: "https://example.com/a.jpg" },
      ]);
    });

    it("skips a published product with no image, ending in the no-photos skip path", async () => {
      const metadata = fakeMetadataService();
      const worker = new AIMediaWorker(metadata, fakeAnalyzer(), fakeEventBus());

      const result = await worker.process(
        fakeJob({
          type: "product.published",
          product: fakeProduct({ imageUrl: null }),
        }),
      );

      expect(result.status).toBe("skipped");
      expect(metadata.resolveAssets).not.toHaveBeenCalled();
    });

    it("returns a skipped result without calling resolveAssets for an unrelated event type", async () => {
      const metadata = fakeMetadataService();
      const analyzer = fakeAnalyzer();
      const worker = new AIMediaWorker(metadata, analyzer, fakeEventBus());

      const result = await worker.process(
        fakeJob({
          type: "product.catalog.analysis.requested",
          productId: "p1",
          product: { name: "x" },
        }),
      );

      expect(result.status).toBe("skipped");
      expect(metadata.resolveAssets).not.toHaveBeenCalled();
      expect(analyzer.analyze).toHaveBeenCalledWith({ productId: null, assets: [] });
    });
  });
});
