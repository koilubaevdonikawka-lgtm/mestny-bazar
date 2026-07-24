import type {
  IExperimentValidator,
  ExperimentValidationResult,
} from "@server/application/ai-experiment-registry/contracts/experiment-validator.contract";
import type {
  RegisterExperimentInput,
  Experiment,
  UpdateExperimentInput,
} from "@server/application/ai-experiment-registry/models/experiment.model";

/** Default experiment validator. */
export class DefaultExperimentValidator implements IExperimentValidator {
  async validateRegistration(input: RegisterExperimentInput): Promise<ExperimentValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Experiment name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Experiment category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Experiment status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Experiment,
    input: UpdateExperimentInput,
  ): Promise<ExperimentValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Experiment name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Experiment category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Experiment status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Experiment is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
