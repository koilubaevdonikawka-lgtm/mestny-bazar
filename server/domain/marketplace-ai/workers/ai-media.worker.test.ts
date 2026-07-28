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
import { OrderStatus } from "@shared/contracts/order";
import type { OrderDTO, OrderItemDTO } from "@shared/contracts/order";

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

function orderItem(overrides: Partial<OrderItemDTO> = {}): OrderItemDTO {
  return {
    id: "item-1",
    productId: "prod-1",
    productName: "Apples",
    productImageUrl: "https://example.com/apples.jpg",
    quantity: 1,
    unitPrice: 100,
    lineTotal: 100,
    ...overrides,
  };
}

function fakeOrder(items: OrderItemDTO[]): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: OrderStatus.CREATED,
    paymentStatus: "unpaid",
    paymentMethod: "CASH",
    subtotal: 100,
    deliveryFee: 0,
    total: 100,
    currency: "KGS",
    customerName: "Buyer",
    customerPhone: "996700000000",
    addressSnapshot: "addr",
    notes: null,
    paymentUrl: null,
    items,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
}

describe("AIMediaWorker", () => {
  describe("canHandle", () => {
    it("handles order.created and product.media.analysis.requested", () => {
      const worker = new AIMediaWorker(fakeMetadataService(), fakeAnalyzer(), fakeEventBus());
      expect(worker.canHandle({ type: "order.created", order: fakeOrder([]) })).toBe(true);
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

    it("extracts unique photo URLs from order line items, using productId as the photo id", async () => {
      const metadata = fakeMetadataService();
      const worker = new AIMediaWorker(metadata, fakeAnalyzer(), fakeEventBus());

      await worker.process(
        fakeJob({
          type: "order.created",
          order: fakeOrder([
            orderItem({ productId: "prod-1", productImageUrl: "https://example.com/a.jpg" }),
            orderItem({ productId: "prod-1", productImageUrl: "https://example.com/a.jpg" }),
            orderItem({ productId: "prod-2", productImageUrl: "https://example.com/b.jpg" }),
          ]),
        }),
      );

      expect(metadata.resolveAssets).toHaveBeenCalledWith([
        { id: "prod-1", url: "https://example.com/a.jpg" },
        { id: "prod-2", url: "https://example.com/b.jpg" },
      ]);
    });

    it("skips line items with no product image, ending in the no-photos skip path", async () => {
      const metadata = fakeMetadataService();
      const worker = new AIMediaWorker(metadata, fakeAnalyzer(), fakeEventBus());

      const result = await worker.process(
        fakeJob({
          type: "order.created",
          order: fakeOrder([orderItem({ productImageUrl: null })]),
        }),
      );

      expect(result.status).toBe("skipped");
      expect(metadata.resolveAssets).not.toHaveBeenCalled();
    });

    it("derives a deterministic fallback id from the image URL when productId is null", async () => {
      const metadata = fakeMetadataService();
      const worker = new AIMediaWorker(metadata, fakeAnalyzer(), fakeEventBus());

      await worker.process(
        fakeJob({
          type: "order.created",
          order: fakeOrder([
            orderItem({ productId: null, productImageUrl: "https://example.com/a.jpg" }),
          ]),
        }),
      );

      const [photos] = (metadata.resolveAssets as ReturnType<typeof vi.fn>).mock.calls[0] as [
        Array<{ id: string; url: string }>,
      ];
      expect(photos).toHaveLength(1);
      expect(photos[0]!.id).toMatch(/^[a-f0-9]{16}$/);
      expect(photos[0]!.url).toBe("https://example.com/a.jpg");
    });

    it("returns a skipped result without calling resolveAssets when there are no photos", async () => {
      const metadata = fakeMetadataService();
      const analyzer = fakeAnalyzer();
      const worker = new AIMediaWorker(metadata, analyzer, fakeEventBus());

      const result = await worker.process(fakeJob({ type: "order.created", order: fakeOrder([]) }));

      expect(result.status).toBe("skipped");
      expect(metadata.resolveAssets).not.toHaveBeenCalled();
      expect(analyzer.analyze).toHaveBeenCalledWith({ productId: null, assets: [] });
    });
  });
});
