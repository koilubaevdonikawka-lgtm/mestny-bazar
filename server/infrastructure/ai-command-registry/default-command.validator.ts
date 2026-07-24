import type {
  ICommandValidator,
  CommandValidationResult,
} from "@server/application/ai-command-registry/contracts/command-validator.contract";
import type {
  RegisterCommandInput,
  Command,
  UpdateCommandInput,
} from "@server/application/ai-command-registry/models/command.model";

/** Default command validator. */
export class DefaultCommandValidator implements ICommandValidator {
  async validateRegistration(input: RegisterCommandInput): Promise<CommandValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Command name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Command category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Command status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Command,
    input: UpdateCommandInput,
  ): Promise<CommandValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Command name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Command category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Command status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Command is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
