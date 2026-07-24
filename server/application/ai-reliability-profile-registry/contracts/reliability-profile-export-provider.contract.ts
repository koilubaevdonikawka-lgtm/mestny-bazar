import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** Future integration point for reliability profile export. Not wired yet. */
export interface IReliabilityProfileExportProvider {
  exportProfiles(reliabilityProfiles: readonly ReliabilityProfile[]): Promise<string>;
}
