import type {
  IDatasetVersionValidator,
  DatasetVersionValidationResult,
} from "@server/application/ai-dataset-version-registry/contracts/dataset-version-validator.contract";
import type {
  RegisterDatasetVersionInput,
  DatasetVersion,
  UpdateDatasetVersionInput,
} from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** Default dataset version validator. */
export class DefaultDatasetVersionValidator implements IDatasetVersionValidator {
  async validateRegistration(
    input: RegisterDatasetVersionInput,
  ): Promise<DatasetVersionValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Dataset version name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Dataset version category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Dataset version status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: DatasetVersion,
    input: UpdateDatasetVersionInput,
  ): Promise<DatasetVersionValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Dataset version name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Dataset version category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Dataset version status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Dataset version is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
