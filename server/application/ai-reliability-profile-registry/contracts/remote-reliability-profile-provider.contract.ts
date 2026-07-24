import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** Future integration point for external reliability profile providers. Not wired yet. */
export interface IRemoteReliabilityProfileProvider {
  fetchRemote(reliabilityProfileId: string): Promise<ReliabilityProfile | null>;
  pushRemote(reliabilityProfile: ReliabilityProfile): Promise<void>;
}
