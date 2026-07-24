export interface IPermissionProvider {
  getPermissionsForUser(
    userId: string,
    roles: readonly string[],
  ): Promise<readonly string[]>;
  hasPermission(
    userId: string,
    roles: readonly string[],
    directPermissions: readonly string[],
    permission: string,
  ): Promise<boolean>;
  hasPermissions(
    userId: string,
    roles: readonly string[],
    directPermissions: readonly string[],
    permissions: readonly string[],
    requireAll: boolean,
  ): Promise<boolean>;
}
