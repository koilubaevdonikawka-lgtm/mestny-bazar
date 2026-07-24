import type {
  IEvaluationValidator,
  EvaluationValidationResult,
} from "@server/application/ai-evaluation-registry/contracts/evaluation-validator.contract";
import type {
  RegisterEvaluationInput,
  Evaluation,
  UpdateEvaluationInput,
} from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Default evaluation validator. */
export class DefaultEvaluationValidator implements IEvaluationValidator {
  async validateRegistration(input: RegisterEvaluationInput): Promise<EvaluationValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Evaluation name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Evaluation category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Evaluation status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Evaluation,
    input: UpdateEvaluationInput,
  ): Promise<EvaluationValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Evaluation name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Evaluation category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Evaluation status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Evaluation is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
