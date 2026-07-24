import type {
  ContextValidationResult,
  IContextValidator,
} from "@server/application/ai-context-management/contracts/context-validator.contract";
import type {
  Context,
  CreateContextInput,
  UpdateContextInput,
} from "@server/application/ai-context-management/models/context.model";

/** Default context validator. */
export class DefaultContextValidator implements IContextValidator {
  async validateCreation(input: CreateContextInput): Promise<ContextValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Context name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Context category is required.");
    }
    if (!input.content?.trim()) {
      errors.push("Context content is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Context status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Context, input: UpdateContextInput): Promise<ContextValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Context name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Context category cannot be empty.");
    }
    if (input.content !== undefined && !input.content.trim()) {
      errors.push("Context content cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Context status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Context is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
