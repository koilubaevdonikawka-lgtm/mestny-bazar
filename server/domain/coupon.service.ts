import type { ICouponRepository } from "@server/ports/coupon.repository";
import type {
  CouponApplicationResult,
  CouponDTO,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "@shared/contracts/coupon";
import type { IDiscountPolicy } from "@server/ports/discount-policy.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import { CouponValidationError } from "@server/domain/coupon.errors";

/** marketing.md — coupon CRUD plus the validate-and-apply step CheckoutService calls at checkout time. */
export class CouponService {
  constructor(
    private readonly coupons: ICouponRepository,
    private readonly discountPolicy: IDiscountPolicy,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listCoupons(): Promise<CouponDTO[]> {
    return this.coupons.listAll();
  }

  async createCoupon(data: CreateCouponRequest): Promise<CouponDTO> {
    const code = data.code.trim().toUpperCase();
    if (code.length < 3) {
      throw new CouponValidationError("Coupon code must be at least 3 characters", "code");
    }

    const existing = await this.coupons.getByCode(code);
    if (existing) {
      throw new CouponValidationError("A coupon with this code already exists", "code");
    }

    const coupon = await this.coupons.create({ ...data, code });
    await this.events.publish({ type: "coupon.created", coupon });
    return coupon;
  }

  async updateCoupon(data: UpdateCouponRequest): Promise<CouponDTO> {
    return this.coupons.update(data);
  }

  /**
   * Server-side validation + computation only — never trusts a client-supplied
   * discount amount (CD-01). Does not increment uses_count: that only happens
   * once the order is actually created (redeemCoupon), so an aborted checkout
   * doesn't burn a use.
   */
  async validateAndApply(code: string, orderSubtotal: number): Promise<CouponApplicationResult> {
    const coupon = await this.coupons.getByCode(code.trim().toUpperCase());
    const result = this.discountPolicy.assertAndCompute({ coupon, orderSubtotal });
    return { coupon: coupon!, discountAmount: result.discountAmount };
  }

  async redeemCoupon(couponId: string): Promise<void> {
    await this.coupons.incrementUsesCount(couponId);
    const coupon = await this.coupons.getById(couponId);
    if (coupon) {
      await this.events.publish({ type: "coupon.redeemed", coupon });
    }
  }
}
