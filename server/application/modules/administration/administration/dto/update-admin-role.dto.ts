export interface UpdateAdminRoleDto {
  readonly actorId: string;
  readonly roleId: string;
  readonly name?: string;
  readonly permissions?: readonly string[];
  readonly description?: string;
  readonly active?: boolean;
}
