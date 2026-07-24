import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** Future integration point for fairness profile import. Not wired yet. */
export interface IFairnessProfileImportProvider {
  importProfiles(source: string): Promise<readonly FairnessProfile[]>;
}
