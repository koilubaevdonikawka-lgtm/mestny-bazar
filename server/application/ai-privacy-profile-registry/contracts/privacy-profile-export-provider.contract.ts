import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** Future integration point for privacy profile export. Not wired yet. */
export interface IPrivacyProfileExportProvider {
  exportProfiles(privacyProfiles: readonly PrivacyProfile[]): Promise<string>;
}
