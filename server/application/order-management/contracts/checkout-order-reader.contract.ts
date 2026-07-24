import type { CheckoutSummary } from "@server/application/checkout-management/models/checkout-view.model";
import type { CheckoutValidationResult } from "@server/application/checkout-management/models/checkout-view.model";

/**
 * Read-only checkout access for order creation.
 * Implemented by an adapter over Checkout Management — no Checkout Repository access.
 */
export interface ICheckoutOrderReader {
  getCheckoutSummary(checkoutId: string): Promise<CheckoutSummary | null>;
  validateCheckout(customerId: string, checkoutId: string): Promise<CheckoutValidationResult>;
}
