import { describe, expect, it } from "vitest";
import { CommissionPolicyService } from "@server/domain/commission-policy/commission-policy.service";
import { FlatCommissionRule } from "@server/domain/commission-policy/rules/flat-commission.rule";
import { DEFAULT_COMMISSION_RATE } from "@server/domain/commission-policy/commission-policy-order";

describe("CommissionPolicyService (FlatCommissionRule)", () => {
  it("uses the platform default rate when no Settings override is configured", () => {
    const service = new CommissionPolicyService([new FlatCommissionRule()]);

    const result = service.resolveRate({ sellerId: "seller-1", settingsRate: null });

    expect(result.rate).toBe(DEFAULT_COMMISSION_RATE);
  });

  it("uses the admin-configured Settings rate when one is provided", () => {
    const service = new CommissionPolicyService([new FlatCommissionRule()]);

    const result = service.resolveRate({ sellerId: "seller-1", settingsRate: 0.15 });

    expect(result.rate).toBe(0.15);
  });

  it("falls back to the platform default when no rule is configured at all", () => {
    const service = new CommissionPolicyService([]);

    const result = service.resolveRate({ sellerId: "seller-1", settingsRate: 0.2 });

    expect(result.rate).toBe(DEFAULT_COMMISSION_RATE);
  });
});
