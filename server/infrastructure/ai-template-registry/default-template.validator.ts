import type {
  ITemplateValidator,
  TemplateValidationResult,
} from "@server/application/ai-template-registry/contracts/template-validator.contract";
import type {
  RegisterTemplateInput,
  Template,
  UpdateTemplateInput,
} from "@server/application/ai-template-registry/models/template.model";

/** Default template validator. */
export class DefaultTemplateValidator implements ITemplateValidator {
  async validateRegistration(input: RegisterTemplateInput): Promise<TemplateValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Template name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Template category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Template status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Template,
    input: UpdateTemplateInput,
  ): Promise<TemplateValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Template name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Template category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Template status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Template is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
