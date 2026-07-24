import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** Future integration point for risk rule synchronization. Not wired yet. */
export interface IRiskRuleSynchronizationProvider {
  synchronize(riskRules: readonly RiskRule[]): Promise<void>;
}
