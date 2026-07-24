import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** Future integration point for privacy profile synchronization. Not wired yet. */
export interface IPrivacyProfileSynchronizationProvider {
  synchronize(privacyProfiles: readonly PrivacyProfile[]): Promise<void>;
}
