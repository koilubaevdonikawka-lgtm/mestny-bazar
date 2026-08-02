import type { DeliveryZoneRule } from "@server/domain/delivery-zone-policy/delivery-zone-policy.rule";
import { DeliveryZonePolicyOrder } from "@server/domain/delivery-zone-policy/delivery-zone-policy-order";
import type {
  DeliveryZonePolicyContext,
  DeliveryZonePolicyResult,
} from "@server/ports/delivery-zone-policy.port";

/**
 * docs/delivery/delivery-rule-engine.md — ZoneActiveRule. Only applies (and
 * therefore only ever denies) when the zone is inactive — the standard
 * engine algorithm already stops on the first !allowed result, so an active
 * zone simply falls through to the next rule without this one claiming a
 * (would-be terminal) "allowed" result itself.
 */
export class ZoneActiveRule implements DeliveryZoneRule {
  readonly order = DeliveryZonePolicyOrder.ZONE_ACTIVE;
  readonly terminal = true;

  applies(context: DeliveryZonePolicyContext): boolean {
    return !context.isZoneActive;
  }

  evaluate(): DeliveryZonePolicyResult {
    return { allowed: false, denialCode: "ZONE_INACTIVE", message: "Delivery zone is inactive" };
  }
}
