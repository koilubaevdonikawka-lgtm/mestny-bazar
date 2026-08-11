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
import {
  assignRoleToUserFn,
  createPermissionFn,
  createRoleFn,
  deletePermissionFn,
  deleteRoleFn,
  getRoleFn,
  listPermissionsFn,
  listRolesFn,
  listUserRoleAssignmentsFn,
  revokeRoleFromUserFn,
  setRolePermissionsFn,
  updatePermissionFn,
  updateRoleFn,
} from "@/api/rbac.functions";

export async function listRoles(): Promise<RbacRoleDTO[]> {
  return listRolesFn();
}

export async function getRole(id: string): Promise<RoleWithPermissionsDTO> {
  return getRoleFn({ data: { id } });
}

export async function createRole(request: CreateRoleRequest): Promise<RbacRoleDTO> {
  return createRoleFn({ data: request });
}

export async function updateRole(request: UpdateRoleRequest): Promise<RbacRoleDTO> {
  return updateRoleFn({ data: request });
}

export async function deleteRole(id: string): Promise<void> {
  return deleteRoleFn({ data: { id } });
}

export async function listPermissions(): Promise<RbacPermissionDTO[]> {
  return listPermissionsFn();
}

export async function createPermission(
  request: CreatePermissionRequest,
): Promise<RbacPermissionDTO> {
  return createPermissionFn({ data: request });
}

export async function updatePermission(
  request: UpdatePermissionRequest,
): Promise<RbacPermissionDTO> {
  return updatePermissionFn({ data: request });
}

export async function deletePermission(id: string): Promise<void> {
  return deletePermissionFn({ data: { id } });
}

export async function setRolePermissions(request: SetRolePermissionsRequest): Promise<void> {
  return setRolePermissionsFn({ data: request });
}

export async function listUserRoleAssignments(userId?: string): Promise<UserRoleAssignmentDTO[]> {
  return listUserRoleAssignmentsFn({ data: { userId } });
}

export async function assignRoleToUser(request: AssignRoleRequest): Promise<void> {
  return assignRoleToUserFn({ data: request });
}

export async function revokeRoleFromUser(request: RevokeRoleRequest): Promise<void> {
  return revokeRoleFromUserFn({ data: request });
}
