import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** Future integration point for governance policy import. Not wired yet. */
export interface IGovernancePolicyImportProvider {
  importPolicies(source: string): Promise<readonly GovernancePolicy[]>;
}
