export interface CreateAdminRoleDto {
  readonly actorId: string;
  readonly name: string;
  readonly permissions: readonly string[];
  readonly description?: string;
}
