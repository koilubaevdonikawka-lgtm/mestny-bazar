import { describe, expect, it, vi } from "vitest";
import { AICatalogWorker } from "@server/domain/marketplace-ai/workers/ai-catalog.worker";
import type {
  CatalogAnalysisResult,
  ICatalogQualityAnalyzer,
} from "@server/ports/marketplace-ai/catalog-analysis.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { AIJob } from "@server/ports/marketplace-ai.port";
import type { OrderDTO, OrderItemDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

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

function orderItem(overrides: Partial<OrderItemDTO> = {}): OrderItemDTO {
  return {
    id: "item-1",
    productId: "prod-1",
    productName: "Apples",
    productImageUrl: null,
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
    discountAmount: 0,
    couponCode: null,
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
    assignedCourierId: null,
  };
}

describe("AICatalogWorker", () => {
  describe("canHandle", () => {
    it("handles order.created and product.catalog.analysis.requested", () => {
      const worker = new AICatalogWorker(fakeAnalyzer(), fakeEventBus());
      expect(worker.canHandle({ type: "order.created", order: fakeOrder([]) })).toBe(true);
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

    it("analyzes only the first product from an order and skips duplicate line items", async () => {
      const analyzer = fakeAnalyzer();
      const worker = new AICatalogWorker(analyzer, fakeEventBus());

      await worker.process(
        fakeJob({
          type: "order.created",
          order: fakeOrder([
            orderItem({ productId: "prod-1", productName: "Apples" }),
            orderItem({ productId: "prod-1", productName: "Apples" }),
            orderItem({ productId: "prod-2", productName: "Bananas" }),
          ]),
        }),
      );

      expect(analyzer.analyze).toHaveBeenCalledTimes(1);
      expect(analyzer.analyze).toHaveBeenCalledWith(
        expect.objectContaining({ productId: "prod-1" }),
      );
    });

    it("falls back to deduping by product name when productId is null", async () => {
      const analyzer = fakeAnalyzer();
      const worker = new AICatalogWorker(analyzer, fakeEventBus());

      await worker.process(
        fakeJob({
          type: "order.created",
          order: fakeOrder([
            orderItem({ productId: null, productName: "Apples" }),
            orderItem({ productId: null, productName: "Apples" }),
          ]),
        }),
      );

      expect(analyzer.analyze).toHaveBeenCalledTimes(1);
    });

    it("returns a skipped result and analyzes nothing when the order has no items", async () => {
      const analyzer = fakeAnalyzer();
      const events = fakeEventBus();
      const worker = new AICatalogWorker(analyzer, events);

      const result = await worker.process(fakeJob({ type: "order.created", order: fakeOrder([]) }));

      expect(result.status).toBe("skipped");
      expect(analyzer.analyze).toHaveBeenCalledWith({ productId: null, product: { name: "" } });
      expect(events.publish).toHaveBeenCalledWith(
        expect.objectContaining({ type: "catalog.analysis.completed", productId: null }),
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
