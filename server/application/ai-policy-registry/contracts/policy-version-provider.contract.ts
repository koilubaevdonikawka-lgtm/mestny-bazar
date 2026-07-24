import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

/** Future integration point for policy version management. Not wired yet. */
export interface IPolicyVersionProvider {
  listVersions(policyId: string): Promise<readonly Policy[]>;
  getVersion(policyId: string, version: string): Promise<Policy | null>;
}
