import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** Future integration point for external validation profile providers. Not wired yet. */
export interface IRemoteValidationProfileProvider {
  fetchRemote(validationProfileId: string): Promise<ValidationProfile | null>;
  pushRemote(validationProfile: ValidationProfile): Promise<void>;
}
