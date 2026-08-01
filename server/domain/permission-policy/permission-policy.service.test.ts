import { describe, expect, it } from "vitest";
import { PermissionPolicyService } from "@server/domain/permission-policy/permission-policy.service";
import { PermissionDeniedError } from "@server/domain/permission-policy/permission-policy.errors";
import type { PermissionContext, PermissionResult } from "@server/ports/permission-policy.port";
import type { PermissionPolicyRule } from "@server/domain/permission-policy/permission-policy.rule";

function ctx(overrides: Partial<PermissionContext> = {}): PermissionContext {
  return { actor: { id: "u1", roles: [] }, module: "settings", ...overrides };
}

function fakeRule(overrides: Partial<PermissionPolicyRule> = {}): PermissionPolicyRule {
  return {
    order: 10,
    applies: () => true,
    evaluate: (): PermissionResult => ({ allowed: true }),
    ...overrides,
  };
}

describe("PermissionPolicyService", () => {
  it("runs rules in ascending order, not registration order", () => {
    const calls: string[] = [];
    const second = fakeRule({
      order: 20,
      evaluate: () => {
        calls.push("second");
        return { allowed: true };
      },
    });
    const first = fakeRule({
      order: 10,
      evaluate: () => {
        calls.push("first");
        return { allowed: true };
      },
    });
    const service = new PermissionPolicyService([second, first]);

    service.can(ctx());
    expect(calls).toEqual(["first"]); // first rule is terminal by default, stops the chain
  });

  it("skips a rule whose applies() returns false", () => {
    const skipped = fakeRule({
      order: 10,
      applies: () => false,
      evaluate: () => ({ allowed: false, denialCode: "SHOULD_NOT_RUN" }),
    });
    const matching = fakeRule({ order: 20, evaluate: () => ({ allowed: true }) });
    const service = new PermissionPolicyService([skipped, matching]);

    expect(service.can(ctx())).toEqual({ allowed: true });
  });

  it("denies immediately when a rule evaluates to not-allowed", () => {
    const denying = fakeRule({
      order: 10,
      evaluate: () => ({ allowed: false, denialCode: "DENIED_BY_TEST" }),
    });
    const service = new PermissionPolicyService([denying]);

    expect(service.can(ctx())).toMatchObject({ allowed: false, denialCode: "DENIED_BY_TEST" });
  });

  it("continues the chain past a non-terminal guard that allows", () => {
    const guard = fakeRule({ order: 10, terminal: false, evaluate: () => ({ allowed: true }) });
    const real = fakeRule({
      order: 20,
      evaluate: () => ({ allowed: false, denialCode: "REAL_DENIAL" }),
    });
    const service = new PermissionPolicyService([guard, real]);

    expect(service.can(ctx())).toMatchObject({ allowed: false, denialCode: "REAL_DENIAL" });
  });

  it("denies with NO_MATCHING_RULE when nothing applies", () => {
    const service = new PermissionPolicyService([fakeRule({ applies: () => false })]);
    expect(service.can(ctx())).toMatchObject({ allowed: false, denialCode: "NO_MATCHING_RULE" });
  });

  describe("assert", () => {
    it("does not throw when allowed", () => {
      const service = new PermissionPolicyService([fakeRule()]);
      expect(() => service.assert(ctx())).not.toThrow();
    });

    it("throws PermissionDeniedError carrying the denial code when not allowed", () => {
      const service = new PermissionPolicyService([
        fakeRule({ evaluate: () => ({ allowed: false, denialCode: "NOPE", message: "no" }) }),
      ]);

      try {
        service.assert(ctx());
        expect.unreachable();
      } catch (e) {
        expect(e).toBeInstanceOf(PermissionDeniedError);
        expect((e as PermissionDeniedError).code).toBe("NOPE");
      }
    });
  });
});
