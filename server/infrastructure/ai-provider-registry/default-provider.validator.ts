import type {
  IProviderValidator,
  ProviderValidationResult,
} from "@server/application/ai-provider-registry/contracts/provider-validator.contract";
import type {
  Provider,
  RegisterProviderInput,
  UpdateProviderInput,
} from "@server/application/ai-provider-registry/models/provider.model";

/** Default provider validator. */
export class DefaultProviderValidator implements IProviderValidator {
  async validateRegistration(input: RegisterProviderInput): Promise<ProviderValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Provider name is required.");
    }
    if (!input.type?.trim()) {
      errors.push("Provider type is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Provider status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Provider, input: UpdateProviderInput): Promise<ProviderValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Provider name cannot be empty.");
    }
    if (input.type !== undefined && !input.type.trim()) {
      errors.push("Provider type cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Provider status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Provider is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
