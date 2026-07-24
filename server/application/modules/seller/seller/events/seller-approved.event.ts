import type { Seller } from "@server/application/modules/seller/seller/models";

export interface SellerApprovedEvent {
  readonly type: "seller.approved";
  readonly seller: Seller;
  readonly occurredAt: string;
}

export function createSellerApprovedEvent(seller: Seller): SellerApprovedEvent {
  return Object.freeze({
    type: "seller.approved",
    seller,
    occurredAt: new Date().toISOString(),
  });
}
