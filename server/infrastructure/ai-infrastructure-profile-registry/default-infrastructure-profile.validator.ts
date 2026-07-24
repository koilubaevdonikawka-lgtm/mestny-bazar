import type {
  IInfrastructureProfileValidator,
  InfrastructureProfileValidationResult,
} from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-validator.contract";
import type {
  InfrastructureProfile,
  RegisterInfrastructureProfileInput,
  UpdateInfrastructureProfileInput,
} from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** Default infrastructure profile validator. */
export class DefaultInfrastructureProfileValidator implements IInfrastructureProfileValidator {
  async validateRegistration(
    input: RegisterInfrastructureProfileInput,
  ): Promise<InfrastructureProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Infrastructure profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Infrastructure profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Infrastructure profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: InfrastructureProfile,
    input: UpdateInfrastructureProfileInput,
  ): Promise<InfrastructureProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Infrastructure profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Infrastructure profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Infrastructure profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Infrastructure profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
