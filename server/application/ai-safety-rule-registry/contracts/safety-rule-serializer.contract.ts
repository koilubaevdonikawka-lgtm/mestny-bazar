import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

export interface ISafetyRuleSerializer {
  serialize(safetyRule: SafetyRule): Promise<string>;
  deserialize(serialized: string): Promise<SafetyRule>;
}
