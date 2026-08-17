import type {
  AssignAdminScopeRequest,
  AssignRoleRequest,
  AdminUserDTO,
  RevokeAdminScopeRequest,
  RevokeRoleRequest,
  SetCustomerBlockedRequest,
} from "@shared/contracts/user-admin";
import {
  assignAdminScopeFn,
  assignRoleFn,
  listUsersFn,
  revokeAdminScopeFn,
  revokeRoleFn,
  setCustomerBlockedFn,
} from "@/api/user-admin.functions";

export async function listUsers(): Promise<AdminUserDTO[]> {
  return listUsersFn();
}

export async function assignRole(request: AssignRoleRequest): Promise<void> {
  return assignRoleFn({ data: request });
}

export async function revokeRole(request: RevokeRoleRequest): Promise<void> {
  return revokeRoleFn({ data: request });
}

export async function assignAdminScope(request: AssignAdminScopeRequest): Promise<void> {
  return assignAdminScopeFn({ data: request });
}

export async function revokeAdminScope(request: RevokeAdminScopeRequest): Promise<void> {
  return revokeAdminScopeFn({ data: request });
}

export async function setCustomerBlocked(request: SetCustomerBlockedRequest): Promise<void> {
  return setCustomerBlockedFn({ data: request });
}
