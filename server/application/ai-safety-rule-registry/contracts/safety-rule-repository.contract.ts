import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

export interface ISafetyRuleRepository {
  save(safetyRule: SafetyRule): Promise<void>;
  findById(safetyRuleId: string): Promise<SafetyRule | null>;
  findByName(name: string): Promise<SafetyRule | null>;
  findByCategory(category: string): Promise<readonly SafetyRule[]>;
  findAll(): Promise<readonly SafetyRule[]>;
  delete(safetyRuleId: string): Promise<boolean>;
}
