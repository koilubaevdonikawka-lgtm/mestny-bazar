import { createServerFn } from "@tanstack/react-start";
import type { AdminUserDTO } from "@shared/contracts/user-admin";
import {
  assignAdminScopeRequestSchema,
  assignRoleRequestSchema,
  revokeAdminScopeRequestSchema,
  revokeRoleRequestSchema,
  setCustomerBlockedRequestSchema,
} from "@shared/validation/user-admin.schema";

export const listUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUserDTO[]> => {
    const { executeListUsers } = await import("@server/functions/user-admin.executor");
    return executeListUsers();
  },
);

export const assignRoleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => assignRoleRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeAssignRole } = await import("@server/functions/user-admin.executor");
    return executeAssignRole(data);
  });

export const revokeRoleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => revokeRoleRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeRevokeRole } = await import("@server/functions/user-admin.executor");
    return executeRevokeRole(data);
  });

export const assignAdminScopeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => assignAdminScopeRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeAssignAdminScope } = await import("@server/functions/user-admin.executor");
    return executeAssignAdminScope(data);
  });

export const revokeAdminScopeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => revokeAdminScopeRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeRevokeAdminScope } = await import("@server/functions/user-admin.executor");
    return executeRevokeAdminScope(data);
  });

export const setCustomerBlockedFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => setCustomerBlockedRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeSetCustomerBlocked } = await import("@server/functions/user-admin.executor");
    return executeSetCustomerBlocked(data);
  });
