import type {
  NetworkProfile,
  RegisterNetworkProfileInput,
  UpdateNetworkProfileInput,
} from "@server/application/ai-network-profile-registry/models/network-profile.model";

export interface NetworkProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface INetworkProfileValidator {
  validateRegistration(input: RegisterNetworkProfileInput): Promise<NetworkProfileValidationResult>;
  validateUpdate(
    existing: NetworkProfile,
    input: UpdateNetworkProfileInput,
  ): Promise<NetworkProfileValidationResult>;
}
