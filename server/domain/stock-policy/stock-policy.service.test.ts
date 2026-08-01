import { describe, expect, it } from "vitest";
import { StockPolicyService } from "@server/domain/stock-policy/stock-policy.service";
import { StockPolicyDeniedError } from "@server/domain/stock-policy/stock-policy.errors";
import { LowStockThresholdRule } from "@server/domain/stock-policy/rules/low-stock-threshold.rule";
import type { StockPolicyContext } from "@server/ports/stock-policy.port";

function ctx(overrides: Partial<StockPolicyContext> = {}): StockPolicyContext {
  return { productId: "p1", categoryId: null, stock: 10, threshold: null, ...overrides };
}

describe("StockPolicyService with LowStockThresholdRule", () => {
  const service = new StockPolicyService([new LowStockThresholdRule()]);

  it("allows stock above the default threshold", () => {
    const result = service.evaluateStock(ctx({ stock: 10 }));
    expect(result).toMatchObject({ allowed: true, effectiveThreshold: 5 });
  });

  it("flags LOW_STOCK at or below the default threshold", () => {
    expect(service.evaluateStock(ctx({ stock: 5 }))).toMatchObject({
      allowed: false,
      denialCode: "LOW_STOCK",
    });
    expect(service.evaluateStock(ctx({ stock: 1 }))).toMatchObject({
      allowed: false,
      denialCode: "LOW_STOCK",
    });
  });

  it("flags DEPLETED at zero stock", () => {
    expect(service.evaluateStock(ctx({ stock: 0 }))).toMatchObject({
      allowed: false,
      denialCode: "DEPLETED",
    });
  });

  it("uses a per-product threshold override instead of the default", () => {
    expect(service.evaluateStock(ctx({ stock: 8, threshold: 10 }))).toMatchObject({
      allowed: false,
      denialCode: "LOW_STOCK",
      effectiveThreshold: 10,
    });
    expect(service.evaluateStock(ctx({ stock: 8, threshold: 2 }))).toMatchObject({
      allowed: true,
      effectiveThreshold: 2,
    });
  });

  describe("assertStockOk", () => {
    it("does not throw when stock is healthy", () => {
      expect(() => service.assertStockOk(ctx({ stock: 100 }))).not.toThrow();
    });

    it("throws StockPolicyDeniedError with the denial code when not healthy", () => {
      try {
        service.assertStockOk(ctx({ stock: 0 }));
        expect.unreachable();
      } catch (e) {
        expect(e).toBeInstanceOf(StockPolicyDeniedError);
        expect((e as StockPolicyDeniedError).code).toBe("DEPLETED");
      }
    });
  });
});
