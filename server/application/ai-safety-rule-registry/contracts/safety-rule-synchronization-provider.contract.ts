import type { SafetyRule } from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** Future integration point for safety rule synchronization. Not wired yet. */
export interface ISafetyRuleSynchronizationProvider {
  synchronize(safetyRules: readonly SafetyRule[]): Promise<void>;
}
