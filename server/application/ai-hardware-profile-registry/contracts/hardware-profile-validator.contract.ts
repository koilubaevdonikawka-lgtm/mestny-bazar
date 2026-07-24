import type {
  HardwareProfile,
  RegisterHardwareProfileInput,
  UpdateHardwareProfileInput,
} from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";

export interface HardwareProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IHardwareProfileValidator {
  validateRegistration(input: RegisterHardwareProfileInput): Promise<HardwareProfileValidationResult>;
  validateUpdate(
    existing: HardwareProfile,
    input: UpdateHardwareProfileInput,
  ): Promise<HardwareProfileValidationResult>;
}
