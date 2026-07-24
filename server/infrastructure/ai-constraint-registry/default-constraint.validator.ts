import type {
  IConstraintValidator,
  ConstraintValidationResult,
} from "@server/application/ai-constraint-registry/contracts/constraint-validator.contract";
import type {
  RegisterConstraintInput,
  Constraint,
  UpdateConstraintInput,
} from "@server/application/ai-constraint-registry/models/constraint.model";

/** Default constraint validator. */
export class DefaultConstraintValidator implements IConstraintValidator {
  async validateRegistration(input: RegisterConstraintInput): Promise<ConstraintValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Constraint name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Constraint category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Constraint status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Constraint, input: UpdateConstraintInput): Promise<ConstraintValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Constraint name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Constraint category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Constraint status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Constraint is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
