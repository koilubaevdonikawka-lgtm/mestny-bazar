import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

export interface IGovernancePolicyRepository {
  save(governancePolicy: GovernancePolicy): Promise<void>;
  findById(governancePolicyId: string): Promise<GovernancePolicy | null>;
  findByName(name: string): Promise<GovernancePolicy | null>;
  findByCategory(category: string): Promise<readonly GovernancePolicy[]>;
  findAll(): Promise<readonly GovernancePolicy[]>;
  delete(governancePolicyId: string): Promise<boolean>;
}
