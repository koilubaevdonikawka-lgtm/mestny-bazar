import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

export interface IGovernancePolicySerializer {
  serialize(governancePolicy: GovernancePolicy): Promise<string>;
  deserialize(serialized: string): Promise<GovernancePolicy>;
}
