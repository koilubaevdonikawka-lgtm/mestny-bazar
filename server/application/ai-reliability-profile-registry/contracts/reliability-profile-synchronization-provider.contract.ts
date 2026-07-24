import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** Future integration point for reliability profile synchronization. Not wired yet. */
export interface IReliabilityProfileSynchronizationProvider {
  synchronize(reliabilityProfiles: readonly ReliabilityProfile[]): Promise<void>;
}
