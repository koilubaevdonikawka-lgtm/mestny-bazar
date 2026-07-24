import type { IResourceAccessProvider } from "@server/application/authorization-management/contracts/resource-access-provider.contract";
import {
  createAuthorizationDecision,
  type AuthorizationDecision,
  type AuthorizationPolicy,
} from "@server/application/authorization-management/models/authorization.model";
import { matchesPattern } from "@server/infrastructure/authorization-management/authorization-policy.repository";

function policyMatches(
  policy: AuthorizationPolicy,
  resource: string,
  action: string,
  roles: readonly string[],
  permissions: readonly string[],
): boolean {
  if (!matchesPattern(resource, policy.resourcePattern)) {
    return false;
  }

  if (policy.action !== "*" && policy.action !== action) {
    return false;
  }

  const hasRequiredRole =
    policy.requiredRoles.length === 0 ||
    policy.requiredRoles.some((role) => roles.includes(role) || roles.includes("admin"));

  const granted = new Set([...permissions]);
  if (roles.includes("admin")) {
    granted.add("*");
  }

  const hasRequiredPermission =
    policy.requiredPermissions.length === 0 ||
    policy.requiredPermissions.every(
      (permission) => granted.has(permission) || granted.has("*"),
    );

  return hasRequiredRole && hasRequiredPermission;
}

/** Default resource access evaluator using in-memory policies. */
export class DefaultResourceAccessProvider implements IResourceAccessProvider {
  async evaluateAccess(context: {
    userId: string;
    roles: readonly string[];
    permissions: readonly string[];
    resource: string;
    action: string;
    policies: readonly AuthorizationPolicy[];
  }): Promise<AuthorizationDecision> {
    const applicable = context.policies.filter((policy) =>
      matchesPattern(context.resource, policy.resourcePattern) &&
      (policy.action === "*" || policy.action === context.action),
    );

    if (applicable.length === 0) {
      return createAuthorizationDecision({
        allowed: false,
        reason: "No matching authorization policy found.",
      });
    }

    let denyPolicy: AuthorizationPolicy | null = null;

    for (const policy of applicable) {
      const matches = policyMatches(
        policy,
        context.resource,
        context.action,
        context.roles,
        context.permissions,
      );

      if (!matches) {
        continue;
      }

      if (policy.effect === "deny") {
        denyPolicy = policy;
        break;
      }

      return createAuthorizationDecision({
        allowed: true,
        reason: `Access granted by policy "${policy.name}".`,
        matchedPolicyId: policy.policyId,
      });
    }

    if (denyPolicy) {
      return createAuthorizationDecision({
        allowed: false,
        reason: `Access denied by policy "${denyPolicy.name}".`,
        matchedPolicyId: denyPolicy.policyId,
      });
    }

    return createAuthorizationDecision({
      allowed: false,
      reason: "User does not satisfy required roles or permissions.",
    });
  }
}
