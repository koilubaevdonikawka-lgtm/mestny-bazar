import type {
  ICourierAssignmentPolicy,
  CourierAssignmentContext,
  CourierAssignmentResult,
} from "@server/ports/courier-assignment.port";
import type { CourierAssignmentRule } from "@server/domain/courier-assignment/courier-assignment.rule";

function sortRulesByOrder(rules: CourierAssignmentRule[]): CourierAssignmentRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/** Rule Engine standard (Принцип 12) — first rule that picks a courier (terminal) wins. */
export class CourierAssignmentPolicyService implements ICourierAssignmentPolicy {
  private readonly rules: CourierAssignmentRule[];

  constructor(rules: CourierAssignmentRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  selectCourier(context: CourierAssignmentContext): CourierAssignmentResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (result.courierId === null) continue;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return { courierId: null };
  }
}
