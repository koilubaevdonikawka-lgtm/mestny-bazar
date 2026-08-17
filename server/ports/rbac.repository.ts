import type {
  CreatePermissionRequest,
  CreateRoleRequest,
  RbacAction,
  RbacModule,
  RbacPermissionDTO,
  RbacRoleDTO,
  RoleWithPermissionsDTO,
  UpdatePermissionRequest,
  UpdateRoleRequest,
  UserRoleAssignmentDTO,
} from "@shared/contracts/rbac";

export interface IRbacRepository {
  listRoles(): Promise<RbacRoleDTO[]>;
  getRole(id: string): Promise<RoleWithPermissionsDTO | null>;
  createRole(data: CreateRoleRequest): Promise<RbacRoleDTO>;
  updateRole(data: UpdateRoleRequest): Promise<RbacRoleDTO>;
  deleteRole(id: string): Promise<void>;

  listPermissions(): Promise<RbacPermissionDTO[]>;
  getPermission(id: string): Promise<RbacPermissionDTO | null>;
  createPermission(data: CreatePermissionRequest): Promise<RbacPermissionDTO>;
  updatePermission(data: UpdatePermissionRequest): Promise<RbacPermissionDTO>;
  deletePermission(id: string): Promise<void>;

  setRolePermissions(roleId: string, permissionIds: string[]): Promise<void>;

  listUserRoleAssignments(userId?: string): Promise<UserRoleAssignmentDTO[]>;
  assignRole(userId: string, roleId: string, assignedBy: string): Promise<void>;
  revokeRole(userId: string, roleId: string): Promise<void>;

  /** The actual authorization query behind requireModulePermission(). */
  hasPermission(
    userId: string,
    module: RbacModule | string,
    action: RbacAction | string,
  ): Promise<boolean>;
}
