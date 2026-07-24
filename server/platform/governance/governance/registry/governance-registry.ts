import type { IGovernanceRegistry } from "@server/platform/governance/governance/contracts";
import type { PolicyCategoryValue, PolicyDescriptor } from "@server/platform/governance/governance/models";
import { createPolicyRegisteredEvent } from "@server/platform/governance/governance/events";

/** Central registry for governance policies. */
export class GovernanceRegistry implements IGovernanceRegistry {
  private readonly policies = new Map<string, PolicyDescriptor>();

  registerPolicy(descriptor: PolicyDescriptor): void {
    this.policies.set(descriptor.id, descriptor);
    createPolicyRegisteredEvent({ policyId: descriptor.id, category: descriptor.category });
  }

  enablePolicy(policyId: string): void {
    const policy = this.requirePolicy(policyId);
    this.policies.set(policy.id, Object.freeze({ ...policy, enabled: true }));
  }

  disablePolicy(policyId: string): void {
    const policy = this.requirePolicy(policyId);
    this.policies.set(policy.id, Object.freeze({ ...policy, enabled: false }));
  }

  getPolicy(policyId: string): PolicyDescriptor | null {
    return this.policies.get(policyId.trim()) ?? null;
  }

  listPolicies(category?: PolicyCategoryValue): readonly PolicyDescriptor[] {
    const policies = [...this.policies.values()];
    if (!category) {
      return Object.freeze(policies);
    }
    return Object.freeze(policies.filter((policy) => policy.category === category));
  }

  private requirePolicy(policyId: string): PolicyDescriptor {
    const policy = this.getPolicy(policyId);
    if (!policy) {
      throw new Error(`Policy "${policyId}" is not registered.`);
    }
    return policy;
  }
}
