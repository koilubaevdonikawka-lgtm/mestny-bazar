import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** Future integration point for external risk rule providers. Not wired yet. */
export interface IRemoteRiskRuleProvider {
  fetchRemote(riskRuleId: string): Promise<RiskRule | null>;
  pushRemote(riskRule: RiskRule): Promise<void>;
}
