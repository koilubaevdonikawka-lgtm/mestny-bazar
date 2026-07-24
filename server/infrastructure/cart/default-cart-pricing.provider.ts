import type {
  CartPricingLine,
  ICartPricingProvider,
} from "@server/application/cart-management/contracts/cart-pricing-provider.contract";

const DEFAULT_CURRENCY = "KGS";

/** Simple line-total pricing until Pricing Engine / Promotion Engine is connected. */
export class DefaultCartPricingProvider implements ICartPricingProvider {
  calculateLineTotal(line: CartPricingLine): number {
    return Number((line.unitPrice * line.quantity).toFixed(2));
  }

  calculateCartTotal(lines: readonly CartPricingLine[]): {
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
