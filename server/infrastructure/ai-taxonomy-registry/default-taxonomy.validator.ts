import type {
  ITaxonomyValidator,
  TaxonomyValidationResult,
} from "@server/application/ai-taxonomy-registry/contracts/taxonomy-validator.contract";
import type {
  RegisterTaxonomyInput,
  Taxonomy,
  UpdateTaxonomyInput,
} from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** Default taxonomy validator. */
export class DefaultTaxonomyValidator implements ITaxonomyValidator {
  async validateRegistration(input: RegisterTaxonomyInput): Promise<TaxonomyValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Taxonomy name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Taxonomy category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Taxonomy status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Taxonomy,
    input: UpdateTaxonomyInput,
  ): Promise<TaxonomyValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Taxonomy name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Taxonomy category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Taxonomy status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Taxonomy is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
