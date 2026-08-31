import { afterEach, describe, expect, it, vi } from "vitest";

const { getServices } = vi.hoisted(() => ({ getServices: vi.fn() }));

vi.mock("@server/di/container", () => ({ getServices }));

const { assertMarketingAccess } = await import("@server/auth/assert-marketing-access");

describe("assertMarketingAccess", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("looks up the acting admin's real admin_scopes and passes them into the policy check — the fix for the previous shortcut (scopes always undefined)", async () => {
    const getUser = vi.fn(async () => ({
      id: "admin-1",
      fullName: "Admin",
      phone: null,
      roles: ["admin"],
      adminScopes: ["marketing"],
      isBlocked: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    }));
    const assert = vi.fn();
    getServices.mockReturnValue({
      userAdminService: { getUser },
      permissionPolicy: { assert },
    });

    await assertMarketingAccess("admin-1", ["admin"]);

    expect(getUser).toHaveBeenCalledWith("admin-1");
    expect(assert).toHaveBeenCalledWith({
      actor: { id: "admin-1", roles: ["admin"], scopes: ["marketing"] },
      module: "marketing",
    });
  });

  it("passes scopes: undefined (not a crash) when userAdminService.getUser returns null", async () => {
    const getUser = vi.fn(async () => null);
    const assert = vi.fn();
    getServices.mockReturnValue({
      userAdminService: { getUser },
      permissionPolicy: { assert },
    });

    await assertMarketingAccess("admin-1", ["admin"]);

    expect(assert).toHaveBeenCalledWith({
      actor: { id: "admin-1", roles: ["admin"], scopes: undefined },
      module: "marketing",
    });
  });

  it("propagates a denial thrown by the policy (e.g. a finance-scoped, non-marketing admin)", async () => {
    const getUser = vi.fn(async () => ({
      id: "admin-2",
      fullName: "Finance Admin",
      phone: null,
      roles: ["admin"],
      adminScopes: ["finance"],
      isBlocked: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    }));
    const assert = vi.fn(() => {
      throw new Error("Access to this Admin Platform module is not allowed");
    });
    getServices.mockReturnValue({
      userAdminService: { getUser },
      permissionPolicy: { assert },
    });

    await expect(assertMarketingAccess("admin-2", ["admin"])).rejects.toThrow(
      "Access to this Admin Platform module is not allowed",
    );
  });
});
