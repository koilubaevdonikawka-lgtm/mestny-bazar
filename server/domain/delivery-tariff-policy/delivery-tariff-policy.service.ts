import type {
  IDeliveryTariffPolicy,
  DeliveryTariffPolicyContext,
  DeliveryTariffPolicyResult,
} from "@server/ports/delivery-tariff-policy.port";
import type { DeliveryTariffRule } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy.rule";

function sortRulesByOrder(rules: DeliveryTariffRule[]): DeliveryTariffRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/**
 * Universal Rule Engine standard (Принцип 12), same shape as
 * DiscountPolicyService/PaymentPolicyService: !allowed denies immediately
 * regardless of terminal; allowed && terminal !== false stops the chain.
 * docs/delivery/delivery-rule-engine.md — "Delivery Tariff Policy".
 */
export class DeliveryTariffPolicyService implements IDeliveryTariffPolicy {
  private readonly rules: DeliveryTariffRule[];

  constructor(rules: DeliveryTariffRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (!result.allowed) return result;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return {
      allowed: false,
      denialCode: "NO_MATCHING_TARIFF",
    };
  }
}
