import type {
  PolicyDescriptor,
  PolicyEvaluation,
  PolicyDecision,
  PolicyReport,
} from "@server/platform/policy/policy/models";

/** Contract for policy lifecycle orchestration. */
export interface IPolicyManager {
  registerPolicy(policy: PolicyDescriptor): PolicyDescriptor;
  evaluatePolicy(policyId: string): PolicyEvaluation;
  enforcePolicy(policyId: string): PolicyDecision;
  listPolicies(category?: PolicyDescriptor["category"]): readonly PolicyDescriptor[];
  generatePolicyReport(): PolicyReport;
}
