import type { IPolicyRegistry } from "@server/platform/policy/policy/contracts";
import {
  createPolicyDescriptor,
  type PolicyCategory,
  type PolicyDescriptor,
} from "@server/platform/policy/policy/models";
import { createPolicyRegisteredEvent } from "@server/platform/policy/policy/events";

/** Central registry for platform policy metadata. */
export class PolicyRegistry implements IPolicyRegistry {
  private readonly policies = new Map<string, PolicyDescriptor>();

  register(policy: PolicyDescriptor): PolicyDescriptor {
    const stored = createPolicyDescriptor(policy);
    this.policies.set(stored.id, stored);
    createPolicyRegisteredEvent(stored);
    return stored;
  }

  get(policyId: string): PolicyDescriptor | undefined {
    return this.policies.get(policyId.trim());
  }

  list(category?: PolicyCategory): readonly PolicyDescriptor[] {
    const values = [...this.policies.values()];
    const filtered = category ? values.filter((policy) => policy.category === category) : values;
    return Object.freeze([...filtered]);
  }
}
