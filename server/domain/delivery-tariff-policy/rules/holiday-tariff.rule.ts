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

function findHolidayTariff(context: DeliveryTariffPolicyContext): DeliveryTariffDTO | undefined {
  return context.candidates.find(
    (t) => t.tariffType === DeliveryTariffType.HOLIDAY && isWithinWindow(t, context.orderDate),
  );
}

/** docs/delivery/delivery-rule-engine.md — HolidayTariffRule. */
export class HolidayTariffRule implements DeliveryTariffRule {
  readonly order = DeliveryTariffPolicyOrder.HOLIDAY;
  readonly terminal = true;

  applies(context: DeliveryTariffPolicyContext): boolean {
    return findHolidayTariff(context) !== undefined;
  }

  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult {
    const tariff = findHolidayTariff(context);
    if (!tariff) return { allowed: false, denialCode: "NO_MATCHING_TARIFF" };
    return { allowed: true, tariff };
  }
}
