import type { StartupValidationResult } from "@server/bootstrap/startup-validator";

export interface ApplicationStartupResult {
  readonly validated: boolean;
  readonly validation: StartupValidationResult;
}

/** Validates platform prerequisites before startup. */
export class ApplicationStartup {
  constructor(
    private readonly validate: () => StartupValidationResult,
  ) {}

  run(): ApplicationStartupResult {
    const validation = this.validate();
    return Object.freeze({
      validated: validation.valid,
      validation,
    });
  }
}
