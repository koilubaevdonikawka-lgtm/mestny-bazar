import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

export interface IValidationProfileRepository {
  save(validationProfile: ValidationProfile): Promise<void>;
  findById(validationProfileId: string): Promise<ValidationProfile | null>;
  findByName(name: string): Promise<ValidationProfile | null>;
  findByCategory(category: string): Promise<readonly ValidationProfile[]>;
  findAll(): Promise<readonly ValidationProfile[]>;
  delete(validationProfileId: string): Promise<boolean>;
}
