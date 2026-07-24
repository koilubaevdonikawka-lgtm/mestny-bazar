import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

export interface IValidationProfileCatalog {
  register(validationProfile: ValidationProfile): Promise<void>;
  remove(validationProfileId: string): Promise<void>;
  findById(validationProfileId: string): Promise<ValidationProfile | null>;
  findByName(name: string): Promise<ValidationProfile | null>;
  findByCategory(category: string): Promise<readonly ValidationProfile[]>;
  listAll(): Promise<readonly ValidationProfile[]>;
}
