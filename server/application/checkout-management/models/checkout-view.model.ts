import type { CheckoutLineDraft } from "@server/application/checkout-management/models/order-draft.model";

export interface CheckoutValidationIssue {
  readonly code: string;
  readonly productId?: string;
  readonly sellerId?: string;
  readonly message: string;
}

export interface CheckoutValidationResult {
  readonly valid: boolean;
  readonly ready: boolean;
  readonly issues: readonly CheckoutValidationIssue[];
}

export interface CheckoutSummary {
  readonly checkoutId: string;
  readonly customerId: string;
  readonly status: string;
  readonly items: readonly CheckoutLineDraft[];
  readonly subtotal: number;
  readonly currency: string;
  readonly itemCount: number;
  readonly ready: boolean;
  readonly issues: readonly CheckoutValidationIssue[];
}

export interface CancelCheckoutResult {
  readonly cancelled: boolean;
}
