/** Raised when a product price changes. */
export interface ProductPriceChangedEvent {
  readonly type: "ProductPriceChanged";
  readonly productId: string;
  readonly sellerId: string;
  readonly previousAmount: number;
  readonly previousCurrency: string;
  readonly nextAmount: number;
  readonly nextCurrency: string;
  readonly occurredAt: string;
}

export function createProductPriceChangedEvent(input: {
  productId: string;
  sellerId: string;
  previousAmount: number;
  previousCurrency: string;
  nextAmount: number;
  nextCurrency: string;
}): ProductPriceChangedEvent {
  return Object.freeze({
    type: "ProductPriceChanged",
    productId: input.productId,
    sellerId: input.sellerId,
    previousAmount: input.previousAmount,
    previousCurrency: input.previousCurrency,
    nextAmount: input.nextAmount,
    nextCurrency: input.nextCurrency,
    occurredAt: new Date().toISOString(),
  });
}
