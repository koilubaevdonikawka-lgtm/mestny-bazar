import type { GovernancePolicy } from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** Future integration point for governance policy export. Not wired yet. */
export interface IGovernancePolicyExportProvider {
  exportPolicies(governancePolicies: readonly GovernancePolicy[]): Promise<string>;
}
