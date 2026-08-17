import type { DeliveryZoneRule } from "@server/domain/delivery-zone-policy/delivery-zone-policy.rule";
import { DeliveryZonePolicyOrder } from "@server/domain/delivery-zone-policy/delivery-zone-policy-order";
import type { DeliveryZonePolicyResult } from "@server/ports/delivery-zone-policy.port";

/**
 * docs/delivery/delivery-rule-engine.md — AllowRule. Explicit terminal
 * fallback (order 90) — without it, "no rule matched" would deny by the
 * engine's own default (NO_MATCHING_RULE), the opposite of the intended
 * "admit by default" semantics for a zone with no active restriction.
 */
export class AllowRule implements DeliveryZoneRule {
  readonly order = DeliveryZonePolicyOrder.ALLOW;
  readonly terminal = true;

  applies(): boolean {
    return true;
  }

  evaluate(): DeliveryZonePolicyResult {
    return { allowed: true };
  }
}
