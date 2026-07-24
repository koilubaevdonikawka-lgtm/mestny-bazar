import type { ICheckoutPricingProvider } from "@server/application/checkout-management/contracts/checkout-pricing-provider.contract";
import type { CheckoutLineDraft } from "@server/application/checkout-management/models/order-draft.model";

const DEFAULT_CURRENCY = "KGS";

/** Simple subtotal calculation until Pricing Engine / Promotion Engine is connected. */
export class DefaultCheckoutPricingProvider implements ICheckoutPricingProvider {
  calculateLineTotal(line: Pick<CheckoutLineDraft, "unitPrice" | "quantity">): number {
    return Number((line.unitPrice * line.quantity).toFixed(2));
  }

  calculateSubtotal(lines: readonly CheckoutLineDraft[]): {
    subtotal: number;
    currency: string;
  } {
    const currency = lines[0]?.currency ?? DEFAULT_CURRENCY;
    const subtotal = Number(
      lines.reduce((sum, line) => sum + this.calculateLineTotal(line), 0).toFixed(2),
    );
    return { subtotal, currency };
  }
}
