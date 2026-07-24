import type {
  RegisterOntologyInput,
  Ontology,
  UpdateOntologyInput,
} from "@server/application/ai-ontology-registry/models/ontology.model";

export interface OntologyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IOntologyValidator {
  validateRegistration(input: RegisterOntologyInput): Promise<OntologyValidationResult>;
  validateUpdate(
    existing: Ontology,
    input: UpdateOntologyInput,
  ): Promise<OntologyValidationResult>;
}
