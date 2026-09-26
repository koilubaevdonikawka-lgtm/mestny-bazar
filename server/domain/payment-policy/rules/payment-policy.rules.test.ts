import { describe, expect, it } from "vitest";
import type { PaymentPolicyContext } from "@server/ports/payment-policy.port";
import { CashAllowedRule } from "@server/domain/payment-policy/rules/cash-allowed.rule";
import { OnlineAllowedRule } from "@server/domain/payment-policy/rules/online-allowed.rule";

function ctx(overrides: Partial<PaymentPolicyContext> = {}): PaymentPolicyContext {
  return {
    user: { id: null, roles: [] },
    paymentMethod: "CASH",
    ...overrides,
  };
}

describe("CashAllowedRule", () => {
  const rule = new CashAllowedRule();

  it("applies only to CASH", () => {
    expect(rule.applies(ctx({ paymentMethod: "CASH" }))).toBe(true);
    expect(rule.applies(ctx({ paymentMethod: "ONLINE" }))).toBe(false);
  });

  it("always allows, even for guests", () => {
    const result = rule.evaluate(ctx({ paymentMethod: "CASH", user: { id: null, roles: [] } }));
    expect(result.allowed).toBe(true);
  });
});

describe("OnlineAllowedRule", () => {
  const rule = new OnlineAllowedRule();

  it("applies only to ONLINE", () => {
    expect(rule.applies(ctx({ paymentMethod: "ONLINE" }))).toBe(true);
    expect(rule.applies(ctx({ paymentMethod: "CASH" }))).toBe(false);
  });

  it("always allows, even for guests", () => {
    const result = rule.evaluate(ctx({ paymentMethod: "ONLINE", user: { id: null, roles: [] } }));
    expect(result.allowed).toBe(true);
  });
});
