import type { PriceCalculation } from "@server/application/modules/pricing/pricing/models";

export interface PriceCalculatedEvent {
  readonly type: "price.calculated";
  readonly calculation: PriceCalculation;
  readonly occurredAt: string;
}

export function createPriceCalculatedEvent(calculation: PriceCalculation): PriceCalculatedEvent {
  return Object.freeze({
    type: "price.calculated",
    calculation,
    occurredAt: new Date().toISOString(),
  });
}
