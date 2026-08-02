import { DeliveryTariffType } from "@shared/contracts/delivery";
import type { DeliveryTariffDTO } from "@shared/contracts/delivery";
import type { DeliveryTariffRule } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy.rule";
import { DeliveryTariffPolicyOrder } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy-order";
import type {
  DeliveryTariffPolicyContext,
  DeliveryTariffPolicyResult,
} from "@server/ports/delivery-tariff-policy.port";

function isWithinWindow(tariff: DeliveryTariffDTO, orderDate: string): boolean {
  const date = new Date(orderDate).getTime();
  if (tariff.validFrom && date < new Date(tariff.validFrom).getTime()) return false;
  if (tariff.validTo && date > new Date(tariff.validTo).getTime()) return false;
  return true;
}

function findPromotionalTariff(
  context: DeliveryTariffPolicyContext,
): DeliveryTariffDTO | undefined {
  return context.candidates.find(
    (t) => t.tariffType === DeliveryTariffType.PROMOTIONAL && isWithinWindow(t, context.orderDate),
  );
}

/** docs/delivery/delivery-rule-engine.md — PromotionalTariffRule (Admin-Marketing managed, permissions.md). */
export class PromotionalTariffRule implements DeliveryTariffRule {
  readonly order = DeliveryTariffPolicyOrder.PROMOTIONAL;
  readonly terminal = true;

  applies(context: DeliveryTariffPolicyContext): boolean {
    return findPromotionalTariff(context) !== undefined;
  }

  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult {
    const tariff = findPromotionalTariff(context);
    if (!tariff) return { allowed: false, denialCode: "NO_MATCHING_TARIFF" };
    return { allowed: true, tariff };
  }
}
