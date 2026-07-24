import {
  createPolicyResult,
  type AccessPolicy,
  type AccessPolicyInput,
  type AccessPolicyResult,
} from "@server/security/policies/access-policy";
import type { RoleName } from "@server/security/roles";

/** Allows access when the caller holds at least one required role. */
export class RolePolicy implements AccessPolicy {
  readonly name: string;

  constructor(
    private readonly requiredRoles: readonly RoleName[],
    name = "role-policy",
  ) {
    if (requiredRoles.length === 0) {
      throw new Error("RolePolicy requires at least one role.");
    }
    this.name = name;
    Object.freeze(this);
  }

  evaluate(input: AccessPolicyInput): AccessPolicyResult {
    const allowed = this.requiredRoles.some((role) => input.context.hasRole(role));
    return createPolicyResult(
      this.name,
      allowed ? "allow" : "deny",
      allowed ? undefined : `Missing required role: ${this.requiredRoles.join(" | ")}`,
    );
  }
}
