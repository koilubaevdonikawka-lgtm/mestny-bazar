import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

export interface IValidationProfileSerializer {
  serialize(validationProfile: ValidationProfile): Promise<string>;
  deserialize(serialized: string): Promise<ValidationProfile>;
}
