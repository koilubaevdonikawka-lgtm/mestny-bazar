import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

/** Future integration point for rule synchronization. Not wired yet. */
export interface IRuleSynchronizationProvider {
  synchronize(rules: readonly Rule[]): Promise<void>;
}
