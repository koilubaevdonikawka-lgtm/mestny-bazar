import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** Future integration point for external fairness profile providers. Not wired yet. */
export interface IRemoteFairnessProfileProvider {
  fetchRemote(fairnessProfileId: string): Promise<FairnessProfile | null>;
  pushRemote(fairnessProfile: FairnessProfile): Promise<void>;
}
