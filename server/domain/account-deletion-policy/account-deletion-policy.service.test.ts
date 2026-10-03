import { describe, expect, it } from "vitest";
import { AccountDeletionPolicyService } from "@server/domain/account-deletion-policy/account-deletion-policy.service";
import { PlatformOwnerGuardRule } from "@server/domain/account-deletion-policy/rules/platform-owner-guard.rule";
import { StaffRoleGuardRule } from "@server/domain/account-deletion-policy/rules/staff-role-guard.rule";
import { StaffFootprintGuardRule } from "@server/domain/account-deletion-policy/rules/staff-footprint-guard.rule";
import { ActiveOrdersGuardRule } from "@server/domain/account-deletion-policy/rules/active-orders-guard.rule";
import { CustomerAccountRule } from "@server/domain/account-deletion-policy/rules/customer-account.rule";
import type { AccountDeletionContext } from "@server/ports/account-deletion-policy.port";
import type { UserRole } from "@shared/contracts/user";

function makePolicy() {
  // Deliberately registered out of order — the engine sorts by `order`.
  return new AccountDeletionPolicyService([
    new CustomerAccountRule(),
    new ActiveOrdersGuardRule(),
    new StaffFootprintGuardRule(),
    new StaffRoleGuardRule(),
    new PlatformOwnerGuardRule(),
  ]);
}

function customer(overrides: Partial<AccountDeletionContext> = {}): AccountDeletionContext {
  return {
    ownershipRole: null,
    accessRoles: ["customer"],
    rbacRoleCount: 0,
    adminScopeCount: 0,
    hasStaffFootprint: false,
    activeOrderCount: 0,
    ...overrides,
  };
}

describe("AccountDeletionPolicyService", () => {
  it("allows a plain customer with no active orders", () => {
    expect(makePolicy().can(customer())).toEqual({ allowed: true });
  });

  it("allows a customer without any user_roles row", () => {
    expect(makePolicy().can(customer({ accessRoles: [] })).allowed).toBe(true);
  });

  it.each(["ROOT_OWNER", "OWNER"] as const)("denies the platform %s", (ownershipRole) => {
    const result = makePolicy().can(customer({ ownershipRole }));
    expect(result).toMatchObject({ allowed: false, denialCode: "STAFF_ACCOUNT" });
  });

  it.each<UserRole>(["admin", "warehouse", "courier", "seller"])(
    "denies a %s (staff access role next to customer)",
    (role) => {
      const result = makePolicy().can(customer({ accessRoles: ["customer", role] }));
      expect(result).toMatchObject({ allowed: false, denialCode: "STAFF_ACCOUNT" });
    },
  );

  it("denies any RBAC role holder (every RBAC role is an administration role)", () => {
    const result = makePolicy().can(customer({ rbacRoleCount: 1 }));
    expect(result).toMatchObject({ allowed: false, denialCode: "STAFF_ACCOUNT" });
  });

  it("denies an admin-scope holder", () => {
    const result = makePolicy().can(customer({ adminScopeCount: 1 }));
    expect(result).toMatchObject({ allowed: false, denialCode: "STAFF_ACCOUNT" });
  });

  it("denies a former staff member still referenced by operational records", () => {
    const result = makePolicy().can(customer({ hasStaffFootprint: true }));
    expect(result).toMatchObject({ allowed: false, denialCode: "STAFF_ACCOUNT" });
  });

  it("denies a customer with an active order", () => {
    const result = makePolicy().can(customer({ activeOrderCount: 2 }));
    expect(result).toMatchObject({ allowed: false, denialCode: "ACTIVE_ORDERS" });
  });

  it("reports STAFF_ACCOUNT before ACTIVE_ORDERS when both apply", () => {
    const result = makePolicy().can(
      customer({
        ownershipRole: "ROOT_OWNER",
        accessRoles: ["customer", "admin"],
        activeOrderCount: 1,
      }),
    );
    expect(result.denialCode).toBe("STAFF_ACCOUNT");
  });

  it("denies with NO_MATCHING_RULE when no terminal rule is registered", () => {
    const policy = new AccountDeletionPolicyService([new ActiveOrdersGuardRule()]);
    expect(policy.can(customer())).toMatchObject({
      allowed: false,
      denialCode: "NO_MATCHING_RULE",
    });
  });
});
