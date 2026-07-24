import type { ProductStatusValue } from "@server/application/modules/product/product/models";

/** Raised when a product is published to the catalog. */
export interface ProductPublishedEvent {
  readonly type: "ProductPublished";
  readonly productId: string;
  readonly sellerId: string;
  readonly status: ProductStatusValue;
  readonly occurredAt: string;
}

export function createProductPublishedEvent(input: {
  productId: string;
  sellerId: string;
  status: ProductStatusValue;
}): ProductPublishedEvent {
  return Object.freeze({
    type: "ProductPublished",
    productId: input.productId,
    sellerId: input.sellerId,
    status: input.status,
    occurredAt: new Date().toISOString(),
  });
}
