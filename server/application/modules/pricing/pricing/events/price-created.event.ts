import type { Price } from "@server/application/modules/pricing/pricing/models";

export interface PriceCreatedEvent {
  readonly type: "price.created";
  readonly price: Price;
  readonly occurredAt: string;
}

export function createPriceCreatedEvent(price: Price): PriceCreatedEvent {
  return Object.freeze({
    type: "price.created",
    price,
    occurredAt: new Date().toISOString(),
  });
}
