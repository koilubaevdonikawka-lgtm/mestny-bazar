export interface ValidationFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: readonly ValidationFieldError[];
}

export function validationSuccess(): ValidationResult {
  return Object.freeze({ valid: true, errors: [] });
}

export function validationFailure(errors: ValidationFieldError[]): ValidationResult {
  return Object.freeze({
    valid: false,
    errors: Object.freeze([...errors]),
  });
}

export function groupValidationErrors(
  errors: readonly ValidationFieldError[],
): Record<string, readonly string[]> {
  const grouped: Record<string, string[]> = {};
  for (const error of errors) {
    grouped[error.field] ??= [];
    grouped[error.field].push(error.message);
  }
  return Object.freeze(
    Object.fromEntries(Object.entries(grouped).map(([field, messages]) => [field, Object.freeze(messages)])),
  );
}
