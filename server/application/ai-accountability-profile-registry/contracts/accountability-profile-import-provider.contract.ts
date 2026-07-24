import type { AccountabilityProfile } from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** Future integration point for accountability profile import. Not wired yet. */
export interface IAccountabilityProfileImportProvider {
  importProfiles(source: string): Promise<readonly AccountabilityProfile[]>;
}
