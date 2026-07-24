import type { CheckoutLineDraft } from "@server/application/checkout-management/models/order-draft.model";
import type { CheckoutValidationResult } from "@server/application/checkout-management/models/checkout-view.model";

/** Checkout readiness validation — replace with Inventory BCM extensions later. */
export interface ICheckoutValidationProvider {
  validateDraft(
    customerId: string,
    lines: readonly CheckoutLineDraft[],
  ): Promise<CheckoutValidationResult>;
}
