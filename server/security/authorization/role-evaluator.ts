import type { SecurityContext } from "@server/security/context";
import type { Permission } from "@server/security/permissions";
import { RolePermissionMatrix, type RoleAssignment, type RoleName } from "@server/security/roles";

/** Resolves effective permissions from assigned roles. */
export class RoleEvaluator {
  evaluateRoles(roles: readonly RoleAssignment[]): readonly Permission[] {
    const permissions = new Set<string>();

    for (const role of roles) {
      const defaults = RolePermissionMatrix[role.name] ?? [];
      for (const permission of defaults) {
        permissions.add(permission);
      }
    }

    return Object.freeze([...permissions] as Permission[]);
  }

  hasRole(roles: readonly RoleAssignment[], roleName: RoleName): boolean {
    return roles.some((role) => role.name === roleName);
  }

  hasAnyRole(roles: readonly RoleAssignment[], required: readonly RoleName[]): boolean {
    return required.some((roleName) => this.hasRole(roles, roleName));
  }
}
