import type { CouponDTO } from "@shared/contracts/coupon";

export type DiscountPolicyDenialCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_INACTIVE"
  | "COUPON_EXPIRED"
  | "COUPON_USES_EXCEEDED"
  | "MIN_ORDER_NOT_MET"
  | "NO_MATCHING_RULE";

export interface DiscountPolicyContext {
  /**
   * Pre-fetched by the caller (CheckoutService/CouponService) via
   * ICouponRepository.getByCode() — Rule Engines stay synchronous (Принцип 12).
   * Null when the submitted code doesn't match any coupon.
   */
  coupon: CouponDTO | null;
  orderSubtotal: number;
}

export interface DiscountPolicyResult {
  allowed: boolean;
  denialCode?: DiscountPolicyDenialCode;
  message?: string;
  /** 0 when not allowed. Never exceeds orderSubtotal — an order's total cannot go negative. */
  discountAmount: number;
}

/**
 * marketing.md — Rule Engine standard (Принцип 12) embedded into
 * CheckoutService the same way paymentPolicy.assertCanUsePaymentMethod() is:
 * validates a coupon and computes its discount server-side, never trusting a
 * client-supplied discount amount (CD-01).
 */
export interface IDiscountPolicy {
  evaluate(context: DiscountPolicyContext): DiscountPolicyResult;
  assertAndCompute(context: DiscountPolicyContext): DiscountPolicyResult;
}
