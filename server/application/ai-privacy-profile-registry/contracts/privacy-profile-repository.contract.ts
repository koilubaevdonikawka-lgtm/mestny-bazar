import type { PrivacyProfile } from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

export interface IPrivacyProfileRepository {
  save(privacyProfile: PrivacyProfile): Promise<void>;
  findById(privacyProfileId: string): Promise<PrivacyProfile | null>;
  findByName(name: string): Promise<PrivacyProfile | null>;
  findByCategory(category: string): Promise<readonly PrivacyProfile[]>;
  findAll(): Promise<readonly PrivacyProfile[]>;
  delete(privacyProfileId: string): Promise<boolean>;
}
