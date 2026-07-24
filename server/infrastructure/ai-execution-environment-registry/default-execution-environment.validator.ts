import type {
  ExecutionEnvironmentValidationResult,
  IExecutionEnvironmentValidator,
} from "@server/application/ai-execution-environment-registry/contracts/execution-environment-validator.contract";
import type {
  ExecutionEnvironment,
  RegisterExecutionEnvironmentInput,
  UpdateExecutionEnvironmentInput,
} from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** Default execution environment validator. */
export class DefaultExecutionEnvironmentValidator implements IExecutionEnvironmentValidator {
  async validateRegistration(
    input: RegisterExecutionEnvironmentInput,
  ): Promise<ExecutionEnvironmentValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Execution environment name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Execution environment category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Execution environment status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ExecutionEnvironment,
    input: UpdateExecutionEnvironmentInput,
  ): Promise<ExecutionEnvironmentValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Execution environment name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Execution environment category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Execution environment status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Execution environment is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
