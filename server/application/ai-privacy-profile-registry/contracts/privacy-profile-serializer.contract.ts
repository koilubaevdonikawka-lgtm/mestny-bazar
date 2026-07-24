import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

export interface IPrivacyProfileSerializer {
  serialize(privacyProfile: PrivacyProfile): Promise<string>;
  deserialize(serialized: string): Promise<PrivacyProfile>;
}
