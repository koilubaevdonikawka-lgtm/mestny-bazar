import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

export interface IRiskRuleCatalog {
  register(riskRule: RiskRule): Promise<void>;
  remove(riskRuleId: string): Promise<void>;
  findById(riskRuleId: string): Promise<RiskRule | null>;
  findByName(name: string): Promise<RiskRule | null>;
  findByCategory(category: string): Promise<readonly RiskRule[]>;
  listAll(): Promise<readonly RiskRule[]>;
}
