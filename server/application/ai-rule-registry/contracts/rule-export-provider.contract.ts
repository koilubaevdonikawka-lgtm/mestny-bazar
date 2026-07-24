import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

/** Future integration point for rule export. Not wired yet. */
export interface IRuleExportProvider {
  exportTo(rules: readonly Rule[]): Promise<string>;
}
