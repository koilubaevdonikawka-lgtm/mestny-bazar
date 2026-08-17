import type {
  CommissionPolicyContext,
  CommissionPolicyResult,
} from "@server/ports/commission-policy.port";
import type { CommissionPolicyRule } from "@server/domain/commission-policy/commission-policy.rule";
import {
  CommissionPolicyOrder,
  DEFAULT_COMMISSION_RATE,
} from "@server/domain/commission-policy/commission-policy-order";

/** MVP single rule: a flat rate for every seller, admin-overridable via Settings. Per-seller/per-category rates are a documented future extension (finance.md). */
export class FlatCommissionRule implements CommissionPolicyRule {
  readonly order = CommissionPolicyOrder.FLAT;

  applies(_context: CommissionPolicyContext): boolean {
    return true;
  }

  evaluate(context: CommissionPolicyContext): CommissionPolicyResult {
    return { rate: context.settingsRate ?? DEFAULT_COMMISSION_RATE };
  }
}
