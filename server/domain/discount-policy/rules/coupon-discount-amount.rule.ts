import type {
  DiscountPolicyContext,
  DiscountPolicyResult,
} from "@server/ports/discount-policy.port";
import type { DiscountPolicyRule } from "@server/domain/discount-policy/discount-policy.rule";
import { DiscountPolicyOrder } from "@server/domain/discount-policy/discount-policy-order";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Computes the discount amount for a coupon that already passed validity/min-order checks — never exceeds the order subtotal. */
export class CouponDiscountAmountRule implements DiscountPolicyRule {
  readonly order = DiscountPolicyOrder.COMPUTE_AMOUNT;

  applies(context: DiscountPolicyContext): boolean {
    return context.coupon !== null;
  }

  evaluate(context: DiscountPolicyContext): DiscountPolicyResult {
    const coupon = context.coupon!;
    const raw =
      coupon.discountType === "PERCENTAGE"
        ? context.orderSubtotal * (coupon.discountValue / 100)
        : coupon.discountValue;

    const discountAmount = round2(Math.min(raw, context.orderSubtotal));
    return { allowed: true, discountAmount };
  }
}
