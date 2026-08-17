import type {
  DeliveryZonePolicyContext,
  DeliveryZonePolicyResult,
} from "@server/ports/delivery-zone-policy.port";

/** docs/principles/12-rule-engine-standard.md — order/applies/evaluate/terminal, no exceptions. */
export interface DeliveryZoneRule {
  readonly order: number;
  readonly terminal?: boolean;
  applies(context: DeliveryZonePolicyContext): boolean;
  evaluate(context: DeliveryZonePolicyContext): DeliveryZonePolicyResult;
}
