import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

export interface IPrivacyProfileCatalog {
  register(privacyProfile: PrivacyProfile): Promise<void>;
  remove(privacyProfileId: string): Promise<void>;
  findById(privacyProfileId: string): Promise<PrivacyProfile | null>;
  findByName(name: string): Promise<PrivacyProfile | null>;
  findByCategory(category: string): Promise<readonly PrivacyProfile[]>;
  listAll(): Promise<readonly PrivacyProfile[]>;
}
