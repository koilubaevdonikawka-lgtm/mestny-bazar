import { describe, expect, it, vi } from "vitest";
import { RbacService } from "@server/domain/rbac.service";
import {
  RbacRoleNotFoundError,
  SystemPermissionImmutableError,
  SystemRoleImmutableError,
} from "@server/domain/rbac.errors";
import type { IRbacRepository } from "@server/ports/rbac.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { RbacPermissionDTO, RoleWithPermissionsDTO } from "@shared/contracts/rbac";

function makeRole(overrides: Partial<RoleWithPermissionsDTO> = {}): RoleWithPermissionsDTO {
  return {
    id: "role-1",
    name: "Менеджер",
    description: null,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permissions: [],
    ...overrides,
  };
}

function makePermission(overrides: Partial<RbacPermissionDTO> = {}): RbacPermissionDTO {
  return {
    id: "perm-1",
    module: "couriers",
    action: "view",
    description: null,
    isSystem: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakeRbacRepo(overrides: Partial<IRbacRepository> = {}): IRbacRepository {
  return {
    listRoles: vi.fn(async () => []),
    getRole: vi.fn(async () => makeRole()),
    createRole: vi.fn(async () => makeRole()),
    updateRole: vi.fn(async () => makeRole()),
    deleteRole: vi.fn(),
    listPermissions: vi.fn(async () => []),
    getPermission: vi.fn(async () => makePermission()),
    createPermission: vi.fn(async () => makePermission()),
    updatePermission: vi.fn(async () => makePermission()),
    deletePermission: vi.fn(),
    setRolePermissions: vi.fn(),
    listUserRoleAssignments: vi.fn(async () => []),
    assignRole: vi.fn(),
    revokeRole: vi.fn(),
    hasPermission: vi.fn(async () => false),
    ...overrides,
  } as IRbacRepository;
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("RbacService role CRUD", () => {
  it("createRole rejects a name shorter than 2 characters", async () => {
    const rbac = fakeRbacRepo();
    const service = new RbacService(rbac, fakeEventBus());

    await expect(service.createRole({ name: "A" })).rejects.toThrow();
    expect(rbac.createRole).not.toHaveBeenCalled();
  });

  it("createRole publishes rbac.role.created", async () => {
    const rbac = fakeRbacRepo({ createRole: vi.fn(async () => makeRole({ id: "role-2" })) });
    const events = fakeEventBus();
    const service = new RbacService(rbac, events);

    await service.createRole({ name: "Оператор" });

    expect(events.publish).toHaveBeenCalledWith({
      type: "rbac.role.created",
      roleId: "role-2",
      name: "Менеджер",
    });
  });

  it("updateRole throws SystemRoleImmutableError when renaming a system role", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ isSystem: true, name: "Суперадминистратор" })),
    });
    const service = new RbacService(rbac, fakeEventBus());

    await expect(service.updateRole({ id: "role-1", name: "Другое имя" })).rejects.toBeInstanceOf(
      SystemRoleImmutableError,
    );
    expect(rbac.updateRole).not.toHaveBeenCalled();
  });

  it("updateRole allows editing a system role's description (rename-only guard)", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ isSystem: true, name: "Администратор" })),
    });
    const service = new RbacService(rbac, fakeEventBus());

    await service.updateRole({ id: "role-1", description: "Новое описание" });

    expect(rbac.updateRole).toHaveBeenCalled();
  });

  it("deleteRole throws SystemRoleImmutableError for a system role", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ isSystem: true })) });
    const service = new RbacService(rbac, fakeEventBus());

    await expect(service.deleteRole("role-1")).rejects.toBeInstanceOf(SystemRoleImmutableError);
    expect(rbac.deleteRole).not.toHaveBeenCalled();
  });

  it("deleteRole succeeds and publishes rbac.role.deleted for a non-system role", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ isSystem: false })) });
    const events = fakeEventBus();
    const service = new RbacService(rbac, events);

    await service.deleteRole("role-1");

    expect(rbac.deleteRole).toHaveBeenCalledWith("role-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "rbac.role.deleted",
      roleId: "role-1",
      name: "Менеджер",
    });
  });

  it("getRole throws RbacRoleNotFoundError when missing", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => null) });
    const service = new RbacService(rbac, fakeEventBus());

    await expect(service.getRole("missing")).rejects.toBeInstanceOf(RbacRoleNotFoundError);
  });
});

describe("RbacService permission CRUD", () => {
  it("deletePermission throws SystemPermissionImmutableError for a system permission", async () => {
    const rbac = fakeRbacRepo({
      getPermission: vi.fn(async () => makePermission({ isSystem: true })),
    });
    const service = new RbacService(rbac, fakeEventBus());

    await expect(service.deletePermission("perm-1")).rejects.toBeInstanceOf(
      SystemPermissionImmutableError,
    );
    expect(rbac.deletePermission).not.toHaveBeenCalled();
  });

  it("deletePermission succeeds for a non-system permission", async () => {
    const rbac = fakeRbacRepo({
      getPermission: vi.fn(async () => makePermission({ isSystem: false })),
    });
    const events = fakeEventBus();
    const service = new RbacService(rbac, events);

    await service.deletePermission("perm-1");

    expect(rbac.deletePermission).toHaveBeenCalledWith("perm-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "rbac.permission.deleted",
      permissionId: "perm-1",
      module: "couriers",
      action: "view",
    });
  });
});

describe("RbacService.hasPermission", () => {
  it("delegates straight to the repository", async () => {
    const rbac = fakeRbacRepo({ hasPermission: vi.fn(async () => true) });
    const service = new RbacService(rbac, fakeEventBus());

    const result = await service.hasPermission("user-1", "couriers", "view");

    expect(result).toBe(true);
    expect(rbac.hasPermission).toHaveBeenCalledWith("user-1", "couriers", "view");
  });
});

describe("RbacService.assignRole / revokeRole", () => {
  it("assignRole rejects when the role does not exist", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => null) });
    const service = new RbacService(rbac, fakeEventBus());

    await expect(
      service.assignRole({ userId: "user-1", roleId: "missing" }, "admin-1"),
    ).rejects.toBeInstanceOf(RbacRoleNotFoundError);
    expect(rbac.assignRole).not.toHaveBeenCalled();
  });

  it("assignRole publishes rbac.role.assigned", async () => {
    const rbac = fakeRbacRepo();
    const events = fakeEventBus();
    const service = new RbacService(rbac, events);

    await service.assignRole({ userId: "user-1", roleId: "role-1" }, "admin-1");

    expect(rbac.assignRole).toHaveBeenCalledWith("user-1", "role-1", "admin-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "rbac.role.assigned",
      userId: "user-1",
      roleId: "role-1",
    });
  });

  it("revokeRole publishes rbac.role.revoked", async () => {
    const rbac = fakeRbacRepo();
    const events = fakeEventBus();
    const service = new RbacService(rbac, events);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(rbac.revokeRole).toHaveBeenCalledWith("user-1", "role-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "rbac.role.revoked",
      userId: "user-1",
      roleId: "role-1",
    });
  });
});
