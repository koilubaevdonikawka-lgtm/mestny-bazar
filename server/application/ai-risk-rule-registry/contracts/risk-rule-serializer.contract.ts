import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

export interface IRiskRuleSerializer {
  serialize(riskRule: RiskRule): Promise<string>;
  deserialize(serialized: string): Promise<RiskRule>;
}
