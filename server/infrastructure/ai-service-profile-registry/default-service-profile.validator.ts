import type {
  ServiceProfileValidationResult,
  IServiceProfileValidator,
} from "@server/application/ai-service-profile-registry/contracts/service-profile-validator.contract";
import type {
  ServiceProfile,
  RegisterServiceProfileInput,
  UpdateServiceProfileInput,
} from "@server/application/ai-service-profile-registry/models/service-profile.model";

/** Default service profile validator. */
export class DefaultServiceProfileValidator implements IServiceProfileValidator {
  async validateRegistration(input: RegisterServiceProfileInput): Promise<ServiceProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Service profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Service profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Service profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ServiceProfile,
    input: UpdateServiceProfileInput,
  ): Promise<ServiceProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Service profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Service profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Service profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Service profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
