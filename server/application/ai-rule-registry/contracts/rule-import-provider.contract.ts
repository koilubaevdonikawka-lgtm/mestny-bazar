import type { Rule } from "@server/application/ai-rule-registry/models/rule.model";

/** Future integration point for rule import. Not wired yet. */
export interface IRuleImportProvider {
  importFrom(source: string): Promise<readonly Rule[]>;
}
