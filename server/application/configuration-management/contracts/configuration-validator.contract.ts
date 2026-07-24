export interface ConfigurationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IConfigurationValidator {
  validateKey(key: string): ConfigurationValidationResult;
  validateValue(value: unknown): ConfigurationValidationResult;
}
