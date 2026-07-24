import type {
  RegisterDatasetInput,
  Dataset,
  UpdateDatasetInput,
} from "@server/application/ai-dataset-registry/models/dataset.model";

export interface DatasetValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IDatasetValidator {
  validateRegistration(input: RegisterDatasetInput): Promise<DatasetValidationResult>;
  validateUpdate(existing: Dataset, input: UpdateDatasetInput): Promise<DatasetValidationResult>;
}
