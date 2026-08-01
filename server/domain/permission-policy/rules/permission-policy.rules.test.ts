import { describe, expect, it } from "vitest";
import type { PermissionContext } from "@server/ports/permission-policy.port";
import { AdminFullAccessRule } from "@server/domain/permission-policy/rules/admin-full-access.rule";

function ctx(overrides: Partial<PermissionContext> = {}): PermissionContext {
  return {
    actor: { id: "user-1", roles: [] },
    module: "settings",
    ...overrides,
  };
}

describe("AdminFullAccessRule", () => {
  const rule = new AdminFullAccessRule();

  it("applies to every context (checks the role itself, not a specific reason/module)", () => {
    expect(rule.applies(ctx())).toBe(true);
    expect(rule.applies(ctx({ module: "orders" }))).toBe(true);
  });

  it("allows an actor with the admin role", () => {
    const result = rule.evaluate(ctx({ actor: { id: "a1", roles: ["admin"] } }));
    expect(result.allowed).toBe(true);
  });

  it("allows an actor with admin among several roles", () => {
    const result = rule.evaluate(ctx({ actor: { id: "a1", roles: ["seller", "admin"] } }));
    expect(result.allowed).toBe(true);
  });

  it("denies an actor without the admin role", () => {
    const result = rule.evaluate(ctx({ actor: { id: "u1", roles: ["customer"] } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "ADMIN_ROLE_REQUIRED" });
  });

  it("denies an actor with no roles at all", () => {
    const result = rule.evaluate(ctx({ actor: { id: "u1", roles: [] } }));
    expect(result).toMatchObject({ allowed: false, denialCode: "ADMIN_ROLE_REQUIRED" });
  });
});
