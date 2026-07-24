import type {
  RegisterDatasetVersionInput,
  DatasetVersion,
  UpdateDatasetVersionInput,
} from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

export interface DatasetVersionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IDatasetVersionValidator {
  validateRegistration(input: RegisterDatasetVersionInput): Promise<DatasetVersionValidationResult>;
  validateUpdate(
    existing: DatasetVersion,
    input: UpdateDatasetVersionInput,
  ): Promise<DatasetVersionValidationResult>;
}
