import type { ValidationResult } from "@server/platform/documentation/documentation/models";

/** Contract for architecture validation. */
export interface IArchitectureValidator {
  validate(): ValidationResult;
}
