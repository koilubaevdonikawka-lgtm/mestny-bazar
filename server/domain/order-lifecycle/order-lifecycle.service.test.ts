import { describe, expect, it } from "vitest";
import { OrderLifecycleService } from "@server/domain/order-lifecycle/order-lifecycle.service";
import { OrderLifecycleDeniedError } from "@server/domain/order-lifecycle/order-lifecycle.errors";
import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderStatus } from "@shared/contracts/order";

function fakeRule(partial: Partial<OrderLifecycleRule> & { order: number }): OrderLifecycleRule {
  return {
    applies: () => true,
    evaluate: (): OrderLifecycleResult => ({ allowed: true }),
    ...partial,
  };
}

function baseContext(overrides: Partial<OrderLifecycleContext> = {}): OrderLifecycleContext {
  return {
    orderId: "order-1",
    currentStatus: OrderStatus.CREATED,
    targetStatus: OrderStatus.CONFIRMED,
    actor: { id: "user-1" },
    ...overrides,
  };
}

describe("OrderLifecycleService (rule engine)", () => {
  it("evaluates rules in ascending order regardless of construction order", () => {
    const calls: number[] = [];
    const rule20 = fakeRule({
      order: 20,
      applies: () => {
        calls.push(20);
        return false;
      },
    });
    const rule10 = fakeRule({
      order: 10,
      applies: () => {
        calls.push(10);
        return false;
      },
    });

    const service = new OrderLifecycleService([rule20, rule10]);
    service.canTransition(baseContext());

    expect(calls).toEqual([10, 20]);
  });

  it("skips rules whose applies() returns false", () => {
    const skipped = fakeRule({ order: 10, applies: () => false });
    const matching = fakeRule({ order: 20, evaluate: () => ({ allowed: true }) });

    const service = new OrderLifecycleService([skipped, matching]);
    const result = service.canTransition(baseContext());

    expect(result.allowed).toBe(true);
  });

  it("stops immediately and denies when a matching rule denies (terminal by default)", () => {
    const laterRuleEvaluated = { value: false };
    const denyingRule = fakeRule({
      order: 10,
      evaluate: () => ({ allowed: false, denialCode: "DENIED_BY_TEST" }),
    });
    const laterRule = fakeRule({
      order: 20,
      applies: () => {
        laterRuleEvaluated.value = true;
        return true;
      },
    });

    const service = new OrderLifecycleService([denyingRule, laterRule]);
    const result = service.canTransition(baseContext());

    expect(result).toEqual({ allowed: false, denialCode: "DENIED_BY_TEST" });
    expect(laterRuleEvaluated.value).toBe(false);
  });

  it("stops immediately and allows when a terminal rule allows", () => {
    const laterRuleEvaluated = { value: false };
    const allowingRule = fakeRule({ order: 10, evaluate: () => ({ allowed: true }) });
    const laterRule = fakeRule({
      order: 20,
      applies: () => {
        laterRuleEvaluated.value = true;
        return true;
      },
    });

    const service = new OrderLifecycleService([allowingRule, laterRule]);
    service.canTransition(baseContext());

    expect(laterRuleEvaluated.value).toBe(false);
  });

  it("continues the chain past a non-terminal (guard) rule that allows", () => {
    const guardRule = fakeRule({
      order: 10,
      terminal: false,
      evaluate: () => ({ allowed: true }),
    });
    const finalRule = fakeRule({
      order: 20,
      evaluate: () => ({ allowed: false, denialCode: "FINAL_DENY" }),
    });

    const service = new OrderLifecycleService([guardRule, finalRule]);
    const result = service.canTransition(baseContext());

    expect(result).toEqual({ allowed: false, denialCode: "FINAL_DENY" });
  });

  it("denies with NO_MATCHING_RULE when no rule applies", () => {
    const service = new OrderLifecycleService([fakeRule({ order: 10, applies: () => false })]);
    const result = service.canTransition(baseContext());

    expect(result.allowed).toBe(false);
    expect(result.denialCode).toBe("NO_MATCHING_RULE");
  });

  it("assertCanTransition throws OrderLifecycleDeniedError with the rule's denial code", () => {
    const service = new OrderLifecycleService([
      fakeRule({
        order: 10,
        evaluate: () => ({ allowed: false, denialCode: "SOME_DENIAL", message: "nope" }),
      }),
    ]);

    expect(() => service.assertCanTransition(baseContext())).toThrow(OrderLifecycleDeniedError);
    try {
      service.assertCanTransition(baseContext());
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(OrderLifecycleDeniedError);
      expect((error as InstanceType<typeof OrderLifecycleDeniedError>).code).toBe("SOME_DENIAL");
    }
  });

  it("assertCanTransition falls back to a default code/message when a rule denies without supplying either", () => {
    const service = new OrderLifecycleService([
      fakeRule({ order: 10, evaluate: () => ({ allowed: false }) }),
    ]);

    try {
      service.assertCanTransition(baseContext());
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(OrderLifecycleDeniedError);
      const denied = error as InstanceType<typeof OrderLifecycleDeniedError>;
      expect(denied.code).toBe("ORDER_LIFECYCLE_DENIED");
      expect(denied.message).toBe("Order status transition is not allowed");
    }
  });

  it("assertCanTransition does not throw when the transition is allowed", () => {
    const service = new OrderLifecycleService([
      fakeRule({ order: 10, evaluate: () => ({ allowed: true }) }),
    ]);

    expect(() => service.assertCanTransition(baseContext())).not.toThrow();
  });
});
