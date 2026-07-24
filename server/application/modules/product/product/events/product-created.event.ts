import type { ProductStatusValue } from "@server/application/modules/product/product/models";

/** Raised when a product card is created. */
export interface ProductCreatedEvent {
  readonly type: "ProductCreated";
  readonly productId: string;
  readonly sellerId: string;
  readonly name: string;
  readonly status: ProductStatusValue;
  readonly occurredAt: string;
}

export function createProductCreatedEvent(input: {
  productId: string;
  sellerId: string;
  name: string;
  status: ProductStatusValue;
}): ProductCreatedEvent {
  return Object.freeze({
    type: "ProductCreated",
    productId: input.productId,
    sellerId: input.sellerId,
    name: input.name,
    status: input.status,
    occurredAt: new Date().toISOString(),
  });
}
