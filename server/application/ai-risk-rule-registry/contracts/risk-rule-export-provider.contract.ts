import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** Future integration point for risk rule export. Not wired yet. */
export interface IRiskRuleExportProvider {
  exportRules(riskRules: readonly RiskRule[]): Promise<string>;
}
