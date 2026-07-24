import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** Future integration point for policy set export. Not wired yet. */
export interface IPolicySetExportProvider {
  exportTo(policySets: readonly PolicySet[]): Promise<string>;
}
