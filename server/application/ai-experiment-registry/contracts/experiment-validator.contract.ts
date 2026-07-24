import type {
  RegisterExperimentInput,
  Experiment,
  UpdateExperimentInput,
} from "@server/application/ai-experiment-registry/models/experiment.model";

export interface ExperimentValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IExperimentValidator {
  validateRegistration(input: RegisterExperimentInput): Promise<ExperimentValidationResult>;
  validateUpdate(
    existing: Experiment,
    input: UpdateExperimentInput,
  ): Promise<ExperimentValidationResult>;
}
