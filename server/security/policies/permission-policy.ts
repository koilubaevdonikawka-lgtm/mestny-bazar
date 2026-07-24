import {
  createPolicyResult,
  type AccessPolicy,
  type AccessPolicyInput,
  type AccessPolicyResult,
} from "@server/security/policies/access-policy";
import type { Permission } from "@server/security/permissions";

/** Allows access when the caller holds all required permissions. */
export class PermissionPolicy implements AccessPolicy {
  readonly name: string;

  constructor(
    private readonly requiredPermissions: readonly Permission[],
    name = "permission-policy",
  ) {
    if (requiredPermissions.length === 0) {
      throw new Error("PermissionPolicy requires at least one permission.");
    }
    this.name = name;
    Object.freeze(this);
  }

  evaluate(input: AccessPolicyInput): AccessPolicyResult {
    const missing = this.requiredPermissions.filter(
      (permission) => !input.context.hasPermission(permission),
    );

    return createPolicyResult(
      this.name,
      missing.length === 0 ? "allow" : "deny",
      missing.length === 0 ? undefined : `Missing permissions: ${missing.join(", ")}`,
    );
  }
}

/** Allows access when the caller holds at least one required permission. */
export class AnyPermissionPolicy implements AccessPolicy {
  readonly name: string;

  constructor(
    private readonly permissions: readonly Permission[],
    name = "any-permission-policy",
  ) {
    if (permissions.length === 0) {
      throw new Error("AnyPermissionPolicy requires at least one permission.");
    }
    this.name = name;
    Object.freeze(this);
  }

  evaluate(input: AccessPolicyInput): AccessPolicyResult {
    const allowed = this.permissions.some((permission) => input.context.hasPermission(permission));
    return createPolicyResult(
      this.name,
      allowed ? "allow" : "deny",
      allowed ? undefined : `Missing any of permissions: ${this.permissions.join(", ")}`,
    );
  }
}
