import type {
  Capability,
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-registry/models/capability.model";

export interface CapabilityValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ICapabilityValidator {
  validateRegistration(input: RegisterCapabilityInput): Promise<CapabilityValidationResult>;
  validateUpdate(existing: Capability, input: UpdateCapabilityInput): Promise<CapabilityValidationResult>;
}
