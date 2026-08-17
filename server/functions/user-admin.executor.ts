import type {
  AdminUserDTO,
  AssignAdminScopeRequest,
  AssignRoleRequest,
  RevokeAdminScopeRequest,
  RevokeRoleRequest,
  SetCustomerBlockedRequest,
} from "@shared/contracts/user-admin";
import type { UserRole } from "@shared/contracts/user";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "users";

// permissions.md: "Управление правами не делегируется ни одной под-роли" — even a
// scoped admin (admin-finance/admin-marketing) must be denied here, so the acting
// admin's own scopes are looked up and passed into the policy check, same as any
// other actor. Every action in this file follows the same three-step shape:
// require role -> look up actor scopes -> permissionPolicy.assert().
async function assertUsersAccess(userId: string, roles: UserRole[]): Promise<void> {
  const actor = await getServices().userAdminService.getUser(userId);
  getServices().permissionPolicy.assert({
    actor: { id: userId, roles, scopes: actor?.adminScopes },
    module: MODULE,
  });
}

export async function executeListUsers(): Promise<AdminUserDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertUsersAccess(userId, roles);
  return getServices().userAdminService.listUsers();
}

export async function executeAssignRole(data: AssignRoleRequest): Promise<void> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertUsersAccess(userId, roles);
  await getServices().userAdminService.assignRole(data.userId, data.role);
}

export async function executeRevokeRole(data: RevokeRoleRequest): Promise<void> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertUsersAccess(userId, roles);
  await getServices().userAdminService.revokeRole(data.userId, data.role);
}

export async function executeAssignAdminScope(data: AssignAdminScopeRequest): Promise<void> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertUsersAccess(userId, roles);
  await getServices().userAdminService.assignScope(data.userId, data.scope);
}

export async function executeRevokeAdminScope(data: RevokeAdminScopeRequest): Promise<void> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertUsersAccess(userId, roles);
  await getServices().userAdminService.revokeScope(data.userId, data.scope);
}

export async function executeSetCustomerBlocked(data: SetCustomerBlockedRequest): Promise<void> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertUsersAccess(userId, roles);
  if (data.isBlocked) {
    await getServices().userAdminService.blockCustomer(data.userId);
  } else {
    await getServices().userAdminService.unblockCustomer(data.userId);
  }
}
