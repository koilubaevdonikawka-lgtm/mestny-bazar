import type {
  IOntologyValidator,
  OntologyValidationResult,
} from "@server/application/ai-ontology-registry/contracts/ontology-validator.contract";
import type {
  RegisterOntologyInput,
  Ontology,
  UpdateOntologyInput,
} from "@server/application/ai-ontology-registry/models/ontology.model";

/** Default ontology validator. */
export class DefaultOntologyValidator implements IOntologyValidator {
  async validateRegistration(input: RegisterOntologyInput): Promise<OntologyValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Ontology name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Ontology category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Ontology status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Ontology,
    input: UpdateOntologyInput,
  ): Promise<OntologyValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Ontology name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Ontology category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Ontology status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Ontology is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
