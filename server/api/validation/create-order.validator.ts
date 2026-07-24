import type { CreateOrderDto } from "@server/application/dto";
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

/** Validates create order request payloads. */
export class CreateOrderValidator {
  validate(input: unknown): ValidationResult {
    const errors: ValidationFieldError[] = [];

    if (!isObject(input)) {
      return validationFailure([{ field: "body", message: "Request body must be an object" }]);
    }

    if (!isNonEmptyString(input.customerId)) {
      errors.push({ field: "customerId", message: "customerId is required" });
    }

    if (!isNonEmptyString(input.address)) {
      errors.push({ field: "address", message: "address is required" });
    }

    if (!isNonEmptyString(input.phone)) {
      errors.push({ field: "phone", message: "phone is required" });
    }

    if (!isNonEmptyString(input.paymentMethod)) {
      errors.push({ field: "paymentMethod", message: "paymentMethod is required" });
    }

    if (!isNonEmptyString(input.deliveryMethod)) {
      errors.push({ field: "deliveryMethod", message: "deliveryMethod is required" });
    }

    if (Array.isArray(input.items)) {
      input.items.forEach((item, index) => {
        if (!isObject(item)) {
          errors.push({ field: `items[${index}]`, message: "item must be an object" });
          return;
        }
        if (!isNonEmptyString(item.productId)) {
          errors.push({ field: `items[${index}].productId`, message: "productId is required" });
        }
        if (!Number.isInteger(item.quantity) || (item.quantity as number) <= 0) {
          errors.push({ field: `items[${index}].quantity`, message: "quantity must be positive" });
        }
      });
    }

    return errors.length > 0 ? validationFailure(errors) : validationSuccess();
  }

  toDto(input: unknown): CreateOrderDto {
    const result = this.validate(input);
    if (!result.valid) {
      throw new Error("Invalid order payload");
    }

    const body = input as Record<string, unknown>;
    return {
      customerId: String(body.customerId).trim(),
      address: String(body.address).trim(),
      phone: String(body.phone).trim(),
      comment: typeof body.comment === "string" ? body.comment : null,
      paymentMethod: String(body.paymentMethod).trim(),
      deliveryMethod: String(body.deliveryMethod).trim(),
      currency: typeof body.currency === "string" ? body.currency : undefined,
      deliveryFee: typeof body.deliveryFee === "number" ? body.deliveryFee : undefined,
      discount: typeof body.discount === "number" ? body.discount : undefined,
      items: Array.isArray(body.items) ? (body.items as CreateOrderDto["items"]) : undefined,
    };
  }

  toFieldErrors(result: ValidationResult): Record<string, readonly string[]> {
    return groupValidationErrors(result.errors);
  }
}
