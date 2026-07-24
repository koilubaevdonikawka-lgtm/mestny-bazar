import type { PolicyDescriptor, PolicyResult, GovernanceReport } from "@server/platform/governance/governance/models";
import type { IPolicy } from "@server/platform/governance/governance/contracts/policy.contract";

/** Contract for the governance policy engine. */
export interface IPolicyEngine {
  registerPolicy(policy: IPolicy): void;
  evaluate(policyId: string): Promise<PolicyResult>;
  evaluateAll(): Promise<readonly PolicyResult[]>;
  enablePolicy(policyId: string): void;
  disablePolicy(policyId: string): void;
  listPolicies(): readonly PolicyDescriptor[];
  generateReport(): Promise<GovernanceReport>;
}
