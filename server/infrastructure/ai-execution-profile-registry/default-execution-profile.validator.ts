import type {
  IExecutionProfileValidator,
  ExecutionProfileValidationResult,
} from "@server/application/ai-execution-profile-registry/contracts/execution-profile-validator.contract";
import type {
  RegisterExecutionProfileInput,
  ExecutionProfile,
  UpdateExecutionProfileInput,
} from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** Default execution profile validator. */
export class DefaultExecutionProfileValidator implements IExecutionProfileValidator {
  async validateRegistration(input: RegisterExecutionProfileInput): Promise<ExecutionProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Execution profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Execution profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Execution profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: ExecutionProfile, input: UpdateExecutionProfileInput): Promise<ExecutionProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Execution profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Execution profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Execution profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Execution profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
