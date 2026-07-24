import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** Future integration point for external safety rule providers. Not wired yet. */
export interface IRemoteSafetyRuleProvider {
  fetchRemote(safetyRuleId: string): Promise<SafetyRule | null>;
  pushRemote(safetyRule: SafetyRule): Promise<void>;
}
