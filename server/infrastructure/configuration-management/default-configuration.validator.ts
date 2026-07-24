import type {
  ConfigurationValidationResult,
  IConfigurationValidator,
} from "@server/application/configuration-management/contracts/configuration-validator.contract";

const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]{0,127}$/;

/** Default configuration key/value validator. */
export class DefaultConfigurationValidator implements IConfigurationValidator {
  validateKey(key: string): ConfigurationValidationResult {
    const normalizedKey = key.trim();
    const errors: string[] = [];

    if (!normalizedKey) {
      errors.push("Configuration key is required.");
    } else if (!KEY_PATTERN.test(normalizedKey)) {
      errors.push(
        "Configuration key must start with a letter and contain only letters, numbers, dots, underscores, or hyphens.",
      );
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }

  validateValue(value: unknown): ConfigurationValidationResult {
    const errors: string[] = [];

    if (value === undefined) {
      errors.push("Configuration value cannot be undefined.");
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }
}
