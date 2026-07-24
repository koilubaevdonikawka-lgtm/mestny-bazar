import type {
  IPersonaValidator,
  PersonaValidationResult,
} from "@server/application/ai-persona-registry/contracts/persona-validator.contract";
import type {
  Persona,
  RegisterPersonaInput,
  UpdatePersonaInput,
} from "@server/application/ai-persona-registry/models/persona.model";

/** Default persona validator. */
export class DefaultPersonaValidator implements IPersonaValidator {
  async validateRegistration(input: RegisterPersonaInput): Promise<PersonaValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Persona name is required.");
    }
    if (!input.type?.trim()) {
      errors.push("Persona type is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Persona status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Persona,
    input: UpdatePersonaInput,
  ): Promise<PersonaValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Persona name cannot be empty.");
    }
    if (input.type !== undefined && !input.type.trim()) {
      errors.push("Persona type cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Persona status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Persona is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
