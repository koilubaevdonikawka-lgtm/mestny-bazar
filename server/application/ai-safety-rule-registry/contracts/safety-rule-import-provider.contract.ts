import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** Future integration point for safety rule import. Not wired yet. */
export interface ISafetyRuleImportProvider {
  importRules(source: string): Promise<readonly SafetyRule[]>;
}
