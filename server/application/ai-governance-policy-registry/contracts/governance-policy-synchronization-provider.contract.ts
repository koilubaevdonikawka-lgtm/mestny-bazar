import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** Future integration point for governance policy synchronization. Not wired yet. */
export interface IGovernancePolicySynchronizationProvider {
  synchronize(governancePolicies: readonly GovernancePolicy[]): Promise<void>;
}
