import type { FairnessProfile } from "@server/application/ai-fairness-profile-registry/models/fairness-profile.model";

/** Future integration point for fairness profile export. Not wired yet. */
export interface IFairnessProfileExportProvider {
  exportProfiles(fairnessProfiles: readonly FairnessProfile[]): Promise<string>;
}
