import type { CreateProductDto } from "@server/application/dto";
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

/** Validates create product request payloads. */
export class CreateProductValidator {
  validate(input: unknown): ValidationResult {
    const errors: ValidationFieldError[] = [];

    if (!isObject(input)) {
      return validationFailure([{ field: "body", message: "Request body must be an object" }]);
    }

    if (!isNonEmptyString(input.sellerId)) {
      errors.push({ field: "sellerId", message: "sellerId is required" });
    }

    if (!isNonEmptyString(input.name)) {
      errors.push({ field: "name", message: "name is required" });
    }

    if (typeof input.priceAmount !== "number" || input.priceAmount < 0) {
      errors.push({ field: "priceAmount", message: "priceAmount must be a non-negative number" });
    }

    if (!isNonEmptyString(input.priceCurrency)) {
      errors.push({ field: "priceCurrency", message: "priceCurrency is required" });
    }

    if (!Number.isInteger(input.inventoryQuantity) || (input.inventoryQuantity as number) < 0) {
      errors.push({
        field: "inventoryQuantity",
        message: "inventoryQuantity must be a non-negative integer",
      });
    }

    return errors.length > 0 ? validationFailure(errors) : validationSuccess();
  }

  toDto(input: unknown): CreateProductDto {
    const result = this.validate(input);
    if (!result.valid) {
      throw new Error("Invalid product payload");
    }

    const body = input as Record<string, unknown>;
    return {
      sellerId: String(body.sellerId).trim(),
      name: String(body.name).trim(),
      description: typeof body.description === "string" ? body.description : null,
      priceAmount: body.priceAmount as number,
      priceCurrency: String(body.priceCurrency).trim(),
      inventoryQuantity: body.inventoryQuantity as number,
      media: Array.isArray(body.media) ? (body.media as CreateProductDto["media"]) : undefined,
      attributes: isObject(body.attributes)
        ? (body.attributes as Record<string, string>)
        : undefined,
    };
  }

  toFieldErrors(result: ValidationResult): Record<string, readonly string[]> {
    return groupValidationErrors(result.errors);
  }
}
