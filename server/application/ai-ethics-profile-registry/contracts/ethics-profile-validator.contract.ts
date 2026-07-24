import type {
  EthicsProfile,
  RegisterEthicsProfileInput,
  UpdateEthicsProfileInput,
} from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

export interface EthicsProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IEthicsProfileValidator {
  validateRegistration(input: RegisterEthicsProfileInput): Promise<EthicsProfileValidationResult>;
  validateUpdate(
    existing: EthicsProfile,
    input: UpdateEthicsProfileInput,
  ): Promise<EthicsProfileValidationResult>;
}
