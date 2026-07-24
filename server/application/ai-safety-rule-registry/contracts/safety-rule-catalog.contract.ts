import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

export interface ISafetyRuleCatalog {
  register(safetyRule: SafetyRule): Promise<void>;
  remove(safetyRuleId: string): Promise<void>;
  findById(safetyRuleId: string): Promise<SafetyRule | null>;
  findByName(name: string): Promise<SafetyRule | null>;
  findByCategory(category: string): Promise<readonly SafetyRule[]>;
  listAll(): Promise<readonly SafetyRule[]>;
}
