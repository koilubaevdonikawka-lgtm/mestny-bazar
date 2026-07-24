import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

/** Future integration point for policy export. Not wired yet. */
export interface IPolicyExportProvider {
  exportTo(policies: readonly Policy[]): Promise<string>;
}
