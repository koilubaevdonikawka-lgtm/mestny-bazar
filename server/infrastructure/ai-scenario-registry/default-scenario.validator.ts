import type {
  IScenarioValidator,
  ScenarioValidationResult,
} from "@server/application/ai-scenario-registry/contracts/scenario-validator.contract";
import type {
  RegisterScenarioInput,
  Scenario,
  UpdateScenarioInput,
} from "@server/application/ai-scenario-registry/models/scenario.model";

/** Default scenario validator. */
export class DefaultScenarioValidator implements IScenarioValidator {
  async validateRegistration(input: RegisterScenarioInput): Promise<ScenarioValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Scenario name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Scenario category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Scenario status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Scenario,
    input: UpdateScenarioInput,
  ): Promise<ScenarioValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Scenario name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Scenario category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Scenario status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Scenario is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
