import type {
  RegisterEvaluationInput,
  Evaluation,
  UpdateEvaluationInput,
} from "@server/application/ai-evaluation-registry/models/evaluation.model";

export interface EvaluationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IEvaluationValidator {
  validateRegistration(input: RegisterEvaluationInput): Promise<EvaluationValidationResult>;
  validateUpdate(
    existing: Evaluation,
    input: UpdateEvaluationInput,
  ): Promise<EvaluationValidationResult>;
}
