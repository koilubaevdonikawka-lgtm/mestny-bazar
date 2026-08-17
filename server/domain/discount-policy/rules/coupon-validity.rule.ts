import type {
  DiscountPolicyContext,
  DiscountPolicyResult,
} from "@server/ports/discount-policy.port";
import type { DiscountPolicyRule } from "@server/domain/discount-policy/discount-policy.rule";
import { DiscountPolicyOrder } from "@server/domain/discount-policy/discount-policy-order";

/** Global guard: unknown/inactive/expired/exhausted coupons are denied before any amount is computed. */
export class CouponValidityRule implements DiscountPolicyRule {
  readonly order = DiscountPolicyOrder.VALIDITY;
  readonly terminal = false;

  applies(_context: DiscountPolicyContext): boolean {
    return true;
  }

  evaluate(context: DiscountPolicyContext): DiscountPolicyResult {
    const { coupon } = context;

    if (!coupon) {
      return {
        allowed: false,
        denialCode: "COUPON_NOT_FOUND",
        message: "Coupon code not found",
        discountAmount: 0,
      };
    }

    if (!coupon.isActive) {
      return {
        allowed: false,
        denialCode: "COUPON_INACTIVE",
        message: "This coupon is no longer active",
        discountAmount: 0,
      };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return {
        allowed: false,
        denialCode: "COUPON_EXPIRED",
        message: "This coupon has expired",
        discountAmount: 0,
      };
    }

    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      return {
        allowed: false,
        denialCode: "COUPON_USES_EXCEEDED",
        message: "This coupon has reached its usage limit",
        discountAmount: 0,
      };
    }

    return { allowed: true, discountAmount: 0 };
  }
}
