import type {
  RegisterScenarioInput,
  Scenario,
  UpdateScenarioInput,
} from "@server/application/ai-scenario-registry/models/scenario.model";

export interface ScenarioValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IScenarioValidator {
  validateRegistration(input: RegisterScenarioInput): Promise<ScenarioValidationResult>;
  validateUpdate(
    existing: Scenario,
    input: UpdateScenarioInput,
  ): Promise<ScenarioValidationResult>;
}
