import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** Future integration point for risk rule import. Not wired yet. */
export interface IRiskRuleImportProvider {
  importRules(source: string): Promise<readonly RiskRule[]>;
}
