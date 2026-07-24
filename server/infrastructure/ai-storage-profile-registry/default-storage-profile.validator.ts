import type {
  StorageProfileValidationResult,
  IStorageProfileValidator,
} from "@server/application/ai-storage-profile-registry/contracts/storage-profile-validator.contract";
import type {
  StorageProfile,
  RegisterStorageProfileInput,
  UpdateStorageProfileInput,
} from "@server/application/ai-storage-profile-registry/models/storage-profile.model";

/** Default storage profile validator. */
export class DefaultStorageProfileValidator implements IStorageProfileValidator {
  async validateRegistration(input: RegisterStorageProfileInput): Promise<StorageProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Storage profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Storage profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Storage profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: StorageProfile,
    input: UpdateStorageProfileInput,
  ): Promise<StorageProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Storage profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Storage profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Storage profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Storage profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
