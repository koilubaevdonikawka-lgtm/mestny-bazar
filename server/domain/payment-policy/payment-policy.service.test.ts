import { describe, expect, it, vi } from "vitest";
import { PaymentPolicyService } from "@server/domain/payment-policy/payment-policy.service";
import {
  CashPaymentRequiresAuthentication,
  PaymentPolicyDeniedError,
} from "@server/domain/payment-policy.errors";
import type { PaymentPolicyContext, PaymentPolicyResult } from "@server/ports/payment-policy.port";
import type { PaymentPolicyRule } from "@server/domain/payment-policy/payment-policy.rule";

function fakeRule(partial: Partial<PaymentPolicyRule> & { order: number }): PaymentPolicyRule {
  return {
    applies: () => true,
    evaluate: (): PaymentPolicyResult => ({ allowed: true }),
    ...partial,
  };
}

function baseContext(overrides: Partial<PaymentPolicyContext> = {}): PaymentPolicyContext {
  return {
    user: { id: null, roles: [] },
    paymentMethod: "ONLINE",
    ...overrides,
  };
}

describe("PaymentPolicyService (rule engine)", () => {
  it("evaluates rules in ascending order", () => {
    const calls: number[] = [];
    const service = new PaymentPolicyService([
      fakeRule({
        order: 90,
        applies: () => {
          calls.push(90);
          return false;
        },
      }),
      fakeRule({
        order: 10,
        applies: () => {
          calls.push(10);
          return false;
        },
      }),
    ]);

    service.canUsePaymentMethod(baseContext());
    expect(calls).toEqual([10, 90]);
  });

  it("continues to the next rule when a matching rule allows but is non-terminal", () => {
    const calls: number[] = [];
    const service = new PaymentPolicyService([
      fakeRule({
        order: 10,
        terminal: false,
        evaluate: () => {
          calls.push(10);
          return { allowed: true };
        },
      }),
      fakeRule({
        order: 20,
        evaluate: () => {
          calls.push(20);
          return { allowed: true, message: "final" };
        },
      }),
    ]);

    const result = service.canUsePaymentMethod(baseContext());

    expect(calls).toEqual([10, 20]);
    expect(result).toEqual({ allowed: true, message: "final" });
  });

  it("stops immediately when a non-terminal rule denies, without running later rules", () => {
    const laterRule = fakeRule({ order: 20, evaluate: () => ({ allowed: true }) });
    const service = new PaymentPolicyService([
      fakeRule({
        order: 10,
        terminal: false,
        evaluate: () => ({ allowed: false, denialCode: "UNKNOWN_PAYMENT_METHOD" }),
      }),
      laterRule,
    ]);
    const laterApplies = vi.spyOn(laterRule, "applies");

    const result = service.canUsePaymentMethod(baseContext());

    expect(result).toMatchObject({ allowed: false, denialCode: "UNKNOWN_PAYMENT_METHOD" });
    expect(laterApplies).not.toHaveBeenCalled();
  });

  it("denies with UNKNOWN_PAYMENT_METHOD when no rule applies", () => {
    const service = new PaymentPolicyService([fakeRule({ order: 10, applies: () => false })]);
    const result = service.canUsePaymentMethod(baseContext());

    expect(result).toMatchObject({ allowed: false, denialCode: "UNKNOWN_PAYMENT_METHOD" });
  });

  it("getInitialPaymentStatus maps ONLINE to awaiting and CASH to unpaid", () => {
    const service = new PaymentPolicyService([]);
    expect(service.getInitialPaymentStatus("ONLINE")).toBe("awaiting");
    expect(service.getInitialPaymentStatus("CASH")).toBe("unpaid");
  });

  it("assertCanUsePaymentMethod throws CashPaymentRequiresAuthentication for that specific denial code", () => {
    const service = new PaymentPolicyService([
      fakeRule({
        order: 10,
        evaluate: () => ({ allowed: false, denialCode: "CASH_REQUIRES_AUTHENTICATION" }),
      }),
    ]);

    expect(() => service.assertCanUsePaymentMethod(baseContext())).toThrow(
      CashPaymentRequiresAuthentication,
    );
  });

  it("assertCanUsePaymentMethod throws the generic PaymentPolicyDeniedError otherwise", () => {
    const service = new PaymentPolicyService([
      fakeRule({
        order: 10,
        evaluate: () => ({ allowed: false, denialCode: "UNKNOWN_PAYMENT_METHOD" }),
      }),
    ]);

    expect(() => service.assertCanUsePaymentMethod(baseContext())).toThrow(
      PaymentPolicyDeniedError,
    );
  });

  it("assertCanUsePaymentMethod does not throw when allowed", () => {
    const service = new PaymentPolicyService([
      fakeRule({ order: 10, evaluate: () => ({ allowed: true }) }),
    ]);

    expect(() => service.assertCanUsePaymentMethod(baseContext())).not.toThrow();
  });
});
