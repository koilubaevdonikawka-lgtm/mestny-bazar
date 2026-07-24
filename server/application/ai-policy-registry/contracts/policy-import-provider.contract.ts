import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

/** Future integration point for policy import. Not wired yet. */
export interface IPolicyImportProvider {
  importFrom(source: string): Promise<readonly Policy[]>;
}
