import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** Future integration point for validation profile synchronization. Not wired yet. */
export interface IValidationProfileSynchronizationProvider {
  synchronize(validationProfiles: readonly ValidationProfile[]): Promise<void>;
}
