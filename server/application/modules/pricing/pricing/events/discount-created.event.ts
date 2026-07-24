import type { Discount } from "@server/application/modules/pricing/pricing/models";

export interface DiscountCreatedEvent {
  readonly type: "discount.created";
  readonly discount: Discount;
  readonly occurredAt: string;
}

export function createDiscountCreatedEvent(discount: Discount): DiscountCreatedEvent {
  return Object.freeze({
    type: "discount.created",
    discount,
    occurredAt: new Date().toISOString(),
  });
}
