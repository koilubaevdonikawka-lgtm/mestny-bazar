import { describe, expect, it, vi } from "vitest";
import { RbacService } from "@server/domain/rbac.service";
import {
  RbacRoleNotFoundError,
  SystemPermissionImmutableError,
  SystemRoleImmutableError,
} from "@server/domain/rbac.errors";
import type { IRbacRepository } from "@server/ports/rbac.repository";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { AuditRecord, IAuditLog } from "@server/ports/audit-log.port";
import type {
  RbacPermissionDTO,
  RoleWithPermissionsDTO,
  UserRoleAssignmentDTO,
} from "@shared/contracts/rbac";

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

/** Задача №306 — .list() ordered most-recent-first, matching SupabaseAuditLog's real contract (see that file's own `.order("occurred_at", { ascending: false })`), since revokeRole()'s cleanup logic depends on that order. */
function fakeAuditLog(records: AuditRecord[] = []): IAuditLog {
  return {
    append: vi.fn(async () => {}),
    list: vi.fn(async () => ({
      items: records,
      total: records.length,
      page: 1,
      pageSize: 25,
      hasMore: false,
    })),
  };
}

/** Defaults payload to { role: "admin" } — every pre-existing (Задача №306) test targets the admin sync; warehouse-specific tests (Задача №307) override it explicitly. */
function makeAuditRecord(overrides: Partial<AuditRecord> = {}): AuditRecord {
  return {
    id: "record-1",
    action: "role.assigned_via_rbac_sync",
    occurredAt: new Date().toISOString(),
    entityType: "user",
    entityId: "user-1",
    actorId: null,
    payload: { role: "admin" },
    ...overrides,
  };
}

function fakeUserAdminRepo(overrides: Partial<IUserAdminRepository> = {}): IUserAdminRepository {
  return {
    listUsers: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    assignRole: vi.fn(),
    revokeRole: vi.fn(),
    assignScope: vi.fn(),
    revokeScope: vi.fn(),
    setBlocked: vi.fn(),
    ...overrides,
  };
}

describe("RbacService role CRUD", () => {
  it("createRole rejects a name shorter than 2 characters", async () => {
    const rbac = fakeRbacRepo();
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

    await expect(service.createRole({ name: "A" })).rejects.toThrow();
    expect(rbac.createRole).not.toHaveBeenCalled();
  });

  it("createRole publishes rbac.role.created", async () => {
    const rbac = fakeRbacRepo({ createRole: vi.fn(async () => makeRole({ id: "role-2" })) });
    const events = fakeEventBus();
    const service = new RbacService(rbac, events, fakeUserAdminRepo(), fakeAuditLog());

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
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

    await expect(service.updateRole({ id: "role-1", name: "Другое имя" })).rejects.toBeInstanceOf(
      SystemRoleImmutableError,
    );
    expect(rbac.updateRole).not.toHaveBeenCalled();
  });

  it("updateRole allows editing a system role's description (rename-only guard)", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ isSystem: true, name: "Администратор" })),
    });
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

    await service.updateRole({ id: "role-1", description: "Новое описание" });

    expect(rbac.updateRole).toHaveBeenCalled();
  });

  it("deleteRole throws SystemRoleImmutableError for a system role", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ isSystem: true })) });
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

    await expect(service.deleteRole("role-1")).rejects.toBeInstanceOf(SystemRoleImmutableError);
    expect(rbac.deleteRole).not.toHaveBeenCalled();
  });

  it("deleteRole succeeds and publishes rbac.role.deleted for a non-system role", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ isSystem: false })) });
    const events = fakeEventBus();
    const service = new RbacService(rbac, events, fakeUserAdminRepo(), fakeAuditLog());

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
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

    await expect(service.getRole("missing")).rejects.toBeInstanceOf(RbacRoleNotFoundError);
  });
});

describe("RbacService permission CRUD", () => {
  it("deletePermission throws SystemPermissionImmutableError for a system permission", async () => {
    const rbac = fakeRbacRepo({
      getPermission: vi.fn(async () => makePermission({ isSystem: true })),
    });
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

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
    const service = new RbacService(rbac, events, fakeUserAdminRepo(), fakeAuditLog());

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
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

    const result = await service.hasPermission("user-1", "couriers", "view");

    expect(result).toBe(true);
    expect(rbac.hasPermission).toHaveBeenCalledWith("user-1", "couriers", "view");
  });
});

describe("RbacService.assignRole / revokeRole", () => {
  it("assignRole rejects when the role does not exist", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => null) });
    const service = new RbacService(rbac, fakeEventBus(), fakeUserAdminRepo(), fakeAuditLog());

    await expect(
      service.assignRole({ userId: "user-1", roleId: "missing" }, "admin-1"),
    ).rejects.toBeInstanceOf(RbacRoleNotFoundError);
    expect(rbac.assignRole).not.toHaveBeenCalled();
  });

  it("assignRole publishes rbac.role.assigned", async () => {
    const rbac = fakeRbacRepo();
    const events = fakeEventBus();
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, events, userAdmin, fakeAuditLog());

    await service.assignRole({ userId: "user-1", roleId: "role-1" }, "admin-1");

    expect(rbac.assignRole).toHaveBeenCalledWith("user-1", "role-1", "admin-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "rbac.role.assigned",
      userId: "user-1",
      roleId: "role-1",
    });
    // makeRole()'s default name is "Менеджер" — an operational subset role,
    // not one of the two that mean "grant base /admin access" (see below).
    expect(userAdmin.assignRole).not.toHaveBeenCalled();
  });

  it("revokeRole publishes rbac.role.revoked", async () => {
    const rbac = fakeRbacRepo();
    const events = fakeEventBus();
    const service = new RbacService(rbac, events, fakeUserAdminRepo(), fakeAuditLog());

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(rbac.revokeRole).toHaveBeenCalledWith("user-1", "role-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "rbac.role.revoked",
      userId: "user-1",
      roleId: "role-1",
    });
  });
});

// Задача №259 — regression coverage for the diagnosed bug: assigning the
// "Администратор"/"Суперадминистратор" RBAC role via /admin/permissions
// left the target user still locked out of /admin entirely, because that
// UI only ever wrote to rbac_user_roles, never to the separate user_roles
// table that RoleResolutionService actually checks for /admin access.
describe("RbacService.assignRole — user_roles admin sync (Задача №259)", () => {
  it("also grants legacy user_roles 'admin' when the RBAC role is \"Администратор\"", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ name: "Администратор" })) });
    const events = fakeEventBus();
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, events, userAdmin, fakeAuditLog());

    await service.assignRole({ userId: "user-1", roleId: "role-1" }, "admin-1");

    expect(userAdmin.assignRole).toHaveBeenCalledWith("user-1", "admin");
    // Задача №306 — role.assigned_via_rbac_sync, not the plain role.assigned
    // a direct /admin/users grant publishes: see that event's own doc
    // comment (marketplace-events.port.ts) for why the two must stay distinct.
    expect(events.publish).toHaveBeenCalledWith({
      type: "role.assigned_via_rbac_sync",
      userId: "user-1",
      role: "admin",
      sourceRoleId: "role-1",
    });
  });

  it("also grants legacy user_roles 'admin' when the RBAC role is \"Суперадминистратор\"", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Суперадминистратор" })),
    });
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, fakeAuditLog());

    await service.assignRole({ userId: "user-1", roleId: "role-1" }, "admin-1");

    expect(userAdmin.assignRole).toHaveBeenCalledWith("user-1", "admin");
  });

  // "Склад" is deliberately excluded here since Задача №307 — it now syncs
  // to legacy 'warehouse', covered in its own describe block below, not
  // "no legacy role at all" like the four genuinely-operational-only ones.
  it.each(["Менеджер", "Оператор", "Курьер", "Поддержка"])(
    'does NOT touch user_roles for the operational role "%s" — it never grants standalone /admin OR /warehouse access',
    async (roleName) => {
      const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ name: roleName })) });
      const userAdmin = fakeUserAdminRepo();
      const service = new RbacService(rbac, fakeEventBus(), userAdmin, fakeAuditLog());

      await service.assignRole({ userId: "user-1", roleId: "role-1" }, "admin-1");

      expect(userAdmin.assignRole).not.toHaveBeenCalled();
    },
  );

  it("revokeRole does not touch user_roles for an operational role (Оператор etc.) — irrelevant to legacy admin either way", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ name: "Оператор" })) });
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, fakeAuditLog());

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });
});

// Задача №306 — regression coverage for the incident this fixes: revoking
// "Администратор"/"Суперадминистратор" must now clean up the legacy
// user_roles 'admin' row the sync itself created, but ONLY when nothing
// else could plausibly justify keeping it — see revokeRole()'s own doc
// comment for the exact three conditions.
describe("RbacService.revokeRole — user_roles admin cleanup (Задача №306)", () => {
  it("removes the legacy admin row when the sync granted it and nothing has touched it since", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Администратор" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const events = fakeEventBus();
    const userAdmin = fakeUserAdminRepo();
    const auditLog = fakeAuditLog([
      makeAuditRecord({
        action: "role.assigned_via_rbac_sync",
        occurredAt: "2026-09-05T04:33:55Z",
      }),
    ]);
    const service = new RbacService(rbac, events, userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).toHaveBeenCalledWith("user-1", "admin");
    expect(events.publish).toHaveBeenCalledWith({
      type: "role.revoked_via_rbac_sync_cleanup",
      userId: "user-1",
      role: "admin",
    });
  });

  it("leaves the legacy admin row alone when a human granted it directly via /admin/users AFTER the sync", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Администратор" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const userAdmin = fakeUserAdminRepo();
    // Most-recent-first: the direct /admin/users grant (plain "role.assigned")
    // is newer than the sync's own record — a human's later, explicit
    // decision always wins.
    const auditLog = fakeAuditLog([
      makeAuditRecord({ action: "role.assigned", occurredAt: "2026-09-06T00:00:00Z" }),
      makeAuditRecord({
        action: "role.assigned_via_rbac_sync",
        occurredAt: "2026-09-05T04:33:55Z",
      }),
    ]);
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });

  it("leaves a pre-existing legacy admin row alone when there is no audit history for it at all", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Администратор" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, fakeAuditLog([]));

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });

  it("leaves the legacy admin row alone when the user still holds another admin-workspace RBAC role", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Администратор" })),
      listUserRoleAssignments: vi.fn(async (): Promise<UserRoleAssignmentDTO[]> => [
        {
          userId: "user-1",
          roleId: "role-2",
          roleName: "Суперадминистратор",
          assignedAt: "2026-09-01T00:00:00Z",
        },
      ]),
    });
    const userAdmin = fakeUserAdminRepo();
    const auditLog = fakeAuditLog([makeAuditRecord({ action: "role.assigned_via_rbac_sync" })]);
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });

  it("leaves the legacy admin row alone when the most recent record is already a previous cleanup (nothing to redo)", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Администратор" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const userAdmin = fakeUserAdminRepo();
    const auditLog = fakeAuditLog([
      makeAuditRecord({ action: "role.revoked_via_rbac_sync_cleanup" }),
      makeAuditRecord({ action: "role.assigned_via_rbac_sync" }),
    ]);
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });
});

// Задача №307 — "Склад" (the real rbac_roles.name — the UI may gloss it as
// "Складской работник") previously had NO connection to legacy
// user_roles 'warehouse' at all: assigning it in "Право доступа" did
// nothing, unlike admin's case (Задача №259) where a sync existed but
// wasn't symmetric (Задача №306). Same LEGACY_ROLE_SYNCS mechanism,
// exercised here for the warehouse branch specifically — mirrors the admin
// describe blocks above test-for-test.
describe("RbacService.assignRole — user_roles warehouse sync (Задача №307)", () => {
  it("grants legacy user_roles 'warehouse' when the RBAC role is \"Склад\"", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ name: "Склад" })) });
    const events = fakeEventBus();
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, events, userAdmin, fakeAuditLog());

    await service.assignRole({ userId: "user-1", roleId: "role-1" }, "admin-1");

    expect(userAdmin.assignRole).toHaveBeenCalledWith("user-1", "warehouse");
    expect(events.publish).toHaveBeenCalledWith({
      type: "role.assigned_via_rbac_sync",
      userId: "user-1",
      role: "warehouse",
      sourceRoleId: "role-1",
    });
  });

  it("assigning \"Склад\" never touches legacy 'admin' — the two workspaces stay independent", async () => {
    const rbac = fakeRbacRepo({ getRole: vi.fn(async () => makeRole({ name: "Склад" })) });
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, fakeAuditLog());

    await service.assignRole({ userId: "user-1", roleId: "role-1" }, "admin-1");

    expect(userAdmin.assignRole).toHaveBeenCalledTimes(1);
    expect(userAdmin.assignRole).not.toHaveBeenCalledWith("user-1", "admin");
  });
});

describe("RbacService.revokeRole — user_roles warehouse cleanup (Задача №307)", () => {
  it("removes the legacy warehouse row when the sync granted it and nothing has touched it since", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Склад" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const events = fakeEventBus();
    const userAdmin = fakeUserAdminRepo();
    const auditLog = fakeAuditLog([
      makeAuditRecord({ action: "role.assigned_via_rbac_sync", payload: { role: "warehouse" } }),
    ]);
    const service = new RbacService(rbac, events, userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).toHaveBeenCalledWith("user-1", "warehouse");
    expect(events.publish).toHaveBeenCalledWith({
      type: "role.revoked_via_rbac_sync_cleanup",
      userId: "user-1",
      role: "warehouse",
    });
  });

  it("leaves the legacy warehouse row alone when a human granted it directly via /admin/users AFTER the sync", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Склад" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const userAdmin = fakeUserAdminRepo();
    const auditLog = fakeAuditLog([
      makeAuditRecord({
        action: "role.assigned",
        payload: { role: "warehouse" },
        occurredAt: "2026-09-06T00:00:00Z",
      }),
      makeAuditRecord({
        action: "role.assigned_via_rbac_sync",
        payload: { role: "warehouse" },
        occurredAt: "2026-09-05T00:00:00Z",
      }),
    ]);
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });

  it("leaves a pre-existing legacy warehouse row alone when there is no audit history for it at all", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Склад" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const userAdmin = fakeUserAdminRepo();
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, fakeAuditLog([]));

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });

  it("leaves the legacy warehouse row alone when the most recent record is already a previous cleanup", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Склад" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const userAdmin = fakeUserAdminRepo();
    const auditLog = fakeAuditLog([
      makeAuditRecord({
        action: "role.revoked_via_rbac_sync_cleanup",
        payload: { role: "warehouse" },
      }),
      makeAuditRecord({ action: "role.assigned_via_rbac_sync", payload: { role: "warehouse" } }),
    ]);
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });

  it("does not remove legacy warehouse for a user's OTHER sync history — 'admin' events for the same user never justify touching 'warehouse'", async () => {
    const rbac = fakeRbacRepo({
      getRole: vi.fn(async () => makeRole({ name: "Склад" })),
      listUserRoleAssignments: vi.fn(async () => []),
    });
    const userAdmin = fakeUserAdminRepo();
    // This user's most recent record is an ADMIN sync grant — irrelevant to
    // the warehouse row being revoked here. No warehouse-specific history
    // at all means "leave it alone", exactly like the no-history case above.
    const auditLog = fakeAuditLog([
      makeAuditRecord({ action: "role.assigned_via_rbac_sync", payload: { role: "admin" } }),
    ]);
    const service = new RbacService(rbac, fakeEventBus(), userAdmin, auditLog);

    await service.revokeRole({ userId: "user-1", roleId: "role-1" });

    expect(userAdmin.revokeRole).not.toHaveBeenCalled();
  });
});
