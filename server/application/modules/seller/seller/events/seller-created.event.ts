import type { Seller } from "@server/application/modules/seller/seller/models";

export interface SellerCreatedEvent {
  readonly type: "seller.created";
  readonly seller: Seller;
  readonly occurredAt: string;
}

export function createSellerCreatedEvent(seller: Seller): SellerCreatedEvent {
  return Object.freeze({
    type: "seller.created",
    seller,
    occurredAt: new Date().toISOString(),
  });
}
