import type {
  RegisterRuleInput,
  Rule,
  UpdateRuleInput,
} from "@server/application/ai-rule-registry/models/rule.model";

export interface RuleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IRuleValidator {
  validateRegistration(input: RegisterRuleInput): Promise<RuleValidationResult>;
  validateUpdate(existing: Rule, input: UpdateRuleInput): Promise<RuleValidationResult>;
}
