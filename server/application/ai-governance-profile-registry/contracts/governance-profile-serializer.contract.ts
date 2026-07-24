import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

export interface IGovernanceProfileSerializer {
  serialize(governanceProfile: GovernanceProfile): Promise<string>;
  deserialize(serialized: string): Promise<GovernanceProfile>;
}
