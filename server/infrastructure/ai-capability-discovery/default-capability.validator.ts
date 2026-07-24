import type { ICapabilityValidator } from "@server/application/ai-capability-discovery/contracts/capability-validator.contract";
import type {
  AiCapability,
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-discovery/models/capability.model";

/** Default capability validator — name and input constraints. */
export class DefaultCapabilityValidator implements ICapabilityValidator {
  validateName(name: string): void {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error("Capability name is required.");
    }
    if (normalizedName.length > 128) {
      throw new Error("Capability name must not exceed 128 characters.");
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(normalizedName)) {
      throw new Error(
        "Capability name may only contain letters, numbers, dots, underscores, and hyphens.",
      );
    }
  }

  validateRegistration(input: RegisterCapabilityInput): void {
    this.validateName(input.name);
  }

  validateUpdate(_existing: AiCapability, input: UpdateCapabilityInput): void {
    if (input.name !== undefined) {
      this.validateName(input.name);
    }
    if (
      input.status !== undefined &&
      input.status !== "active" &&
      input.status !== "inactive"
    ) {
      throw new Error("Capability status must be 'active' or 'inactive'.");
    }
  }
}
