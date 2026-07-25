import { describe, expect, it } from "vitest";
import { ProductPublicationService } from "@server/domain/product-publication/product-publication.service";
import { ProductPublicationDeniedError } from "@server/domain/product-publication/product-publication.errors";
import type {
  ProductPublicationContext,
  ProductPublicationResult,
} from "@server/ports/product-publication.port";
import type { ProductPublicationRule } from "@server/domain/product-publication/product-publication.rule";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

function fakeRule(
  partial: Partial<ProductPublicationRule> & { order: number },
): ProductPublicationRule {
  return {
    applies: () => true,
    evaluate: (): ProductPublicationResult => ({ allowed: true }),
    ...partial,
  };
}

function baseContext(
  overrides: Partial<ProductPublicationContext> = {},
): ProductPublicationContext {
  return {
    productId: "product-1",
    currentStatus: ProductPublicationStatus.DRAFT,
    targetStatus: ProductPublicationStatus.PUBLISHED,
    actor: { id: "seller-1" },
    ...overrides,
  };
}

describe("ProductPublicationService (rule engine)", () => {
  it("evaluates rules in ascending order", () => {
    const calls: number[] = [];
    const service = new ProductPublicationService([
      fakeRule({
        order: 30,
        applies: () => {
          calls.push(30);
          return false;
        },
      }),
      fakeRule({
        order: 10,
        applies: () => {
          calls.push(10);
          return false;
        },
      }),
    ]);

    service.canTransition(baseContext());
    expect(calls).toEqual([10, 30]);
  });

  it("denies with NO_MATCHING_RULE when no rule applies", () => {
    const service = new ProductPublicationService([fakeRule({ order: 10, applies: () => false })]);
    const result = service.canTransition(baseContext());

    expect(result).toMatchObject({ allowed: false, denialCode: "NO_MATCHING_RULE" });
  });

  it("stops at the first matching rule's denial", () => {
    const service = new ProductPublicationService([
      fakeRule({ order: 10, evaluate: () => ({ allowed: false, denialCode: "DENIED" }) }),
      fakeRule({ order: 20, applies: () => true, evaluate: () => ({ allowed: true }) }),
    ]);

    const result = service.canTransition(baseContext());
    expect(result).toMatchObject({ allowed: false, denialCode: "DENIED" });
  });

  it("assertCanTransition throws ProductPublicationDeniedError on denial", () => {
    const service = new ProductPublicationService([
      fakeRule({
        order: 10,
        evaluate: () => ({ allowed: false, denialCode: "NOPE", message: "no" }),
      }),
    ]);

    expect(() => service.assertCanTransition(baseContext())).toThrow(ProductPublicationDeniedError);
  });

  it("assertCanTransition does not throw when allowed", () => {
    const service = new ProductPublicationService([
      fakeRule({ order: 10, evaluate: () => ({ allowed: true }) }),
    ]);

    expect(() => service.assertCanTransition(baseContext())).not.toThrow();
  });
});
