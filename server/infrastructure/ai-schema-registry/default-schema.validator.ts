import type {
  ISchemaValidator,
  SchemaValidationResult,
} from "@server/application/ai-schema-registry/contracts/schema-validator.contract";
import type {
  RegisterSchemaInput,
  Schema,
  UpdateSchemaInput,
} from "@server/application/ai-schema-registry/models/schema.model";

/** Default schema validator. */
export class DefaultSchemaValidator implements ISchemaValidator {
  async validateRegistration(input: RegisterSchemaInput): Promise<SchemaValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Schema name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Schema category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Schema status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Schema, input: UpdateSchemaInput): Promise<SchemaValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Schema name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Schema category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Schema status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Schema is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
