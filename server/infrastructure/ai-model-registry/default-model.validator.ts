import type {
  IModelValidator,
  ModelValidationResult,
} from "@server/application/ai-model-registry/contracts/model-validator.contract";
import type {
  Model,
  RegisterModelInput,
  UpdateModelInput,
} from "@server/application/ai-model-registry/models/model.model";

/** Default model validator. */
export class DefaultModelValidator implements IModelValidator {
  async validateRegistration(input: RegisterModelInput): Promise<ModelValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Model name is required.");
    }
    if (!input.provider?.trim()) {
      errors.push("Model provider is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Model status must be 'active' or 'inactive'.");
    }
    if (input.version !== undefined && !input.version.trim()) {
      errors.push("Model version cannot be empty.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Model, input: UpdateModelInput): Promise<ModelValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Model name cannot be empty.");
    }
    if (input.provider !== undefined && !input.provider.trim()) {
      errors.push("Model provider cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Model status must be 'active' or 'inactive'.");
    }
    if (input.version !== undefined && !input.version.trim()) {
      errors.push("Model version cannot be empty.");
    }

    if (!existing) {
      errors.push("Model is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
