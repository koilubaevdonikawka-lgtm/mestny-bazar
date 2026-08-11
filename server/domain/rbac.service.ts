import type { IRbacRepository } from "@server/ports/rbac.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
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

/**
 * Industrial RBAC domain service (Промпт №068). Entirely additive and
 * parallel to the existing app_role enum / PermissionPolicyService — never
 * consulted by them, never consulting them. hasPermission() is the single
 * function requireModulePermission() calls; every other method backs the
 * "Права доступа" admin UI (role CRUD, permission CRUD, matrix, assignment).
 */
export class RbacService {
  constructor(
    private readonly rbac: IRbacRepository,
    private readonly events: IMarketplaceEventBus,
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
  }

  async revokeRole(data: RevokeRoleRequest): Promise<void> {
    await this.rbac.revokeRole(data.userId, data.roleId);
    await this.events.publish({
      type: "rbac.role.revoked",
      userId: data.userId,
      roleId: data.roleId,
    });
  }

  async hasPermission(
    userId: string,
    module: RbacModule | string,
    action: RbacAction | string,
  ): Promise<boolean> {
    return this.rbac.hasPermission(userId, module, action);
  }
}
