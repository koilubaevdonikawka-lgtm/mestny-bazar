import { PermissionEvaluator } from "@server/security/authorization/permission-evaluator";
import { PolicyEvaluator } from "@server/security/authorization/policy-evaluator";
import { RoleEvaluator } from "@server/security/authorization/role-evaluator";
import { SecurityContext } from "@server/security/context";
import type { Permission } from "@server/security/permissions";
import type { AccessPolicy, AccessPolicyInput } from "@server/security/policies";
import type { RoleAssignment, RoleName } from "@server/security/roles";
import { ForbiddenError } from "@server/security/shared";

/** Orchestrates role, permission, and policy evaluation for authorization decisions. */
export class AuthorizationService {
  constructor(
    private readonly roleEvaluator = new RoleEvaluator(),
    private readonly permissionEvaluator = new PermissionEvaluator(),
    private readonly policyEvaluator = new PolicyEvaluator(),
  ) {}

  buildContext(
    base: SecurityContext,
    roles: readonly RoleAssignment[],
    extraPermissions: readonly Permission[] = [],
  ): SecurityContext {
    const derivedPermissions = this.roleEvaluator.evaluateRoles(roles);
    const permissions = this.permissionEvaluator.mergePermissions(extraPermissions, derivedPermissions);

    return base.withPermissions(permissions);
  }

  requireRole(context: SecurityContext, role: RoleName): void {
    if (!this.roleEvaluator.hasRole(context.roles, role)) {
      throw new ForbiddenError(`Role required: ${role}`);
    }
  }

  requireAnyRole(context: SecurityContext, roles: readonly RoleName[]): void {
    if (!this.roleEvaluator.hasAnyRole(context.roles, roles)) {
      throw new ForbiddenError(`One of roles required: ${roles.join(", ")}`);
    }
  }

  requirePermission(context: SecurityContext, permission: Permission): void {
    if (!this.permissionEvaluator.hasPermission(context, permission)) {
      throw new ForbiddenError(`Permission required: ${permission}`);
    }
  }

  requireAllPermissions(context: SecurityContext, permissions: readonly Permission[]): void {
    if (!this.permissionEvaluator.hasAllPermissions(context, permissions)) {
      throw new ForbiddenError(`Permissions required: ${permissions.join(", ")}`);
    }
  }

  authorize(policy: AccessPolicy, input: AccessPolicyInput): void {
    if (!this.policyEvaluator.isAllowed(policy, input)) {
      const result = policy.evaluate(input);
      throw new ForbiddenError(result.reason ?? "Access denied by policy.");
    }
  }
}
