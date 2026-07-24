import type {
  RegisterTaxonomyInput,
  Taxonomy,
  UpdateTaxonomyInput,
} from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

export interface TaxonomyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ITaxonomyValidator {
  validateRegistration(input: RegisterTaxonomyInput): Promise<TaxonomyValidationResult>;
  validateUpdate(
    existing: Taxonomy,
    input: UpdateTaxonomyInput,
  ): Promise<TaxonomyValidationResult>;
}
