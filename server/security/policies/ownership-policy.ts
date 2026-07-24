import { AuthenticatedIdentity } from "@server/security/identity/authenticated-identity";
import {
  createPolicyResult,
  type AccessPolicy,
  type AccessPolicyInput,
  type AccessPolicyResult,
} from "@server/security/policies/access-policy";
import { Role } from "@server/security/roles";

/** Allows access when the authenticated user owns the target resource. */
export class OwnershipPolicy implements AccessPolicy {
  readonly name: string;

  constructor(
    private readonly options: {
      bypassRoles?: readonly string[];
      ownerIdResolver?: (input: AccessPolicyInput) => string | undefined;
    } = {},
    name = "ownership-policy",
  ) {
    this.name = name;
    Object.freeze(this);
  }

  evaluate(input: AccessPolicyInput): AccessPolicyResult {
    const bypassRoles = this.options.bypassRoles ?? [Role.Administrator, Role.System];
    if (bypassRoles.some((role) => input.context.hasRole(role))) {
      return createPolicyResult(this.name, "allow", "Bypassed by privileged role.");
    }

    const identity = input.context.identity;
    if (!(identity instanceof AuthenticatedIdentity)) {
      return createPolicyResult(this.name, "deny", "Authenticated identity required for ownership.");
    }

    const ownerId = this.options.ownerIdResolver?.(input) ?? input.ownerId;
    if (!ownerId) {
      return createPolicyResult(this.name, "deny", "Owner id is not available.");
    }

    const allowed = identity.userId === ownerId;
    return createPolicyResult(
      this.name,
      allowed ? "allow" : "deny",
      allowed ? undefined : "Resource is owned by another principal.",
    );
  }
}
