import { describe, expect, it, vi } from "vitest";
import { resolveWorkspaces } from "@server/domain/role-resolution.service";
import type { PlatformOwnershipService } from "@server/domain/platform-ownership.service";

const { resolveRolesForUser } = vi.hoisted(() => ({ resolveRolesForUser: vi.fn() }));
vi.mock("@server/auth/resolve-user", () => ({ resolveRolesForUser }));

const { RoleResolutionService } = await import("@server/domain/role-resolution.service");

describe("resolveWorkspaces (pure Workspace Selection logic)", () => {
  it("plain customer — only the customer workspace", () => {
    expect(resolveWorkspaces(["customer"], null)).toEqual(["customer"]);
  });

  it("admin — administration + customer", () => {
    expect(resolveWorkspaces(["admin", "customer"], null)).toEqual(["administration", "customer"]);
  });

  it("seller — seller + customer", () => {
    expect(resolveWorkspaces(["seller", "customer"], null)).toEqual(["seller", "customer"]);
  });

  it("courier — courier + customer", () => {
    expect(resolveWorkspaces(["courier", "customer"], null)).toEqual(["courier", "customer"]);
  });

  it("warehouse — warehouse + customer", () => {
    expect(resolveWorkspaces(["warehouse", "customer"], null)).toEqual(["warehouse", "customer"]);
  });

  it("Root Owner with no admin Access-role still resolves to administration (Ownership is independent of Access, PLATFORM_ACCESS_ARCHITECTURE.md §9)", () => {
    expect(resolveWorkspaces(["customer"], "ROOT_OWNER")).toEqual(["administration", "customer"]);
  });

  it("Owner with no admin Access-role also resolves to administration", () => {
    expect(resolveWorkspaces(["customer"], "OWNER")).toEqual(["administration", "customer"]);
  });

  it("multiple simultaneous roles resolve to multiple workspaces (multi-role is supported, not restricted to one)", () => {
    expect(resolveWorkspaces(["seller", "courier", "customer"], null)).toEqual([
      "seller",
      "courier",
      "customer",
    ]);
  });

  it("admin role and ROOT_OWNER ownership together still resolve to a single administration entry, not two", () => {
    const result = resolveWorkspaces(["admin", "customer"], "ROOT_OWNER");
    expect(result.filter((w) => w === "administration")).toHaveLength(1);
  });

  it("customer is always present, even for a fully-staffed multi-role account", () => {
    const result = resolveWorkspaces(
      ["admin", "seller", "courier", "warehouse", "customer"],
      "ROOT_OWNER",
    );
    expect(result).toContain("customer");
  });
});

describe("RoleResolutionService.resolveAccess", () => {
  it("combines Access-roles and Ownership into one profile without altering either source", async () => {
    resolveRolesForUser.mockResolvedValue(["admin", "customer"]);
    const platformOwnership = {
      getByUserId: vi.fn(async () => ({
        userId: "user-1",
        role: "ROOT_OWNER" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    } as unknown as PlatformOwnershipService;
    const service = new RoleResolutionService(platformOwnership);

    const profile = await service.resolveAccess("user-1");

    expect(resolveRolesForUser).toHaveBeenCalledWith("user-1");
    expect(platformOwnership.getByUserId).toHaveBeenCalledWith("user-1");
    expect(profile).toEqual({
      accessRoles: ["admin", "customer"],
      ownershipRole: "ROOT_OWNER",
      workspaces: ["administration", "customer"],
    });
  });

  it("returns ownershipRole null when no ownership record exists", async () => {
    resolveRolesForUser.mockResolvedValue(["customer"]);
    const platformOwnership = {
      getByUserId: vi.fn(async () => null),
    } as unknown as PlatformOwnershipService;
    const service = new RoleResolutionService(platformOwnership);

    const profile = await service.resolveAccess("user-2");

    expect(profile.ownershipRole).toBeNull();
    expect(profile.workspaces).toEqual(["customer"]);
  });
});
