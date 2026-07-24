import type { Seller } from "@server/application/modules/seller/seller/models";

export interface SellerProfileUpdatedEvent {
  readonly type: "seller.profile.updated";
  readonly seller: Seller;
  readonly occurredAt: string;
}

export function createSellerProfileUpdatedEvent(seller: Seller): SellerProfileUpdatedEvent {
  return Object.freeze({
    type: "seller.profile.updated",
    seller,
    occurredAt: new Date().toISOString(),
  });
}
