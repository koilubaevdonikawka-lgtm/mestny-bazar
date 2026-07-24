import type {
  NetworkProfileValidationResult,
  INetworkProfileValidator,
} from "@server/application/ai-network-profile-registry/contracts/network-profile-validator.contract";
import type {
  NetworkProfile,
  RegisterNetworkProfileInput,
  UpdateNetworkProfileInput,
} from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** Default network profile validator. */
export class DefaultNetworkProfileValidator implements INetworkProfileValidator {
  async validateRegistration(input: RegisterNetworkProfileInput): Promise<NetworkProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Network profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Network profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Network profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: NetworkProfile,
    input: UpdateNetworkProfileInput,
  ): Promise<NetworkProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Network profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Network profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Network profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Network profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
