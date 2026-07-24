import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** Future integration point for fairness profile synchronization. Not wired yet. */
export interface IFairnessProfileSynchronizationProvider {
  synchronize(fairnessProfiles: readonly FairnessProfile[]): Promise<void>;
}
