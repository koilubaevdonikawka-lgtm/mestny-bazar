import { DeliveryTariffType } from "@shared/contracts/delivery";
import type { DeliveryTariffRule } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy.rule";
import { DeliveryTariffPolicyOrder } from "@server/domain/delivery-tariff-policy/delivery-tariff-policy-order";
import type {
  DeliveryTariffPolicyContext,
  DeliveryTariffPolicyResult,
} from "@server/ports/delivery-tariff-policy.port";

/**
 * docs/delivery/delivery-rule-engine.md — StandardTariffFallbackRule. Always
 * applies (order 90, last) — the explicit terminal fallback, not an implicit
 * "nothing matched = allow". Denies with NO_STANDARD_TARIFF (a configuration
 * error, not a silent 0) if the zone has no STANDARD tariff and no
 * platform-wide default either.
 */
export class StandardTariffFallbackRule implements DeliveryTariffRule {
  readonly order = DeliveryTariffPolicyOrder.STANDARD_FALLBACK;
  readonly terminal = true;

  applies(): boolean {
    return true;
  }

  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult {
    // Prefer a tariff owned by this exact zone over a platform-wide default.
    const zoneOwned = context.candidates.find(
      (t) => t.tariffType === DeliveryTariffType.STANDARD && t.zoneId === context.zoneId,
    );
    const platformDefault = context.candidates.find(
      (t) => t.tariffType === DeliveryTariffType.STANDARD && t.zoneId === null,
    );
    const tariff = zoneOwned ?? platformDefault;

    if (!tariff) return { allowed: false, denialCode: "NO_STANDARD_TARIFF" };
    return { allowed: true, tariff };
  }
}
