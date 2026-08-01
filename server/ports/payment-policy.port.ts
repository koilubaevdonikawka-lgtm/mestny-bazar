import type { PaymentMethod, PaymentStatus } from "@shared/contracts/order";
import type { UserRole } from "@server/ports/auth.context";

export type PaymentPolicyDenialCode =
  "CASH_REQUIRES_AUTHENTICATION" | "UNKNOWN_PAYMENT_METHOD" | "USER_BLOCKED";

/** Minimal user identity for payment policy evaluation. */
export interface PaymentPolicyUser {
  id: string | null;
  roles: UserRole[];
}

/**
 * Context passed to payment policy rules.
 * Extended fields are optional hooks for future rules (city, limits, VIP, etc.).
 */
export interface PaymentPolicyContext {
  user: PaymentPolicyUser;
  paymentMethod: PaymentMethod;
  orderTotal?: number;
  city?: string | null;
  zoneId?: string | null;
  storeId?: string | null;
  /** users.md — server-checked, never trusted from the client; absent/false for guests (guests cannot be blocked). */
  isBlocked?: boolean;
}

export interface PaymentPolicyResult {
  allowed: boolean;
  denialCode?: PaymentPolicyDenialCode;
  message?: string;
}

export interface IPaymentPolicy {
  canUsePaymentMethod(context: PaymentPolicyContext): PaymentPolicyResult;
  assertCanUsePaymentMethod(context: PaymentPolicyContext): void;
  getInitialPaymentStatus(paymentMethod: PaymentMethod): PaymentStatus;
}
