import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** Future integration point for external governance policy providers. Not wired yet. */
export interface IRemoteGovernancePolicyProvider {
  fetchRemote(governancePolicyId: string): Promise<GovernancePolicy | null>;
  pushRemote(governancePolicy: GovernancePolicy): Promise<void>;
}
