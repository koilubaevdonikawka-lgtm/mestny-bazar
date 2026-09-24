import type { IRbacRepository } from "@server/ports/rbac.repository";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { IAuditLog } from "@server/ports/audit-log.port";
import type {
  AssignRoleRequest,
  CreatePermissionRequest,
  CreateRoleRequest,
  RbacAction,
  RbacModule,
  RbacPermissionDTO,
  RbacRoleDTO,
  RevokeRoleRequest,
  RoleWithPermissionsDTO,
  SetRolePermissionsRequest,
  UpdatePermissionRequest,
  UpdateRoleRequest,
  UserRoleAssignmentDTO,
} from "@shared/contracts/rbac";
import {
  RbacPermissionNotFoundError,
  RbacRoleNotFoundError,
  RbacValidationError,
  SystemPermissionImmutableError,
  SystemRoleImmutableError,
} from "@server/domain/rbac.errors";

// Задача №259 — the two system roles that mean "this person should have
// the platform's base admin workspace access", not just a finer-grained
// permission subset. Every requireModulePermission() call site (Couriers,
// this module's own mutations) is preceded by requireAdminFromRequest() in
// the same function — confirmed across every current call site — so no
// OTHER rbac role (Менеджер/Оператор/Склад/Курьер/Поддержка) is ever a
// standalone path to anything: they only narrow what an existing
// user_roles-admin may do. Syncing those too would over-grant full /admin
// login to someone meant to hold only a limited operational subset.
// Matched by name, not id: both are is_system=true rows, and updateRole()
// already refuses to rename a system role's `name` (SystemRoleImmutableError),
// so this mapping can't silently drift out of sync with the seed data.
const ADMIN_WORKSPACE_RBAC_ROLE_NAMES = new Set(["Администратор", "Суперадминистратор"]);

/**
 * Industrial RBAC domain service (Промпт №068). Entirely additive and
 * parallel to the existing app_role enum / PermissionPolicyService — never
 * consulted by them, never consulting them. hasPermission() is the single
 * function requireModulePermission() calls; every other method backs the
 * "Права доступа" admin UI (role CRUD, permission CRUD, matrix, assignment).
 *
 * Задача №259 — assignRole() below is the one exception to "never
 * consulted by them": when the role being assigned is "Администратор" or
 * "Суперадминистратор", it also grants the legacy user_roles 'admin' row
 * (via userAdmin, upsert/ignoreDuplicates — a no-op if already present).
 * Root cause this fixes: /admin's own access barrier
 * (RoleResolutionService) checks ONLY user_roles/platform_ownership, never
 * rbac_user_roles — an admin granting "Администратор" here previously left
 * the target still locked out of /admin entirely, despite the UI showing
 * the role as assigned. See docs from the Задача №259 diagnostic session.
 * revokeRole() deliberately does NOT mirror this in reverse — see its own
 * doc comment.
 */
export class RbacService {
  constructor(
    private readonly rbac: IRbacRepository,
    private readonly events: IMarketplaceEventBus,
    private readonly userAdmin: IUserAdminRepository,
    private readonly auditLog: IAuditLog,
  ) {}

  async listRoles(): Promise<RbacRoleDTO[]> {
    return this.rbac.listRoles();
  }

  async getRole(id: string): Promise<RoleWithPermissionsDTO> {
    const role = await this.rbac.getRole(id);
    if (!role) throw new RbacRoleNotFoundError();
    return role;
  }

  async createRole(data: CreateRoleRequest): Promise<RbacRoleDTO> {
    if (!data.name?.trim() || data.name.trim().length < 2) {
      throw new RbacValidationError("Role name must be at least 2 characters", "name");
    }
    const role = await this.rbac.createRole({ ...data, name: data.name.trim() });
    await this.events.publish({ type: "rbac.role.created", roleId: role.id, name: role.name });
    return role;
  }

  async updateRole(data: UpdateRoleRequest): Promise<RbacRoleDTO> {
    const existing = await this.rbac.getRole(data.id);
    if (!existing) throw new RbacRoleNotFoundError();
    if (existing.isSystem && data.name !== undefined && data.name.trim() !== existing.name) {
      throw new SystemRoleImmutableError();
    }
    if (data.name !== undefined && (!data.name.trim() || data.name.trim().length < 2)) {
      throw new RbacValidationError("Role name must be at least 2 characters", "name");
    }

    const role = await this.rbac.updateRole(data);
    await this.events.publish({ type: "rbac.role.updated", roleId: role.id, name: role.name });
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    const existing = await this.rbac.getRole(id);
    if (!existing) throw new RbacRoleNotFoundError();
    if (existing.isSystem) throw new SystemRoleImmutableError();

    await this.rbac.deleteRole(id);
    await this.events.publish({ type: "rbac.role.deleted", roleId: id, name: existing.name });
  }

  async listPermissions(): Promise<RbacPermissionDTO[]> {
    return this.rbac.listPermissions();
  }

  async createPermission(data: CreatePermissionRequest): Promise<RbacPermissionDTO> {
    if (!data.module?.trim()) throw new RbacValidationError("Module is required", "module");
    if (!data.action?.trim()) throw new RbacValidationError("Action is required", "action");

    const permission = await this.rbac.createPermission({
      module: data.module.trim(),
      action: data.action.trim(),
      description: data.description,
    });
    await this.events.publish({
      type: "rbac.permission.created",
      permissionId: permission.id,
      module: permission.module,
      action: permission.action,
    });
    return permission;
  }

  async updatePermission(data: UpdatePermissionRequest): Promise<RbacPermissionDTO> {
    const existing = await this.rbac.getPermission(data.id);
    if (!existing) throw new RbacPermissionNotFoundError();

    const permission = await this.rbac.updatePermission(data);
    await this.events.publish({
      type: "rbac.permission.updated",
      permissionId: permission.id,
      module: permission.module,
      action: permission.action,
    });
    return permission;
  }

  async deletePermission(id: string): Promise<void> {
    const existing = await this.rbac.getPermission(id);
    if (!existing) throw new RbacPermissionNotFoundError();
    if (existing.isSystem) throw new SystemPermissionImmutableError();

    await this.rbac.deletePermission(id);
    await this.events.publish({
      type: "rbac.permission.deleted",
      permissionId: id,
      module: existing.module,
      action: existing.action,
    });
  }

  async setRolePermissions(data: SetRolePermissionsRequest): Promise<void> {
    const role = await this.rbac.getRole(data.roleId);
    if (!role) throw new RbacRoleNotFoundError();

    await this.rbac.setRolePermissions(data.roleId, data.permissionIds);
  }

  async listUserRoleAssignments(userId?: string): Promise<UserRoleAssignmentDTO[]> {
    return this.rbac.listUserRoleAssignments(userId);
  }

  async assignRole(data: AssignRoleRequest, assignedBy: string): Promise<void> {
    const role = await this.rbac.getRole(data.roleId);
    if (!role) throw new RbacRoleNotFoundError();

    await this.rbac.assignRole(data.userId, data.roleId, assignedBy);
    await this.events.publish({
      type: "rbac.role.assigned",
      userId: data.userId,
      roleId: data.roleId,
    });

    // Задача №259 — see class doc comment. Idempotent (ignoreDuplicates in
    // the repository's upsert), so re-assigning an already-held role, or a
    // user who separately already has user_roles 'admin', is a harmless
    // no-op either way.
    //
    // Задача №306 — publishes role.assigned_via_rbac_sync, not the plain
    // role.assigned a direct /admin/users grant uses: revokeRole() below
    // needs to tell the two apart to safely auto-clean up after itself
    // without ever touching a legacy role a human granted on purpose.
    if (ADMIN_WORKSPACE_RBAC_ROLE_NAMES.has(role.name)) {
      await this.userAdmin.assignRole(data.userId, "admin");
      await this.events.publish({
        type: "role.assigned_via_rbac_sync",
        userId: data.userId,
        role: "admin",
        sourceRoleId: data.roleId,
      });
    }
  }

  /**
   * Задача №259 (original) reasoned that auto-removing user_roles 'admin'
   * here was too dangerous to ever do automatically — it can hold 'admin'
   * for reasons that have nothing to do with this specific RBAC role
   * (granted directly via /admin/users, before this RBAC role ever
   * existed, or independently of it), and getting a removal wrong means
   * silently locking a real admin out of the entire Workspace.
   *
   * Задача №306 — that caution was right in spirit but wrong in practice:
   * with no cleanup at all, four confirmed people (sydykovjanybek0@,
   * nurlanovnurdan2@, doolatbekmahmudov@, adinabaktybekkyzy3@) kept full
   * /admin access — "Заказы", and the "Склады" page shell — for days after
   * an admin explicitly revoked their "Администратор" RBAC role, simply
   * because nothing ever removed the legacy row the sync had granted.
   *
   * Fixed with a conservative, explicit auto-cleanup instead of "never":
   * removes the legacy user_roles 'admin' row ONLY when ALL of the
   * following hold —
   *   1. the role just revoked is "Администратор"/"Суперадминистратор"
   *      (ADMIN_WORKSPACE_RBAC_ROLE_NAMES, same set assignRole() checks);
   *   2. the user holds no OTHER currently-assigned RBAC role from that
   *      same set (isAdminWorkspaceRbacRole below) — losing one of two
   *      still-held admin-workspace roles must not touch their access;
   *   3. the most recent legacy-admin-affecting audit record for this
   *      user (role.assigned / role.revoked / role.assigned_via_rbac_sync
   *      / role.revoked_via_rbac_sync_cleanup — see
   *      wasLegacyAdminRowGrantedBySyncAndUntouchedSince below) is this
   *      service's own role.assigned_via_rbac_sync, meaning no human has
   *      granted or revoked the legacy role directly (via /admin/users)
   *      since the sync created it. A row that predates audit logging, or
   *      that a human explicitly (re-)touched afterward, is left exactly
   *      alone — that is still a deliberate, human decision this service
   *      does not override.
   * The removal itself publishes role.revoked_via_rbac_sync_cleanup, its
   * own clearly-labeled audit action (never the plain role.revoked a
   * manual /admin/users revoke uses) — so a future audit sees at a glance
   * that this was this exact automated cleanup, not an unexplained
   * standalone role removal.
   */
  async revokeRole(data: RevokeRoleRequest): Promise<void> {
    const role = await this.rbac.getRole(data.roleId);

    await this.rbac.revokeRole(data.userId, data.roleId);
    await this.events.publish({
      type: "rbac.role.revoked",
      userId: data.userId,
      roleId: data.roleId,
    });

    if (!role || !ADMIN_WORKSPACE_RBAC_ROLE_NAMES.has(role.name)) return;

    const remaining = await this.rbac.listUserRoleAssignments(data.userId);
    const stillHasAdminWorkspaceRole = remaining.some((assignment) =>
      ADMIN_WORKSPACE_RBAC_ROLE_NAMES.has(assignment.roleName),
    );
    if (stillHasAdminWorkspaceRole) return;

    if (await this.wasLegacyAdminRowGrantedBySyncAndUntouchedSince(data.userId)) {
      await this.userAdmin.revokeRole(data.userId, "admin");
      await this.events.publish({
        type: "role.revoked_via_rbac_sync_cleanup",
        userId: data.userId,
        role: "admin",
      });
    }
  }

  /**
   * Задача №306 — the four legacy-admin-affecting audit actions, most
   * recent first (IAuditLog.list already orders by occurred_at descending).
   * True only when the very latest one is this service's own sync grant —
   * see revokeRole()'s doc comment for the full reasoning. A short page is
   * enough: these events are rare per user, and only their relative order
   * matters, not the full history.
   */
  private async wasLegacyAdminRowGrantedBySyncAndUntouchedSince(userId: string): Promise<boolean> {
    const LEGACY_ADMIN_ACTIONS = new Set([
      "role.assigned",
      "role.revoked",
      "role.assigned_via_rbac_sync",
      "role.revoked_via_rbac_sync_cleanup",
    ]);
    const { items } = await this.auditLog.list({ entityId: userId, pageSize: 25 });
    const mostRecent = items.find((record) => LEGACY_ADMIN_ACTIONS.has(record.action));
    return mostRecent?.action === "role.assigned_via_rbac_sync";
  }

  async hasPermission(
    userId: string,
    module: RbacModule | string,
    action: RbacAction | string,
  ): Promise<boolean> {
    return this.rbac.hasPermission(userId, module, action);
  }
}
