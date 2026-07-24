import type {
  Model,
  RegisterModelInput,
  UpdateModelInput,
} from "@server/application/ai-model-registry/models/model.model";

export interface ModelValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IModelValidator {
  validateRegistration(input: RegisterModelInput): Promise<ModelValidationResult>;
  validateUpdate(existing: Model, input: UpdateModelInput): Promise<ModelValidationResult>;
}
