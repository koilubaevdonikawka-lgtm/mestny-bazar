import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** Future integration point for governance profile synchronization. Not wired yet. */
export interface IGovernanceProfileSynchronizationProvider {
  synchronize(governanceProfiles: readonly GovernanceProfile[]): Promise<void>;
}
