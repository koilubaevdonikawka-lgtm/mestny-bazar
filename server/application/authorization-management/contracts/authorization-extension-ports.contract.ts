/**
 * Future integration ports for Authorization Management.
 * Not implemented — reserved for external authorization engines.
 */

import type {
  AuthorizationDecision,
  AuthorizationPolicy,
  AuthenticatedUser,
} from "@server/application/authorization-management/models/authorization.model";

/** RBAC Engine — role-based access control evaluation. */
export interface IRbacEngine {
  evaluateRoles(user: AuthenticatedUser, requiredRoles: readonly string[]): Promise<AuthorizationDecision>;
  listRoleHierarchy(role: string): Promise<readonly string[]>;
}

/** ABAC Engine — attribute-based access control evaluation. */
export interface IAbacEngine {
  evaluateAttributes(
    user: AuthenticatedUser,
    resource: string,
    action: string,
    attributes: Readonly<Record<string, string>>,
  ): Promise<AuthorizationDecision>;
}

/** Policy Engine — centralized policy evaluation. */
export interface IPolicyEngine {
  evaluatePolicy(
    user: AuthenticatedUser,
    policy: AuthorizationPolicy,
  ): Promise<AuthorizationDecision>;
  compilePolicies(policies: readonly AuthorizationPolicy[]): Promise<void>;
}

/** Permission Cache — cached permission lookups. */
export interface IPermissionCache {
  getCachedPermissions(userId: string): Promise<readonly string[] | null>;
  setCachedPermissions(userId: string, permissions: readonly string[], ttlSeconds: number): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

/** Organization Hierarchy — org-scoped authorization. */
export interface IOrganizationHierarchy {
  getUserOrganizations(userId: string): Promise<readonly string[]>;
  isMemberOf(userId: string, organizationId: string): Promise<boolean>;
}

/** External Identity Provider — federated role/permission lookup. */
export interface IExternalIdentityProvider {
  fetchRoles(userId: string): Promise<readonly string[]>;
  fetchPermissions(userId: string): Promise<readonly string[]>;
}
