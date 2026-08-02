/** Named execution order for delivery tariff selection rules (ascending) — docs/delivery/delivery-rule-engine.md. */
export const DeliveryTariffPolicyOrder = {
  CORPORATE: 10,
  HOLIDAY: 20,
  PROMOTIONAL: 30,
  STANDARD_FALLBACK: 90,
} as const;
