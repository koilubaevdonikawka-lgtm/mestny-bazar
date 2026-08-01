import type { UserRole } from "@shared/contracts/user";

/** Actor requesting access to an Admin Platform module. */
export interface PermissionActor {
  id: string;
  roles: UserRole[];
}

/**
 * Second line of defense after require<Role>FromRequest() (server/auth/resolve-user.ts) —
 * that layer confirms the actor genuinely holds a role; this layer decides
 * whether that role may access a given Admin Platform module. See
 * docs/admin-platform/permissions.md for the full design (this stage only
 * wires the engine and one rule: existing roles get their existing access,
 * no sub-roles yet).
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
