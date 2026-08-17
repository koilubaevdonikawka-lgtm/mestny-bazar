import type {
  AssignRoleRequest,
  CreatePermissionRequest,
  CreateRoleRequest,
  RbacPermissionDTO,
  RbacRoleDTO,
  RevokeRoleRequest,
  RoleWithPermissionsDTO,
  SetRolePermissionsRequest,
  UpdatePermissionRequest,
  UpdateRoleRequest,
  UserRoleAssignmentDTO,
} from "@shared/contracts/rbac";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { requireModulePermission } from "@server/auth/require-module-permission";
import { getServices } from "@server/di/container";

const MODULE = "permissions";

export async function executeListRoles(): Promise<RbacRoleDTO[]> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "view");
  return getServices().rbacService.listRoles();
}

export async function executeGetRole(id: string): Promise<RoleWithPermissionsDTO> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "view");
  return getServices().rbacService.getRole(id);
}

export async function executeCreateRole(data: CreateRoleRequest): Promise<RbacRoleDTO> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "create");
  return getServices().rbacService.createRole(data);
}

export async function executeUpdateRole(data: UpdateRoleRequest): Promise<RbacRoleDTO> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "edit");
  return getServices().rbacService.updateRole(data);
}

export async function executeDeleteRole(id: string): Promise<void> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "delete");
  return getServices().rbacService.deleteRole(id);
}

export async function executeListPermissions(): Promise<RbacPermissionDTO[]> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "view");
  return getServices().rbacService.listPermissions();
}

export async function executeCreatePermission(
  data: CreatePermissionRequest,
): Promise<RbacPermissionDTO> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "create");
  return getServices().rbacService.createPermission(data);
}

export async function executeUpdatePermission(
  data: UpdatePermissionRequest,
): Promise<RbacPermissionDTO> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "edit");
  return getServices().rbacService.updatePermission(data);
}

export async function executeDeletePermission(id: string): Promise<void> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "delete");
  return getServices().rbacService.deletePermission(id);
}

export async function executeSetRolePermissions(data: SetRolePermissionsRequest): Promise<void> {
  const { userId } = await requireAdminFromRequest();
  await requireModulePermission(userId, MODULE, "manage_settings");
  return getServices().rbacService.setRolePermissions(data);
}

export async function executeListUserRoleAssignments(
  userId?: string,
): Promise<UserRoleAssignmentDTO[]> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, MODULE, "view");
  return getServices().rbacService.listUserRoleAssignments(userId);
}

export async function executeAssignRole(data: AssignRoleRequest): Promise<void> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, MODULE, "edit");
  return getServices().rbacService.assignRole(data, actorId);
}

export async function executeRevokeRole(data: RevokeRoleRequest): Promise<void> {
  const { userId: actorId } = await requireAdminFromRequest();
  await requireModulePermission(actorId, MODULE, "edit");
  return getServices().rbacService.revokeRole(data);
}
