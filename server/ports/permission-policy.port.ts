import type { UserRole } from "@shared/contracts/user";
import type { AdminScope } from "@shared/contracts/user-admin";

/** Actor requesting access to an Admin Platform module. */
export interface PermissionActor {
  id: string;
  roles: UserRole[];
  /** Sub-roles narrowing "admin" (permissions.md) — empty means an unrestricted admin. */
  scopes?: AdminScope[];
}

/**
 * Second line of defense after require<Role>FromRequest() (server/auth/resolve-user.ts) —
 * that layer confirms the actor genuinely holds a role; this layer decides
 * whether that role may access a given Admin Platform module. See
 * docs/admin-platform/permissions.md for the full design. Stage 3 adds
 * admin-finance/admin-marketing scope rules (permissions.md §"Предлагаемая
 * архитектура") — modules gated by permissionPolicy.assert() beyond
 * settings.executor.ts (Stage 1) and users.executor.ts (Stage 3, this stage)
 * remain a documented, honest gap, not retrofitted here.
 */
export interface PermissionContext {
  actor: PermissionActor;
  module: string;
}

export interface PermissionResult {
  allowed: boolean;
  denialCode?: string;
  message?: string;
}

export interface IPermissionPolicy {
  can(context: PermissionContext): PermissionResult;
  assert(context: PermissionContext): void;
}
