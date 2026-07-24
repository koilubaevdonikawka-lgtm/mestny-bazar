/**
 * Authorization Management — access permission checks only.
 *
 * Does not authenticate users or store user profiles.
 * Accepts already-authenticated user context and evaluates access.
 */
import type { IAuthorizationAuditProvider } from "@server/application/authorization-management/contracts/authorization-audit-provider.contract";
import type { IAuthorizationPolicyRepository } from "@server/application/authorization-management/contracts/authorization-policy-repository.contract";
import type { IPermissionProvider } from "@server/application/authorization-management/contracts/permission-provider.contract";
import type { IResourceAccessProvider } from "@server/application/authorization-management/contracts/resource-access-provider.contract";
import type { IRoleProvider } from "@server/application/authorization-management/contracts/role-provider.contract";
import {
  createAuthorizationDecision,
  createAuthorizationPolicy,
  type AuthorizationDecision,
  type AuthorizationPolicy,
  type AuthorizeActionInput,
  type AuthenticatedUser,
  type CheckPermissionInput,
  type CheckResourceAccessInput,
  type CheckRoleInput,
  type EffectivePermissionsResult,
  type RegisterAuthorizationPolicyInput,
} from "@server/application/authorization-management/models/authorization.model";
import type { IIdGenerator } from "@server/application/ports";

export class AuthorizationManagementService {
  constructor(
    private readonly policyRepository: IAuthorizationPolicyRepository,
    private readonly permissionProvider: IPermissionProvider,
    private readonly roleProvider: IRoleProvider,
    private readonly resourceAccessProvider: IResourceAccessProvider,
    private readonly auditProvider: IAuthorizationAuditProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async authorizeAction(input: AuthorizeActionInput): Promise<AuthorizationDecision> {
    const context = await this.resolveUserContext(input.user);
    const resource = input.resource?.trim() ?? "*";
    const policies = await this.policyRepository.findAll();

    const resourceDecision = await this.resourceAccessProvider.evaluateAccess({
      userId: context.userId,
      roles: context.roles,
      permissions: context.permissions,
      resource,
      action: input.action.trim(),
      policies,
    });

    if (!resourceDecision.allowed) {
      await this.auditProvider.recordCheck({
        userId: context.userId,
        checkType: "authorize-action",
        action: input.action,
        resource,
        decision: resourceDecision,
      });
      return resourceDecision;
    }

    const decision = createAuthorizationDecision({
      allowed: true,
      reason: resourceDecision.reason,
      matchedPolicyId: resourceDecision.matchedPolicyId,
    });

    await this.auditProvider.recordCheck({
      userId: context.userId,
      checkType: "authorize-action",
      action: input.action,
      resource,
      decision,
    });

    return decision;
  }

  async checkRole(input: CheckRoleInput): Promise<AuthorizationDecision> {
    const context = await this.resolveUserContext(input.user);
    const allowed = await this.roleProvider.hasRole(
      context.userId,
      context.roles,
      input.role.trim(),
    );

    const decision = createAuthorizationDecision({
      allowed,
      reason: allowed
        ? `User has role "${input.role}".`
        : `User does not have role "${input.role}".`,
    });

    await this.auditProvider.recordCheck({
      userId: context.userId,
      checkType: "check-role",
      role: input.role,
      decision,
    });

    return decision;
  }

  async checkPermission(input: CheckPermissionInput): Promise<AuthorizationDecision> {
    const context = await this.resolveUserContext(input.user);
    const permissionsToCheck =
      input.permissions && input.permissions.length > 0
        ? input.permissions
        : [input.permission.trim()];

    const allowed = await this.permissionProvider.hasPermissions(
      context.userId,
      context.roles,
      context.permissions,
      permissionsToCheck,
      input.requireAll ?? true,
    );

    const decision = createAuthorizationDecision({
      allowed,
      reason: allowed
        ? "Required permissions satisfied."
        : "Required permissions not satisfied.",
    });

    await this.auditProvider.recordCheck({
      userId: context.userId,
      checkType: "check-permission",
      permission: permissionsToCheck.join(","),
      decision,
    });

    return decision;
  }

  async checkResourceAccess(input: CheckResourceAccessInput): Promise<AuthorizationDecision> {
    const context = await this.resolveUserContext(input.user);
    const policies = await this.policyRepository.findAll();

    const decision = await this.resourceAccessProvider.evaluateAccess({
      userId: context.userId,
      roles: context.roles,
      permissions: context.permissions,
      resource: input.resource.trim(),
      action: input.action.trim(),
      policies,
    });

    await this.auditProvider.recordCheck({
      userId: context.userId,
      checkType: "check-resource",
      action: input.action,
      resource: input.resource,
      decision,
    });

    return decision;
  }

  async getEffectivePermissions(userId: string, user?: AuthenticatedUser): Promise<EffectivePermissionsResult> {
    const context = await this.resolveUserContext(
      user ?? { userId, roles: [], permissions: [] },
    );
    const rolePermissions = await this.permissionProvider.getPermissionsForUser(
      context.userId,
      context.roles,
    );

    const permissions = Object.freeze([
      ...new Set([...context.permissions, ...rolePermissions]),
    ]);

    return Object.freeze({
      userId: context.userId,
      roles: context.roles,
      permissions,
    });
  }

  async registerPolicy(input: RegisterAuthorizationPolicyInput): Promise<AuthorizationPolicy> {
    const policy = createAuthorizationPolicy({
      policyId: this.idGenerator.generate(),
      name: input.name,
      resourcePattern: input.resourcePattern,
      action: input.action,
      requiredRoles: input.requiredRoles,
      requiredPermissions: input.requiredPermissions,
      effect: input.effect,
    });

    await this.policyRepository.save(policy);
    return policy;
  }

  private async resolveUserContext(user: AuthenticatedUser): Promise<{
    userId: string;
    roles: readonly string[];
    permissions: readonly string[];
  }> {
    const userId = user.userId.trim();
    const roles = await this.roleProvider.getRolesForUser(userId, user.roles ?? []);
    const directPermissions = Object.freeze([...(user.permissions ?? [])]);

    return {
      userId,
      roles,
      permissions: directPermissions,
    };
  }
}
