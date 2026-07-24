import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

export interface IRuleSerializer {
  serialize(rule: Rule): Promise<string>;
  deserialize(serialized: string): Promise<Rule>;
}
