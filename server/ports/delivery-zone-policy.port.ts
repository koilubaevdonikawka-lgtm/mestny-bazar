/** docs/delivery/delivery-rule-engine.md — "Delivery Zone Policy". */
export interface DeliveryZonePolicyContext {
  zoneId: string;
  subtotal: number;
  /** The zone's resolved minimum order amount (from the applicable tariff), if any. */
  minOrderAmount: number | null;
  isZoneActive: boolean;
}

export interface DeliveryZonePolicyResult {
  allowed: boolean;
  denialCode?: string;
  message?: string;
}

export interface IDeliveryZonePolicy {
  can(context: DeliveryZonePolicyContext): DeliveryZonePolicyResult;
  assert(context: DeliveryZonePolicyContext): void;
}
