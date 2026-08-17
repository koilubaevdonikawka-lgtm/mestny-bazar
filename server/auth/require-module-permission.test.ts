import { afterEach, describe, expect, it, vi } from "vitest";

const { getServices } = vi.hoisted(() => ({ getServices: vi.fn() }));
vi.mock("@server/di/container", () => ({ getServices }));

const { requireModulePermission } = await import("@server/auth/require-module-permission");

describe("requireModulePermission", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("resolves without throwing when the RBAC service grants the permission", async () => {
    const hasPermission = vi.fn(async () => true);
    getServices.mockReturnValue({ rbacService: { hasPermission } });

    await expect(requireModulePermission("user-1", "couriers", "view")).resolves.toBeUndefined();
    expect(hasPermission).toHaveBeenCalledWith("user-1", "couriers", "view");
  });

  it("throws PermissionDeniedError with a 'Permission denied' message when not granted", async () => {
    const hasPermission = vi.fn(async () => false);
    getServices.mockReturnValue({ rbacService: { hasPermission } });

    await expect(requireModulePermission("user-1", "couriers", "edit")).rejects.toThrow(
      /Permission denied/,
    );
  });
});
