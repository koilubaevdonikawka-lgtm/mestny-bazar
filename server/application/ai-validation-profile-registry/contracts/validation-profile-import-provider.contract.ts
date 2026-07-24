import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** Future integration point for validation profile import. Not wired yet. */
export interface IValidationProfileImportProvider {
  importFrom(source: string): Promise<readonly ValidationProfile[]>;
}
