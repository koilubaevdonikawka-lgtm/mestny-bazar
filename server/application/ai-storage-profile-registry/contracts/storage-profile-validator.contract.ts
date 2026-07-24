import type {
  StorageProfile,
  RegisterStorageProfileInput,
  UpdateStorageProfileInput,
} from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

export interface StorageProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IStorageProfileValidator {
  validateRegistration(input: RegisterStorageProfileInput): Promise<StorageProfileValidationResult>;
  validateUpdate(
    existing: StorageProfile,
    input: UpdateStorageProfileInput,
  ): Promise<StorageProfileValidationResult>;
}
