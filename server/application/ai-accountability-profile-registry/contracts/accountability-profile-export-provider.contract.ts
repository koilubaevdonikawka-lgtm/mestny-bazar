import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** Future integration point for accountability profile export. Not wired yet. */
export interface IAccountabilityProfileExportProvider {
  exportProfiles(accountabilityProfiles: readonly AccountabilityProfile[]): Promise<string>;
}
