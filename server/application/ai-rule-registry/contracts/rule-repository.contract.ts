import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

export interface IRuleRepository {
  save(rule: Rule): Promise<void>;
  findById(ruleId: string): Promise<Rule | null>;
  findByName(name: string): Promise<Rule | null>;
  findByCategory(category: string): Promise<readonly Rule[]>;
  findAll(): Promise<readonly Rule[]>;
  delete(ruleId: string): Promise<boolean>;
}
