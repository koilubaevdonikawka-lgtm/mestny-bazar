import type {
  IActionValidator,
  ActionValidationResult,
} from "@server/application/ai-action-registry/contracts/action-validator.contract";
import type {
  RegisterActionInput,
  Action,
  UpdateActionInput,
} from "@server/application/ai-action-registry/models/action.model";

/** Default action validator. */
export class DefaultActionValidator implements IActionValidator {
  async validateRegistration(input: RegisterActionInput): Promise<ActionValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Action name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Action category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Action status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Action,
    input: UpdateActionInput,
  ): Promise<ActionValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Action name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Action category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Action status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Action is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
