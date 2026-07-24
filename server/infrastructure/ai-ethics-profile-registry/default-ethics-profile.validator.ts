import type {
  EthicsProfileValidationResult,
  IEthicsProfileValidator,
} from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-validator.contract";
import type {
  EthicsProfile,
  RegisterEthicsProfileInput,
  UpdateEthicsProfileInput,
} from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** Default ethics profile validator. */
export class DefaultEthicsProfileValidator implements IEthicsProfileValidator {
  async validateRegistration(input: RegisterEthicsProfileInput): Promise<EthicsProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Ethics profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Ethics profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Ethics profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: EthicsProfile,
    input: UpdateEthicsProfileInput,
  ): Promise<EthicsProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Ethics profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Ethics profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Ethics profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Ethics profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
