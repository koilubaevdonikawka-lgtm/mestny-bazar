import { DeliveryTariffType } from "@shared/contracts/delivery";
import type { DeliveryTariffRule } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy.rule";
import { DeliveryTariffPolicyOrder } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy-order";
import type {
  DeliveryTariffPolicyContext,
  DeliveryTariffPolicyResult,
} from "@server/ports/delivery-tariff-policy.port";

/** docs/delivery/delivery-rule-engine.md — CorporateTariffRule. */
export class CorporateTariffRule implements DeliveryTariffRule {
  readonly order = DeliveryTariffPolicyOrder.CORPORATE;
  readonly terminal = true;

  applies(context: DeliveryTariffPolicyContext): boolean {
    return (
      context.customerSegment === "CORPORATE" &&
      context.candidates.some((t) => t.tariffType === DeliveryTariffType.CORPORATE)
    );
  }

  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult {
    const tariff = context.candidates.find((t) => t.tariffType === DeliveryTariffType.CORPORATE);
    if (!tariff) return { allowed: false, denialCode: "NO_MATCHING_TARIFF" };
    return { allowed: true, tariff };
  }
}
