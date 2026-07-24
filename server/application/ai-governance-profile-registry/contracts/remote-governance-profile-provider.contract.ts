import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** Future integration point for external governance profile providers. Not wired yet. */
export interface IRemoteGovernanceProfileProvider {
  fetchRemote(governanceProfileId: string): Promise<GovernanceProfile | null>;
  pushRemote(governanceProfile: GovernanceProfile): Promise<void>;
}
