import type {
  IVocabularyValidator,
  VocabularyValidationResult,
} from "@server/application/ai-vocabulary-registry/contracts/vocabulary-validator.contract";
import type {
  RegisterVocabularyInput,
  Vocabulary,
  UpdateVocabularyInput,
} from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** Default vocabulary validator. */
export class DefaultVocabularyValidator implements IVocabularyValidator {
  async validateRegistration(input: RegisterVocabularyInput): Promise<VocabularyValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Vocabulary name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Vocabulary category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Vocabulary status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Vocabulary,
    input: UpdateVocabularyInput,
  ): Promise<VocabularyValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Vocabulary name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Vocabulary category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Vocabulary status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Vocabulary is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
