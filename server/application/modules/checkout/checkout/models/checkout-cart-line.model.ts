/** Cart line reference used during checkout orchestration. */
export interface CheckoutCartLine {
  readonly productId: string;
  readonly sellerId: string;
  readonly catalogId: string;
  readonly name: string;
  readonly priceAmount: number;
  readonly currency: string;
  readonly quantity: number;
}
