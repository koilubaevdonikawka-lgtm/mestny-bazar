import type { RiskRule } from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

export interface IRiskRuleRepository {
  save(riskRule: RiskRule): Promise<void>;
  findById(riskRuleId: string): Promise<RiskRule | null>;
  findByName(name: string): Promise<RiskRule | null>;
  findByCategory(category: string): Promise<readonly RiskRule[]>;
  findAll(): Promise<readonly RiskRule[]>;
  delete(riskRuleId: string): Promise<boolean>;
}
