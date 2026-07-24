import type { Price } from "@server/application/modules/pricing/pricing/models";

export interface PriceUpdatedEvent {
  readonly type: "price.updated";
  readonly price: Price;
  readonly occurredAt: string;
}

export function createPriceUpdatedEvent(price: Price): PriceUpdatedEvent {
  return Object.freeze({
    type: "price.updated",
    price,
    occurredAt: new Date().toISOString(),
  });
}
