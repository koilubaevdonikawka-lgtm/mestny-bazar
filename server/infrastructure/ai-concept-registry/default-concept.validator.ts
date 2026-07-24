import type {
  IConceptValidator,
  ConceptValidationResult,
} from "@server/application/ai-concept-registry/contracts/concept-validator.contract";
import type {
  RegisterConceptInput,
  Concept,
  UpdateConceptInput,
} from "@server/application/ai-concept-registry/models/concept.model";

/** Default concept validator. */
export class DefaultConceptValidator implements IConceptValidator {
  async validateRegistration(input: RegisterConceptInput): Promise<ConceptValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Concept name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Concept category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Concept status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Concept,
    input: UpdateConceptInput,
  ): Promise<ConceptValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Concept name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Concept category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Concept status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Concept is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
