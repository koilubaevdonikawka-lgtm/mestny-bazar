import type {
  IEntityValidator,
  EntityValidationResult,
} from "@server/application/ai-entity-registry/contracts/entity-validator.contract";
import type {
  RegisterEntityInput,
  Entity,
  UpdateEntityInput,
} from "@server/application/ai-entity-registry/models/entity.model";

/** Default entity validator. */
export class DefaultEntityValidator implements IEntityValidator {
  async validateRegistration(input: RegisterEntityInput): Promise<EntityValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Entity name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Entity category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Entity status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Entity,
    input: UpdateEntityInput,
  ): Promise<EntityValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Entity name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Entity category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Entity status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Entity is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
