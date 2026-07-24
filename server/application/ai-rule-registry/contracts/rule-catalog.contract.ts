import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

export interface IRuleCatalog {
  register(rule: Rule): Promise<void>;
  remove(ruleId: string): Promise<void>;
  findById(ruleId: string): Promise<Rule | null>;
  findByName(name: string): Promise<Rule | null>;
  findByCategory(category: string): Promise<readonly Rule[]>;
  listAll(): Promise<readonly Rule[]>;
}
