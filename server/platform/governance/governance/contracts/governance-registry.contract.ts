import type { PolicyCategoryValue, PolicyDescriptor } from "@server/platform/governance/governance/models";

/** Contract for the governance registry. */
export interface IGovernanceRegistry {
  registerPolicy(descriptor: PolicyDescriptor): void;
  enablePolicy(policyId: string): void;
  disablePolicy(policyId: string): void;
  getPolicy(policyId: string): PolicyDescriptor | null;
  listPolicies(category?: PolicyCategoryValue): readonly PolicyDescriptor[];
}
