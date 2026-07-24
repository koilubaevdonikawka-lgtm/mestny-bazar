/** Raised when product card details are updated. */
export interface ProductUpdatedEvent {
  readonly type: "ProductUpdated";
  readonly productId: string;
  readonly sellerId: string;
  readonly name: string;
  readonly occurredAt: string;
}

export function createProductUpdatedEvent(input: {
  productId: string;
  sellerId: string;
  name: string;
}): ProductUpdatedEvent {
  return Object.freeze({
    type: "ProductUpdated",
    productId: input.productId,
    sellerId: input.sellerId,
    name: input.name,
    occurredAt: new Date().toISOString(),
  });
}
