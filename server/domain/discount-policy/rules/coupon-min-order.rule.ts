import type {
  DiscountPolicyContext,
  DiscountPolicyResult,
} from "@server/ports/discount-policy.port";
import type { DiscountPolicyRule } from "@server/domain/discount-policy/discount-policy.rule";
import { DiscountPolicyOrder } from "@server/domain/discount-policy/discount-policy-order";

/** Denies a validity-checked coupon whose minimum order total isn't met by this order's subtotal. */
export class CouponMinOrderRule implements DiscountPolicyRule {
  readonly order = DiscountPolicyOrder.MIN_ORDER;
  readonly terminal = false;

  applies(context: DiscountPolicyContext): boolean {
    return context.coupon !== null;
  }

  evaluate(context: DiscountPolicyContext): DiscountPolicyResult {
    const coupon = context.coupon!;
    if (context.orderSubtotal < coupon.minOrderTotal) {
      return {
        allowed: false,
        denialCode: "MIN_ORDER_NOT_MET",
        message: `Order subtotal must be at least ${coupon.minOrderTotal} to use this coupon`,
        discountAmount: 0,
      };
    }
    return { allowed: true, discountAmount: 0 };
  }
}
