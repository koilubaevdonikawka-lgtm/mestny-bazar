import { describe, expect, it } from "vitest";
import {
  mapDeletionContext,
  mapEraseResult,
} from "@server/adapters/supabase/account-deletion.repository";

describe("mapDeletionContext", () => {
  it("maps the RPC jsonb (bigint counts may arrive as strings)", () => {
    expect(
      mapDeletionContext({
        ownershipRole: null,
        accessRoles: ["customer", "courier"],
        rbacRoleCount: "1",
        adminScopeCount: 0,
        hasStaffFootprint: true,
        activeOrderCount: 3,
      }),
    ).toEqual({
      ownershipRole: null,
      accessRoles: ["customer", "courier"],
      rbacRoleCount: 1,
      adminScopeCount: 0,
      hasStaffFootprint: true,
      activeOrderCount: 3,
    });
  });

  it("maps the platform ownership role", () => {
    expect(mapDeletionContext({ ownershipRole: "ROOT_OWNER" }).ownershipRole).toBe("ROOT_OWNER");
    expect(mapDeletionContext({ ownershipRole: "OWNER" }).ownershipRole).toBe("OWNER");
  });

  it("maps a missing payload to an empty context", () => {
    expect(mapDeletionContext(null)).toEqual({
      ownershipRole: null,
      accessRoles: [],
      rbacRoleCount: 0,
      adminScopeCount: 0,
      hasStaffFootprint: false,
      activeOrderCount: 0,
    });
  });
});

describe("mapEraseResult", () => {
  it.each(["ERASED", "STAFF_ACCOUNT", "ACTIVE_ORDERS"] as const)("accepts %s", (value) => {
    expect(mapEraseResult(value)).toBe(value);
  });

  it("throws on anything else instead of treating it as success", () => {
    expect(() => mapEraseResult("OK")).toThrow("Unexpected erase_customer_account_data result");
    expect(() => mapEraseResult(null)).toThrow();
  });
});
