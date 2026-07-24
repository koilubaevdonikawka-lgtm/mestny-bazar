import type {
  RegisterConceptInput,
  Concept,
  UpdateConceptInput,
} from "@server/application/ai-concept-registry/models/concept.model";

export interface ConceptValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IConceptValidator {
  validateRegistration(input: RegisterConceptInput): Promise<ConceptValidationResult>;
  validateUpdate(existing: Concept, input: UpdateConceptInput): Promise<ConceptValidationResult>;
}
