import type { IRoleProvider } from "@server/application/authorization-management/contracts/role-provider.contract";

/** Default in-memory role resolver — authorization assignments only, not user storage. */
export class DefaultRoleProvider implements IRoleProvider {
  private readonly roleAssignments = new Map<string, Set<string>>();

  constructor() {
    this.seedDefaultAssignments();
  }

  async getRolesForUser(
    userId: string,
    providedRoles: readonly string[] = [],
  ): Promise<readonly string[]> {
    const assigned = this.roleAssignments.get(userId.trim()) ?? new Set<string>();
    const merged = new Set([...assigned, ...providedRoles.map((role) => role.trim())]);
    return Object.freeze([...merged].filter((role) => role.length > 0));
  }

  async hasRole(
    userId: string,
    providedRoles: readonly string[],
    role: string,
  ): Promise<boolean> {
    const roles = await this.getRolesForUser(userId, providedRoles);
    const normalizedRole = role.trim();
    return roles.includes(normalizedRole) || roles.includes("admin");
  }

  private seedDefaultAssignments(): void {
    this.assignRoles("admin-user", ["admin"]);
    this.assignRoles("seller-user", ["seller"]);
    this.assignRoles("customer-user", ["customer"]);
  }

  private assignRoles(userId: string, roles: readonly string[]): void {
    this.roleAssignments.set(userId, new Set(roles));
  }
}
