import type { GovernanceProfile } from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** Future integration point for governance profile export. Not wired yet. */
export interface IGovernanceProfileExportProvider {
  exportProfiles(governanceProfiles: readonly GovernanceProfile[]): Promise<string>;
}
