import { describe, expect, it } from "vitest";
import { DiscountPolicyService } from "@server/domain/discount-policy/discount-policy.service";
import { CouponValidityRule } from "@server/domain/discount-policy/rules/coupon-validity.rule";
import { CouponMinOrderRule } from "@server/domain/discount-policy/rules/coupon-min-order.rule";
import { CouponDiscountAmountRule } from "@server/domain/discount-policy/rules/coupon-discount-amount.rule";
import { DiscountPolicyDeniedError } from "@server/domain/discount-policy.errors";
import type { CouponDTO } from "@shared/contracts/coupon";

function makeCoupon(overrides: Partial<CouponDTO> = {}): CouponDTO {
  return {
    id: "coupon-1",
    code: "SAVE10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderTotal: 0,
    maxUses: null,
    usesCount: 0,
    expiresAt: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildEngine(): DiscountPolicyService {
  return new DiscountPolicyService([
    new CouponValidityRule(),
    new CouponMinOrderRule(),
    new CouponDiscountAmountRule(),
  ]);
}

describe("DiscountPolicyService", () => {
  it("denies a null coupon (unknown code) with COUPON_NOT_FOUND", () => {
    const result = buildEngine().evaluate({ coupon: null, orderSubtotal: 100 });
    expect(result).toEqual({
      allowed: false,
      denialCode: "COUPON_NOT_FOUND",
      message: expect.any(String),
      discountAmount: 0,
    });
  });

  it("denies an inactive coupon with COUPON_INACTIVE", () => {
    const result = buildEngine().evaluate({
      coupon: makeCoupon({ isActive: false }),
      orderSubtotal: 100,
    });
    expect(result.allowed).toBe(false);
    expect(result.denialCode).toBe("COUPON_INACTIVE");
  });

  it("denies an expired coupon with COUPON_EXPIRED", () => {
    const result = buildEngine().evaluate({
      coupon: makeCoupon({ expiresAt: "2020-01-01T00:00:00.000Z" }),
      orderSubtotal: 100,
    });
    expect(result.allowed).toBe(false);
    expect(result.denialCode).toBe("COUPON_EXPIRED");
  });

  it("denies a coupon that has reached its usage limit with COUPON_USES_EXCEEDED", () => {
    const result = buildEngine().evaluate({
      coupon: makeCoupon({ maxUses: 5, usesCount: 5 }),
      orderSubtotal: 100,
    });
    expect(result.allowed).toBe(false);
    expect(result.denialCode).toBe("COUPON_USES_EXCEEDED");
  });

  it("denies an order below the coupon's minimum order total with MIN_ORDER_NOT_MET", () => {
    const result = buildEngine().evaluate({
      coupon: makeCoupon({ minOrderTotal: 500 }),
      orderSubtotal: 100,
    });
    expect(result.allowed).toBe(false);
    expect(result.denialCode).toBe("MIN_ORDER_NOT_MET");
  });

  it("computes a percentage discount capped at two decimals", () => {
    const result = buildEngine().evaluate({
      coupon: makeCoupon({ discountType: "PERCENTAGE", discountValue: 15 }),
      orderSubtotal: 333.33,
    });
    expect(result.allowed).toBe(true);
    expect(result.discountAmount).toBe(50);
  });

  it("computes a fixed discount but never exceeds the order subtotal", () => {
    const result = buildEngine().evaluate({
      coupon: makeCoupon({ discountType: "FIXED", discountValue: 500 }),
      orderSubtotal: 100,
    });
    expect(result.allowed).toBe(true);
    expect(result.discountAmount).toBe(100);
  });

  it("assertAndCompute throws DiscountPolicyDeniedError for an invalid coupon", () => {
    expect(() => buildEngine().assertAndCompute({ coupon: null, orderSubtotal: 100 })).toThrow(
      DiscountPolicyDeniedError,
    );
  });

  it("assertAndCompute returns the computed result for a valid coupon", () => {
    const result = buildEngine().assertAndCompute({
      coupon: makeCoupon({ discountType: "FIXED", discountValue: 20 }),
      orderSubtotal: 100,
    });
    expect(result.discountAmount).toBe(20);
  });
});
