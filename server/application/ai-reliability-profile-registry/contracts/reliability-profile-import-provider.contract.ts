import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** Future integration point for reliability profile import. Not wired yet. */
export interface IReliabilityProfileImportProvider {
  importProfiles(source: string): Promise<readonly ReliabilityProfile[]>;
}
