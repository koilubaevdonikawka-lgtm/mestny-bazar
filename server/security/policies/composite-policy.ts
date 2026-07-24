import {
  createPolicyResult,
  type AccessPolicy,
  type AccessPolicyInput,
  type AccessPolicyResult,
} from "@server/security/policies/access-policy";

export type CompositePolicyMode = "all" | "any";

/** Combines multiple policies using AND (all) or OR (any) semantics. */
export class CompositePolicy implements AccessPolicy {
  readonly name: string;

  constructor(
    private readonly policies: readonly AccessPolicy[],
    private readonly mode: CompositePolicyMode = "all",
    name = "composite-policy",
  ) {
    if (policies.length === 0) {
      throw new Error("CompositePolicy requires at least one child policy.");
    }
    this.name = name;
    Object.freeze(this);
  }

  evaluate(input: AccessPolicyInput): AccessPolicyResult {
    const results = this.policies.map((policy) => policy.evaluate(input));

    if (this.mode === "all") {
      const denied = results.find((result) => result.decision === "deny");
      if (denied) {
        return createPolicyResult(this.name, "deny", denied.reason ?? `Denied by ${denied.policyName}`);
      }
      return createPolicyResult(this.name, "allow");
    }

    const allowed = results.find((result) => result.decision === "allow");
    if (allowed) {
      return createPolicyResult(this.name, "allow", allowed.reason);
    }

    const reasons = results.map((result) => result.reason).filter(Boolean).join("; ");
    return createPolicyResult(this.name, "deny", reasons || "All child policies denied access.");
  }
}
