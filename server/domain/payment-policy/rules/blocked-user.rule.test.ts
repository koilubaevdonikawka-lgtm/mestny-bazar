import { describe, expect, it } from "vitest";
import { BlockedUserRule } from "@server/domain/payment-policy/rules/blocked-user.rule";
import type { PaymentPolicyContext } from "@server/ports/payment-policy.port";

function ctx(overrides: Partial<PaymentPolicyContext> = {}): PaymentPolicyContext {
  return {
    user: { id: "user-1", roles: [] },
    paymentMethod: "CASH",
    ...overrides,
  };
}

describe("BlockedUserRule", () => {
  const rule = new BlockedUserRule();

  it("applies to every context", () => {
    expect(rule.applies(ctx())).toBe(true);
    expect(rule.applies(ctx({ paymentMethod: "ONLINE" }))).toBe(true);
  });

  it("is not terminal — an unblocked user falls through to method-specific rules", () => {
    expect(rule.terminal).toBe(false);
  });

  it("denies with USER_BLOCKED when isBlocked is true", () => {
    const result = rule.evaluate(ctx({ isBlocked: true }));
    expect(result).toMatchObject({ allowed: false, denialCode: "USER_BLOCKED" });
  });

  it("allows when isBlocked is false or absent (guests)", () => {
    expect(rule.evaluate(ctx({ isBlocked: false }))).toEqual({ allowed: true });
    expect(rule.evaluate(ctx())).toEqual({ allowed: true });
  });
});
