import type {
  IDeliveryZonePolicy,
  DeliveryZonePolicyContext,
  DeliveryZonePolicyResult,
} from "@server/ports/delivery-zone-policy.port";
import type { DeliveryZoneRule } from "@server/domain/delivery-zone-policy/delivery-zone-policy.rule";
import { DeliveryNotAllowedError } from "@server/domain/delivery.errors";

function sortRulesByOrder(rules: DeliveryZoneRule[]): DeliveryZoneRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/**
 * Universal Rule Engine standard (Принцип 12). docs/delivery/delivery-rule-engine.md
 * — "Delivery Zone Policy": is delivery to this zone, at this subtotal, allowed at all.
 */
export class DeliveryZonePolicyService implements IDeliveryZonePolicy {
  private readonly rules: DeliveryZoneRule[];

  constructor(rules: DeliveryZoneRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  can(context: DeliveryZonePolicyContext): DeliveryZonePolicyResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (!result.allowed) return result;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return { allowed: false, denialCode: "NO_MATCHING_RULE" };
  }

  assert(context: DeliveryZonePolicyContext): void {
    const result = this.can(context);
    if (!result.allowed) {
      throw new DeliveryNotAllowedError(
        result.denialCode ?? "DELIVERY_NOT_ALLOWED",
        result.message ?? "Delivery is not available for this zone/order",
      );
    }
  }
}
