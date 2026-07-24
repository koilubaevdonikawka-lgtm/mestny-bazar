import type {
  RegisterSafetyRuleInput,
  SafetyRule,
  UpdateSafetyRuleInput,
} from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

export interface SafetyRuleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ISafetyRuleValidator {
  validateRegistration(input: RegisterSafetyRuleInput): Promise<SafetyRuleValidationResult>;
  validateUpdate(
    existing: SafetyRule,
    input: UpdateSafetyRuleInput,
  ): Promise<SafetyRuleValidationResult>;
}
