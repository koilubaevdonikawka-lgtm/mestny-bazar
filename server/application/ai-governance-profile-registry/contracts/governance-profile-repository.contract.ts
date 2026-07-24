import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

export interface IGovernanceProfileRepository {
  save(governanceProfile: GovernanceProfile): Promise<void>;
  findById(governanceProfileId: string): Promise<GovernanceProfile | null>;
  findByName(name: string): Promise<GovernanceProfile | null>;
  findByCategory(category: string): Promise<readonly GovernanceProfile[]>;
  findAll(): Promise<readonly GovernanceProfile[]>;
  delete(governanceProfileId: string): Promise<boolean>;
}
