import { describe, expect, it } from "vitest";
import { AdminFinanceScopeRule } from "@server/domain/permission-policy/rules/admin-finance-scope.rule";
import { AdminMarketingScopeRule } from "@server/domain/permission-policy/rules/admin-marketing-scope.rule";
import { AdminFullAccessRule } from "@server/domain/permission-policy/rules/admin-full-access.rule";
import { PermissionPolicyService } from "@server/domain/permission-policy/permission-policy.service";
import type { PermissionActor, PermissionContext } from "@server/ports/permission-policy.port";

function ctx(overrides: Partial<PermissionContext> = {}): PermissionContext {
  return { actor: { id: "admin-1", roles: ["admin"] }, module: "settings", ...overrides };
}

describe("AdminFinanceScopeRule", () => {
  const rule = new AdminFinanceScopeRule();

  it("does not apply to an admin without the finance scope", () => {
    expect(rule.applies(ctx({ actor: { id: "a", roles: ["admin"], scopes: [] } }))).toBe(false);
    expect(rule.applies(ctx({ actor: { id: "a", roles: ["admin"] } }))).toBe(false);
  });

  it("does not apply to a non-admin even with the finance scope", () => {
    expect(rule.applies(ctx({ actor: { id: "a", roles: ["seller"], scopes: ["finance"] } }))).toBe(
      false,
    );
  });

  it("applies to an admin carrying the finance scope", () => {
    expect(rule.applies(ctx({ actor: { id: "a", roles: ["admin"], scopes: ["finance"] } }))).toBe(
      true,
    );
  });

  it("allows modules in the finance allowlist, denies others", () => {
    const actor: PermissionActor = { id: "a", roles: ["admin"], scopes: ["finance"] };
    expect(rule.evaluate(ctx({ actor, module: "finance" }))).toEqual({ allowed: true });
    expect(rule.evaluate(ctx({ actor, module: "analytics" }))).toEqual({ allowed: true });
    expect(rule.evaluate(ctx({ actor, module: "marketing" }))).toMatchObject({
      allowed: false,
      denialCode: "OUT_OF_SCOPE",
    });
  });
});

describe("AdminMarketingScopeRule", () => {
  const rule = new AdminMarketingScopeRule();

  it("applies only to an admin carrying the marketing scope", () => {
    expect(rule.applies(ctx({ actor: { id: "a", roles: ["admin"], scopes: ["marketing"] } }))).toBe(
      true,
    );
    expect(rule.applies(ctx({ actor: { id: "a", roles: ["admin"], scopes: ["finance"] } }))).toBe(
      false,
    );
  });

  it("allows modules in the marketing allowlist, denies others", () => {
    const actor: PermissionActor = { id: "a", roles: ["admin"], scopes: ["marketing"] };
    expect(rule.evaluate(ctx({ actor, module: "marketing" }))).toEqual({ allowed: true });
    expect(rule.evaluate(ctx({ actor, module: "finance" }))).toMatchObject({
      allowed: false,
      denialCode: "OUT_OF_SCOPE",
    });
  });
});

describe("scope rules composed with AdminFullAccessRule in PermissionPolicyService", () => {
  const service = new PermissionPolicyService([
    new AdminFinanceScopeRule(),
    new AdminMarketingScopeRule(),
    new AdminFullAccessRule(),
  ]);

  it("a plain (unscoped) admin still gets full access — Stage 1 behavior is unaffected", () => {
    const actor: PermissionActor = { id: "a", roles: ["admin"] };
    expect(service.can({ actor, module: "settings" })).toEqual({ allowed: true });
    expect(service.can({ actor, module: "users" })).toEqual({ allowed: true });
  });

  it("an admin-finance scoped actor is denied a module outside their scope, even though they hold the admin role", () => {
    const actor: PermissionActor = { id: "a", roles: ["admin"], scopes: ["finance"] };
    expect(service.can({ actor, module: "users" })).toMatchObject({
      allowed: false,
      denialCode: "OUT_OF_SCOPE",
    });
  });

  it("an admin-finance scoped actor is allowed a module inside their scope", () => {
    const actor: PermissionActor = { id: "a", roles: ["admin"], scopes: ["finance"] };
    expect(service.can({ actor, module: "finance" })).toEqual({ allowed: true });
  });

  it("a non-admin is still denied regardless of scopes", () => {
    const actor: PermissionActor = { id: "a", roles: ["customer"] };
    expect(service.can({ actor, module: "settings" }).allowed).toBe(false);
  });
});
