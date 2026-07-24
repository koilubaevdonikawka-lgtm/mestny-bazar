import type {
  RiskRule,
  RegisterRiskRuleInput,
  UpdateRiskRuleInput,
} from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

export interface RiskRuleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IRiskRuleValidator {
  validateRegistration(input: RegisterRiskRuleInput): Promise<RiskRuleValidationResult>;
  validateUpdate(
    existing: RiskRule,
    input: UpdateRiskRuleInput,
  ): Promise<RiskRuleValidationResult>;
}
