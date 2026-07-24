import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** Future integration point for external privacy profile providers. Not wired yet. */
export interface IRemotePrivacyProfileProvider {
  fetchRemote(privacyProfileId: string): Promise<PrivacyProfile | null>;
  pushRemote(privacyProfile: PrivacyProfile): Promise<void>;
}
