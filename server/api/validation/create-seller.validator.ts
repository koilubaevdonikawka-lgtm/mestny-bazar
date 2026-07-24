import type { RegisterSellerDto } from "@server/application/dto";
import {
  groupValidationErrors,
  type ValidationFieldError,
  type ValidationResult,
  validationFailure,
  validationSuccess,
} from "@server/api/validation/validation.types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates register seller request payloads. */
export class CreateSellerValidator {
  validate(input: unknown): ValidationResult {
    const errors: ValidationFieldError[] = [];

    if (!isObject(input)) {
      return validationFailure([{ field: "body", message: "Request body must be an object" }]);
    }

    if (!isNonEmptyString(input.name)) {
      errors.push({ field: "name", message: "name is required" });
    }

    if (!isNonEmptyString(input.phone)) {
      errors.push({ field: "phone", message: "phone is required" });
    }

    if (!isNonEmptyString(input.email)) {
      errors.push({ field: "email", message: "email is required" });
    }

    if (!isNonEmptyString(input.address)) {
      errors.push({ field: "address", message: "address is required" });
    }

    return errors.length > 0 ? validationFailure(errors) : validationSuccess();
  }

  toDto(input: unknown): RegisterSellerDto {
    const result = this.validate(input);
    if (!result.valid) {
      throw new Error("Invalid seller payload");
    }

    const body = input as Record<string, unknown>;
    return {
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email).trim(),
      address: String(body.address).trim(),
      limits: isObject(body.limits)
        ? (body.limits as RegisterSellerDto["limits"])
        : undefined,
    };
  }

  toFieldErrors(result: ValidationResult): Record<string, readonly string[]> {
    return groupValidationErrors(result.errors);
  }
}
