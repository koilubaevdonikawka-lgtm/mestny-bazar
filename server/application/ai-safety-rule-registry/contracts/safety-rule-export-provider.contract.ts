import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** Future integration point for safety rule export. Not wired yet. */
export interface ISafetyRuleExportProvider {
  exportRules(safetyRules: readonly SafetyRule[]): Promise<string>;
}
