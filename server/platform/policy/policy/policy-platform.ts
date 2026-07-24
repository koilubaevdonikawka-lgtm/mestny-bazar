import type { IPolicyManager } from "@server/platform/policy/policy/contracts";
import type {
  PolicyDecision,
  PolicyDescriptor,
  PolicyEvaluation,
  PolicyReport,
} from "@server/platform/policy/policy/models";

/** Public policy platform facade. */
export class PolicyPlatform {
  constructor(private readonly manager: IPolicyManager) {}

  registerPolicy(policy: PolicyDescriptor): PolicyDescriptor {
    return this.manager.registerPolicy(policy);
  }

  evaluatePolicy(policyId: string): PolicyEvaluation {
    return this.manager.evaluatePolicy(policyId);
  }

  enforcePolicy(policyId: string): PolicyDecision {
    return this.manager.enforcePolicy(policyId);
  }

  listPolicies(category?: PolicyDescriptor["category"]): readonly PolicyDescriptor[] {
    return this.manager.listPolicies(category);
  }

  generatePolicyReport(): PolicyReport {
    return this.manager.generatePolicyReport();
  }
}
