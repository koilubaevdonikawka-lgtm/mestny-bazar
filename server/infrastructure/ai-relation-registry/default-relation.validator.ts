import type {
  IRelationValidator,
  RelationValidationResult,
} from "@server/application/ai-relation-registry/contracts/relation-validator.contract";
import type {
  RegisterRelationInput,
  Relation,
  UpdateRelationInput,
} from "@server/application/ai-relation-registry/models/relation.model";

/** Default relation validator. */
export class DefaultRelationValidator implements IRelationValidator {
  async validateRegistration(input: RegisterRelationInput): Promise<RelationValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Relation name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Relation category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Relation status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Relation,
    input: UpdateRelationInput,
  ): Promise<RelationValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Relation name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Relation category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Relation status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Relation is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
