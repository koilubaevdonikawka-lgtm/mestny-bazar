import type {
  Provider,
  RegisterProviderInput,
  UpdateProviderInput,
} from "@server/application/ai-provider-registry/models/provider.model";

export interface ProviderValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IProviderValidator {
  validateRegistration(input: RegisterProviderInput): Promise<ProviderValidationResult>;
  validateUpdate(existing: Provider, input: UpdateProviderInput): Promise<ProviderValidationResult>;
}
