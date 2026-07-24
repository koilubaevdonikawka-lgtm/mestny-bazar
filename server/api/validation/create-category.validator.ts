import type { CreateCategoryDto } from "@server/application/dto";
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

/** Validates create category request payloads. */
export class CreateCategoryValidator {
  validate(input: unknown): ValidationResult {
    const errors: ValidationFieldError[] = [];

    if (!isObject(input)) {
      return validationFailure([{ field: "body", message: "Request body must be an object" }]);
    }

    if (!isNonEmptyString(input.catalogId)) {
      errors.push({ field: "catalogId", message: "catalogId is required" });
    }

    if (!isNonEmptyString(input.name)) {
      errors.push({ field: "name", message: "name is required" });
    }

    if (!isObject(input.hierarchy)) {
      errors.push({ field: "hierarchy", message: "hierarchy is required" });
    } else {
      if (!Array.isArray(input.hierarchy.existingPaths)) {
        errors.push({ field: "hierarchy.existingPaths", message: "existingPaths must be an array" });
      }
      if (!Array.isArray(input.hierarchy.ancestorIds)) {
        errors.push({ field: "hierarchy.ancestorIds", message: "ancestorIds must be an array" });
      }
    }

    return errors.length > 0 ? validationFailure(errors) : validationSuccess();
  }

  toDto(input: unknown): CreateCategoryDto {
    const result = this.validate(input);
    if (!result.valid) {
      throw new Error("Invalid category payload");
    }

    const body = input as Record<string, unknown>;
    const hierarchy = body.hierarchy as Record<string, unknown>;

    return {
      catalogId: String(body.catalogId).trim(),
      name: String(body.name).trim(),
      slug: typeof body.slug === "string" ? body.slug : undefined,
      parentId: typeof body.parentId === "string" ? body.parentId : null,
      parentPath: isObject(body.parentPath)
        ? (body.parentPath as CreateCategoryDto["parentPath"])
        : null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
      seo: isObject(body.seo) ? (body.seo as CreateCategoryDto["seo"]) : undefined,
      metadata: isObject(body.metadata)
        ? (body.metadata as Record<string, string>)
        : undefined,
      hierarchy: {
        existingPaths: [...(hierarchy.existingPaths as string[])],
        ancestorIds: [...(hierarchy.ancestorIds as string[])],
        maxDepth: typeof hierarchy.maxDepth === "number" ? hierarchy.maxDepth : undefined,
      },
    };
  }

  toFieldErrors(result: ValidationResult): Record<string, readonly string[]> {
    return groupValidationErrors(result.errors);
  }
}
