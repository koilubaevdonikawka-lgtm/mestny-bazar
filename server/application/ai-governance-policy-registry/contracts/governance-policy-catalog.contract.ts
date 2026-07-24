import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

export interface IGovernancePolicyCatalog {
  register(governancePolicy: GovernancePolicy): Promise<void>;
  remove(governancePolicyId: string): Promise<void>;
  findById(governancePolicyId: string): Promise<GovernancePolicy | null>;
  findByName(name: string): Promise<GovernancePolicy | null>;
  findByCategory(category: string): Promise<readonly GovernancePolicy[]>;
  listAll(): Promise<readonly GovernancePolicy[]>;
}
