import type { Seller } from "@server/application/modules/seller/seller/models";

export interface SellerSuspendedEvent {
  readonly type: "seller.suspended";
  readonly seller: Seller;
  readonly reason: string | null;
  readonly occurredAt: string;
}

export function createSellerSuspendedEvent(
  seller: Seller,
  reason: string | null,
): SellerSuspendedEvent {
  return Object.freeze({
    type: "seller.suspended",
    seller,
    reason,
    occurredAt: new Date().toISOString(),
  });
}
