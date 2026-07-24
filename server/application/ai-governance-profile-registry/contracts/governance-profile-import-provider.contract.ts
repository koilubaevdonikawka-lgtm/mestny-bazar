import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** Future integration point for governance profile import. Not wired yet. */
export interface IGovernanceProfileImportProvider {
  importProfiles(source: string): Promise<readonly GovernanceProfile[]>;
}
