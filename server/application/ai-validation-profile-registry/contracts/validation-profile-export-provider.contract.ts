import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** Future integration point for validation profile export. Not wired yet. */
export interface IValidationProfileExportProvider {
  exportTo(validationProfiles: readonly ValidationProfile[]): Promise<string>;
}
