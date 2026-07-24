/** Raised when product stock quantity changes. */
export interface ProductStockChangedEvent {
  readonly type: "ProductStockChanged";
  readonly productId: string;
  readonly sellerId: string;
  readonly previousQuantity: number;
  readonly nextQuantity: number;
  readonly occurredAt: string;
}

export function createProductStockChangedEvent(input: {
  productId: string;
  sellerId: string;
  previousQuantity: number;
  nextQuantity: number;
}): ProductStockChangedEvent {
  return Object.freeze({
    type: "ProductStockChanged",
    productId: input.productId,
    sellerId: input.sellerId,
    previousQuantity: input.previousQuantity,
    nextQuantity: input.nextQuantity,
    occurredAt: new Date().toISOString(),
  });
}
