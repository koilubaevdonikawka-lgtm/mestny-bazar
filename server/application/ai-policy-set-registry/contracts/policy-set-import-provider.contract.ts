import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** Future integration point for policy set import. Not wired yet. */
export interface IPolicySetImportProvider {
  importFrom(source: string): Promise<readonly PolicySet[]>;
}
