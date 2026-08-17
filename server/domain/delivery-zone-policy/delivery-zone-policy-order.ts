/** Named execution order for delivery zone allowance rules (ascending) — docs/delivery/delivery-rule-engine.md. */
export const DeliveryZonePolicyOrder = {
  ZONE_ACTIVE: 10,
  MIN_ORDER_AMOUNT: 20,
  ALLOW: 90,
} as const;
