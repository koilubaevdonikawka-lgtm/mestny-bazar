import { createServerFn } from "@tanstack/react-start";
import type {
  AssignRoleRequest,
  RbacPermissionDTO,
  RbacRoleDTO,
  RevokeRoleRequest,
  RoleWithPermissionsDTO,
  SetRolePermissionsRequest,
  UserRoleAssignmentDTO,
} from "@shared/contracts/rbac";
import {
  assignRoleRequestSchema,
  createPermissionRequestSchema,
  createRoleRequestSchema,
  rbacIdParamSchema,
  rbacOptionalUserIdParamSchema,
  revokeRoleRequestSchema,
  setRolePermissionsRequestSchema,
  updatePermissionRequestSchema,
  updateRoleRequestSchema,
} from "@shared/validation/rbac.schema";

export const listRolesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<RbacRoleDTO[]> => {
    const { executeListRoles } = await import("@server/functions/rbac.executor");
    return executeListRoles();
  },
);

export const getRoleFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => rbacIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<RoleWithPermissionsDTO> => {
    const { executeGetRole } = await import("@server/functions/rbac.executor");
    return executeGetRole(data.id);
  });

export const createRoleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createRoleRequestSchema.parse(data))
  .handler(async ({ data }): Promise<RbacRoleDTO> => {
    const { executeCreateRole } = await import("@server/functions/rbac.executor");
    return executeCreateRole(data);
  });

export const updateRoleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateRoleRequestSchema.parse(data))
  .handler(async ({ data }): Promise<RbacRoleDTO> => {
    const { executeUpdateRole } = await import("@server/functions/rbac.executor");
    return executeUpdateRole(data);
  });

export const deleteRoleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => rbacIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeDeleteRole } = await import("@server/functions/rbac.executor");
    return executeDeleteRole(data.id);
  });

export const listPermissionsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<RbacPermissionDTO[]> => {
    const { executeListPermissions } = await import("@server/functions/rbac.executor");
    return executeListPermissions();
  },
);

export const createPermissionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createPermissionRequestSchema.parse(data))
  .handler(async ({ data }): Promise<RbacPermissionDTO> => {
    const { executeCreatePermission } = await import("@server/functions/rbac.executor");
    return executeCreatePermission(data);
  });

export const updatePermissionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updatePermissionRequestSchema.parse(data))
  .handler(async ({ data }): Promise<RbacPermissionDTO> => {
    const { executeUpdatePermission } = await import("@server/functions/rbac.executor");
    return executeUpdatePermission(data);
  });

export const deletePermissionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => rbacIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeDeletePermission } = await import("@server/functions/rbac.executor");
    return executeDeletePermission(data.id);
  });

export const setRolePermissionsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => setRolePermissionsRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeSetRolePermissions } = await import("@server/functions/rbac.executor");
    return executeSetRolePermissions(data as SetRolePermissionsRequest);
  });

export const listUserRoleAssignmentsFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => rbacOptionalUserIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<UserRoleAssignmentDTO[]> => {
    const { executeListUserRoleAssignments } = await import("@server/functions/rbac.executor");
    return executeListUserRoleAssignments(data.userId);
  });

export const assignRoleToUserFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => assignRoleRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeAssignRole } = await import("@server/functions/rbac.executor");
    return executeAssignRole(data as AssignRoleRequest);
  });

export const revokeRoleFromUserFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => revokeRoleRequestSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeRevokeRole } = await import("@server/functions/rbac.executor");
    return executeRevokeRole(data as RevokeRoleRequest);
  });
