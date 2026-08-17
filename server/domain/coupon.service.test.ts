import { describe, expect, it, vi } from "vitest";
import { CouponService } from "@server/domain/coupon.service";
import { CouponValidationError } from "@server/domain/coupon.errors";
import type { ICouponRepository } from "@server/ports/coupon.repository";
import type { IDiscountPolicy, DiscountPolicyResult } from "@server/ports/discount-policy.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
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

function fakeCouponRepository(overrides: Partial<ICouponRepository> = {}): ICouponRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => makeCoupon()),
    getByCode: vi.fn(async () => null),
    create: vi.fn(async () => makeCoupon()),
    update: vi.fn(async () => makeCoupon()),
    incrementUsesCount: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeDiscountPolicy(overrides: Partial<IDiscountPolicy> = {}): IDiscountPolicy {
  return {
    evaluate: vi.fn((): DiscountPolicyResult => ({ allowed: true, discountAmount: 10 })),
    assertAndCompute: vi.fn((): DiscountPolicyResult => ({ allowed: true, discountAmount: 10 })),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("CouponService.createCoupon", () => {
  it("normalizes the code to uppercase and publishes coupon.created", async () => {
    const coupons = fakeCouponRepository({
      create: vi.fn(async (data) => makeCoupon({ code: data.code })),
    });
    const events = fakeEventBus();
    const service = new CouponService(coupons, fakeDiscountPolicy(), events);

    const result = await service.createCoupon({
      code: "save10",
      discountType: "PERCENTAGE",
      discountValue: 10,
    });

    expect(result.code).toBe("SAVE10");
    expect(events.publish).toHaveBeenCalledWith({ type: "coupon.created", coupon: result });
  });

  it("rejects a code shorter than 3 characters", async () => {
    const service = new CouponService(fakeCouponRepository(), fakeDiscountPolicy(), fakeEventBus());

    await expect(
      service.createCoupon({ code: "ab", discountType: "PERCENTAGE", discountValue: 10 }),
    ).rejects.toThrow(CouponValidationError);
  });

  it("rejects a code that already exists", async () => {
    const coupons = fakeCouponRepository({ getByCode: vi.fn(async () => makeCoupon()) });
    const service = new CouponService(coupons, fakeDiscountPolicy(), fakeEventBus());

    await expect(
      service.createCoupon({ code: "SAVE10", discountType: "PERCENTAGE", discountValue: 10 }),
    ).rejects.toThrow(CouponValidationError);
  });
});

describe("CouponService.validateAndApply", () => {
  it("fetches the coupon by code and delegates to the discount policy", async () => {
    const coupon = makeCoupon();
    const coupons = fakeCouponRepository({ getByCode: vi.fn(async () => coupon) });
    const assertAndCompute = vi.fn((): DiscountPolicyResult => ({
      allowed: true,
      discountAmount: 25,
    }));
    const service = new CouponService(
      coupons,
      fakeDiscountPolicy({ assertAndCompute }),
      fakeEventBus(),
    );

    const result = await service.validateAndApply("save10", 250);

    expect(coupons.getByCode).toHaveBeenCalledWith("SAVE10");
    expect(assertAndCompute).toHaveBeenCalledWith({ coupon, orderSubtotal: 250 });
    expect(result).toEqual({ coupon, discountAmount: 25 });
  });
});

describe("CouponService.redeemCoupon", () => {
  it("increments uses and publishes coupon.redeemed", async () => {
    const coupon = makeCoupon({ usesCount: 1 });
    const coupons = fakeCouponRepository({ getById: vi.fn(async () => coupon) });
    const events = fakeEventBus();
    const service = new CouponService(coupons, fakeDiscountPolicy(), events);

    await service.redeemCoupon("coupon-1");

    expect(coupons.incrementUsesCount).toHaveBeenCalledWith("coupon-1");
    expect(events.publish).toHaveBeenCalledWith({ type: "coupon.redeemed", coupon });
  });
});
