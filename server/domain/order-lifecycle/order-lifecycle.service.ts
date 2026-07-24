import type {
  IOrderLifecyclePolicy,
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleDeniedError } from "@server/domain/order-lifecycle/order-lifecycle.errors";

function sortRulesByOrder(rules: OrderLifecycleRule[]): OrderLifecycleRule[] {
  return [...rules].sort((a, b) => a.order - b.order);
}

/**
 * Universal rule engine for order status transitions.
 * Rule order and membership are composed in DI Container — not hardcoded here.
 */
export class OrderLifecycleService implements IOrderLifecyclePolicy {
  private readonly rules: OrderLifecycleRule[];

  constructor(rules: OrderLifecycleRule[]) {
    this.rules = sortRulesByOrder(rules);
  }

  canTransition(context: OrderLifecycleContext): OrderLifecycleResult {
    for (const rule of this.rules) {
      if (!rule.applies(context)) continue;

      const result = rule.evaluate(context);
      if (!result.allowed) return result;

      const isTerminal = rule.terminal !== false;
      if (isTerminal) return result;
    }

    return {
      allowed: false,
      denialCode: "NO_MATCHING_RULE",
      message: "No lifecycle rule matched the transition request",
    };
  }

  assertCanTransition(context: OrderLifecycleContext): void {
    const result = this.canTransition(context);
    if (result.allowed) return;

    throw new OrderLifecycleDeniedError(
      result.denialCode ?? "ORDER_LIFECYCLE_DENIED",
      result.message ?? "Order status transition is not allowed",
    );
  }
}
