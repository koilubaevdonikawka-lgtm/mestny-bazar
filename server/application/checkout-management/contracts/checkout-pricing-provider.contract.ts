import type { CheckoutLineDraft } from "@server/application/checkout-management/models/order-draft.model";

/** Checkout pricing — replace with Pricing Engine / Promotion Engine later. */
export interface ICheckoutPricingProvider {
  calculateLineTotal(line: Pick<CheckoutLineDraft, "unitPrice" | "quantity">): number;
  calculateSubtotal(lines: readonly CheckoutLineDraft[]): {
    readonly subtotal: number;
    readonly currency: string;
  };
}
