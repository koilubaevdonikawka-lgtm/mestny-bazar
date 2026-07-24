import type {
  Persona,
  RegisterPersonaInput,
  UpdatePersonaInput,
} from "@server/application/ai-persona-registry/models/persona.model";

export interface PersonaValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IPersonaValidator {
  validateRegistration(input: RegisterPersonaInput): Promise<PersonaValidationResult>;
  validateUpdate(existing: Persona, input: UpdatePersonaInput): Promise<PersonaValidationResult>;
}
