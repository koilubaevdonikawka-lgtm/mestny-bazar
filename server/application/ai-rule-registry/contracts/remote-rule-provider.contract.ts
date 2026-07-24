import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

/** Future integration point for external rule providers. Not wired yet. */
export interface IRemoteRuleProvider {
  fetchRemote(ruleId: string): Promise<Rule | null>;
  pushRemote(rule: Rule): Promise<void>;
}
