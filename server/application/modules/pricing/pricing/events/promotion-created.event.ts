import type { Promotion } from "@server/application/modules/pricing/pricing/models";

export interface PromotionCreatedEvent {
  readonly type: "promotion.created";
  readonly promotion: Promotion;
  readonly occurredAt: string;
}

export function createPromotionCreatedEvent(promotion: Promotion): PromotionCreatedEvent {
  return Object.freeze({
    type: "promotion.created",
    promotion,
    occurredAt: new Date().toISOString(),
  });
}
