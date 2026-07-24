import type {
  IKnowledgeSourceValidator,
  KnowledgeSourceValidationResult,
} from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-validator.contract";
import type {
  RegisterKnowledgeSourceInput,
  KnowledgeSource,
  UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** Default knowledge source validator. */
export class DefaultKnowledgeSourceValidator implements IKnowledgeSourceValidator {
  async validateRegistration(
    input: RegisterKnowledgeSourceInput,
  ): Promise<KnowledgeSourceValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Knowledge source name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Knowledge source category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Knowledge source status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: KnowledgeSource,
    input: UpdateKnowledgeSourceInput,
  ): Promise<KnowledgeSourceValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Knowledge source name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Knowledge source category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Knowledge source status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Knowledge source is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
