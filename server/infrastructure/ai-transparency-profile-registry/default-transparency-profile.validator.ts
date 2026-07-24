import type {
  TransparencyProfileValidationResult,
  ITransparencyProfileValidator,
} from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-validator.contract";
import type {
  TransparencyProfile,
  RegisterTransparencyProfileInput,
  UpdateTransparencyProfileInput,
} from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** Default transparency profile validator. */
export class DefaultTransparencyProfileValidator implements ITransparencyProfileValidator {
  async validateRegistration(input: RegisterTransparencyProfileInput): Promise<TransparencyProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Transparency profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Transparency profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Transparency profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: TransparencyProfile,
    input: UpdateTransparencyProfileInput,
  ): Promise<TransparencyProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Transparency profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Transparency profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Transparency profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Transparency profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
