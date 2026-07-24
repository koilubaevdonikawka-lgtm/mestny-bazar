import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

export interface IGovernanceProfileCatalog {
  register(governanceProfile: GovernanceProfile): Promise<void>;
  remove(governanceProfileId: string): Promise<void>;
  findById(governanceProfileId: string): Promise<GovernanceProfile | null>;
  findByName(name: string): Promise<GovernanceProfile | null>;
  findByCategory(category: string): Promise<readonly GovernanceProfile[]>;
  listAll(): Promise<readonly GovernanceProfile[]>;
}
