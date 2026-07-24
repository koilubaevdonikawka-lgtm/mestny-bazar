import type {
  IPromptValidator,
  PromptValidationResult,
} from "@server/application/ai-prompt-registry/contracts/prompt-validator.contract";
import type {
  Prompt,
  RegisterPromptInput,
  UpdatePromptInput,
} from "@server/application/ai-prompt-registry/models/prompt.model";

/** Default prompt validator. */
export class DefaultPromptValidator implements IPromptValidator {
  async validateRegistration(input: RegisterPromptInput): Promise<PromptValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Prompt name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Prompt category is required.");
    }
    if (!input.content?.trim()) {
      errors.push("Prompt content is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Prompt status must be 'active' or 'inactive'.");
    }
    if (input.version !== undefined && !input.version.trim()) {
      errors.push("Prompt version cannot be empty.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Prompt, input: UpdatePromptInput): Promise<PromptValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Prompt name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Prompt category cannot be empty.");
    }
    if (input.content !== undefined && !input.content.trim()) {
      errors.push("Prompt content cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Prompt status must be 'active' or 'inactive'.");
    }
    if (input.version !== undefined && !input.version.trim()) {
      errors.push("Prompt version cannot be empty.");
    }

    if (!existing) {
      errors.push("Prompt is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
