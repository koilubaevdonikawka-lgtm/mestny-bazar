export interface IRoleProvider {
  getRolesForUser(userId: string, providedRoles?: readonly string[]): Promise<readonly string[]>;
  hasRole(
    userId: string,
    providedRoles: readonly string[],
    role: string,
  ): Promise<boolean>;
}
