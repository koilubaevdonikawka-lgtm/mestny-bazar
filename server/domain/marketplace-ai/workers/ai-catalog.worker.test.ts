import { describe, expect, it, vi } from "vitest";
import { AICatalogWorker } from "@server/domain/marketplace-ai/workers/ai-catalog.worker";
import type {
  CatalogAnalysisResult,
  ICatalogQualityAnalyzer,
} from "@server/ports/marketplace-ai/catalog-analysis.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { AIJob } from "@server/ports/marketplace-ai.port";
import type { SellerProductDTO } from "@shared/contracts/seller-product";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

function fakeAnalysis(overrides: Partial<CatalogAnalysisResult> = {}): CatalogAnalysisResult {
  return {
    productId: null,
    catalogScore: 80,
    nameAnalysis: { value: "", wordCount: 0, issues: [] },
    descriptionAnalysis: { value: null, wordCount: 0, issues: [] },
    checks: {
      name: { passed: true, issues: [] },
      description: { passed: true, issues: [] },
      requiredFields: { passed: true, missing: [], completenessPercent: 100 },
      photos: { passed: true, hasPhoto: true },
      category: { passed: true, assigned: true, matchesSuggestion: true },
    },
    recommendations: {
      suggestedCategory: null,
      suggestedSubcategory: null,
      suggestedTags: [],
      suggestedCharacteristics: {},
    },
    ...overrides,
  };
}

function fakeAnalyzer(): ICatalogQualityAnalyzer {
  return { analyze: vi.fn((input) => fakeAnalysis({ productId: input.productId })) };
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
    imageUrl: null,
    stock: 10,
    publicationStatus: ProductPublicationStatus.PUBLISHED,
    categoryId: null,
    ...overrides,
  };
}

describe("AICatalogWorker", () => {
  describe("canHandle", () => {
    it("handles product.published and product.catalog.analysis.requested", () => {
      const worker = new AICatalogWorker(fakeAnalyzer(), fakeEventBus());
      expect(worker.canHandle({ type: "product.published", product: fakeProduct() })).toBe(true);
      expect(
        worker.canHandle({
          type: "product.catalog.analysis.requested",
          productId: "p1",
          product: { name: "x" },
        }),
      ).toBe(true);
    });

    it("rejects unrelated event types", () => {
      const worker = new AICatalogWorker(fakeAnalyzer(), fakeEventBus());
      expect(
        worker.canHandle({
          type: "product.media.analysis.requested",
          productId: "p1",
          photos: [],
        }),
      ).toBe(false);
    });
  });

  describe("process", () => {
    it("analyzes the requested product directly for an analysis-requested event", async () => {
      const analyzer = fakeAnalyzer();
      const events = fakeEventBus();
      const worker = new AICatalogWorker(analyzer, events);

      const result = await worker.process(
        fakeJob({
          type: "product.catalog.analysis.requested",
          productId: "prod-42",
          product: { name: "Widget" },
        }),
      );

      expect(analyzer.analyze).toHaveBeenCalledWith({
        productId: "prod-42",
        product: { name: "Widget" },
      });
      expect(result.status).toBe("completed");
      expect(events.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: "catalog.analysis.completed", productId: "prod-42" }),
      );
    });

    it("analyzes the published product", async () => {
      const analyzer = fakeAnalyzer();
      const events = fakeEventBus();
      const worker = new AICatalogWorker(analyzer, events);

      const result = await worker.process(
        fakeJob({
          type: "product.published",
          product: fakeProduct({ id: "prod-1", name: "Apples", price: 150, currency: "KGS" }),
        }),
      );

      expect(analyzer.analyze).toHaveBeenCalledWith({
        productId: "prod-1",
        product: { name: "Apples", imageUrl: null, price: 150, currency: "KGS" },
      });
      expect(result.status).toBe("completed");
      expect(events.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: "catalog.analysis.completed", productId: "prod-1" }),
      );
    });

    it("returns a skipped result for an unrelated event type it was never asked to handle", async () => {
      const analyzer = fakeAnalyzer();
      const worker = new AICatalogWorker(analyzer, fakeEventBus());

      const result = await worker.process(
        fakeJob({ type: "product.media.analysis.requested", productId: "p1", photos: [] }),
      );

      expect(result.status).toBe("skipped");
    });
  });
});
