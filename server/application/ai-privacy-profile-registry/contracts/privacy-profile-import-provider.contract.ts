import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** Future integration point for privacy profile import. Not wired yet. */
export interface IPrivacyProfileImportProvider {
  importProfiles(source: string): Promise<readonly PrivacyProfile[]>;
}
