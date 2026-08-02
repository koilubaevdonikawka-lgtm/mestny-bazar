import type { DeliveryZoneRule } from "@server/domain/delivery-zone-policy/delivery-zone-policy.rule";
import { DeliveryZonePolicyOrder } from "@server/domain/delivery-zone-policy/delivery-zone-policy-order";
import type {
  DeliveryZonePolicyContext,
  DeliveryZonePolicyResult,
} from "@server/ports/delivery-zone-policy.port";

/** docs/delivery/delivery-rule-engine.md — MinOrderAmountRule. */
export class MinOrderAmountRule implements DeliveryZoneRule {
  readonly order = DeliveryZonePolicyOrder.MIN_ORDER_AMOUNT;
  readonly terminal = true;

  applies(context: DeliveryZonePolicyContext): boolean {
    return context.minOrderAmount != null && context.subtotal < context.minOrderAmount;
  }

  evaluate(context: DeliveryZonePolicyContext): DeliveryZonePolicyResult {
    return {
      allowed: false,
      denialCode: "MIN_ORDER_AMOUNT_NOT_MET",
      message: `Minimum order amount for delivery is ${context.minOrderAmount}`,
    };
  }
}
