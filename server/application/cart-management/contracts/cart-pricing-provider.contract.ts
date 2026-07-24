export interface CartPricingLine {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly currency: string;
}

/** Cart pricing — replace with Pricing Engine / Promotion Engine later. */
export interface ICartPricingProvider {
  calculateLineTotal(line: CartPricingLine): number;
  calculateCartTotal(lines: readonly CartPricingLine[]): {
    readonly subtotal: number;
    readonly currency: string;
  };
}
