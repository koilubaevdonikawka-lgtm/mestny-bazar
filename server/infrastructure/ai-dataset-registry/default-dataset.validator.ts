import type {
  IDatasetValidator,
  DatasetValidationResult,
} from "@server/application/ai-dataset-registry/contracts/dataset-validator.contract";
import type {
  RegisterDatasetInput,
  Dataset,
  UpdateDatasetInput,
} from "@server/application/ai-dataset-registry/models/dataset.model";

/** Default dataset validator. */
export class DefaultDatasetValidator implements IDatasetValidator {
  async validateRegistration(input: RegisterDatasetInput): Promise<DatasetValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Dataset name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Dataset category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Dataset status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Dataset,
    input: UpdateDatasetInput,
  ): Promise<DatasetValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Dataset name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Dataset category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Dataset status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Dataset is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
