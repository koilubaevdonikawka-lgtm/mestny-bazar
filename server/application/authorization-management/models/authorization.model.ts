/** Already-authenticated user context passed into authorization checks. */
export interface AuthenticatedUser {
  readonly userId: string;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

export interface AuthorizationPolicy {
  readonly policyId: string;
  readonly name: string;
  readonly resourcePattern: string;
  readonly action: string;
  readonly requiredRoles: readonly string[];
  readonly requiredPermissions: readonly string[];
  readonly effect: "allow" | "deny";
  readonly createdAt: string;
}

export interface AuthorizationDecision {
  readonly allowed: boolean;
  readonly reason: string;
  readonly matchedPolicyId: string | null;
}

export interface AuthorizeActionInput {
  readonly user: AuthenticatedUser;
  readonly action: string;
  readonly resource?: string;
}

export interface CheckRoleInput {
  readonly user: AuthenticatedUser;
  readonly role: string;
}

export interface CheckPermissionInput {
  readonly user: AuthenticatedUser;
  readonly permission: string;
  readonly permissions?: readonly string[];
  readonly requireAll?: boolean;
}

export interface CheckResourceAccessInput {
  readonly user: AuthenticatedUser;
  readonly resource: string;
  readonly action: string;
}

export interface EffectivePermissionsResult {
  readonly userId: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export interface RegisterAuthorizationPolicyInput {
  readonly name: string;
  readonly resourcePattern: string;
  readonly action: string;
  readonly requiredRoles?: readonly string[];
  readonly requiredPermissions?: readonly string[];
  readonly effect?: "allow" | "deny";
}

export function createAuthorizationPolicy(input: {
  policyId: string;
  name: string;
  resourcePattern: string;
  action: string;
  requiredRoles?: readonly string[];
  requiredPermissions?: readonly string[];
  effect?: "allow" | "deny";
  createdAt?: string;
}): AuthorizationPolicy {
  return Object.freeze({
    policyId: input.policyId.trim(),
    name: input.name.trim(),
    resourcePattern: input.resourcePattern.trim(),
    action: input.action.trim(),
    requiredRoles: Object.freeze([...(input.requiredRoles ?? [])]),
    requiredPermissions: Object.freeze([...(input.requiredPermissions ?? [])]),
    effect: input.effect ?? "allow",
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createAuthorizationDecision(input: {
  allowed: boolean;
  reason: string;
  matchedPolicyId?: string | null;
}): AuthorizationDecision {
  return Object.freeze({
    allowed: input.allowed,
    reason: input.reason,
    matchedPolicyId: input.matchedPolicyId ?? null,
  });
}
