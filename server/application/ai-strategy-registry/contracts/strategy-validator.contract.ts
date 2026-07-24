import type {
  RegisterStrategyInput,
  Strategy,
  UpdateStrategyInput,
} from "@server/application/ai-strategy-registry/models/strategy.model";

export interface StrategyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IStrategyValidator {
  validateRegistration(input: RegisterStrategyInput): Promise<StrategyValidationResult>;
  validateUpdate(existing: Strategy, input: UpdateStrategyInput): Promise<StrategyValidationResult>;
}
