import type {
  ReliabilityProfileValidationResult,
  IReliabilityProfileValidator,
} from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-validator.contract";
import type {
  ReliabilityProfile,
  RegisterReliabilityProfileInput,
  UpdateReliabilityProfileInput,
} from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

/** Default reliability profile validator. */
export class DefaultReliabilityProfileValidator implements IReliabilityProfileValidator {
  async validateRegistration(input: RegisterReliabilityProfileInput): Promise<ReliabilityProfileValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Reliability profile name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Reliability profile category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Reliability profile status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: ReliabilityProfile,
    input: UpdateReliabilityProfileInput,
  ): Promise<ReliabilityProfileValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Reliability profile name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Reliability profile category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Reliability profile status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Reliability profile is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
