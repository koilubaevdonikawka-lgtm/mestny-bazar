import type { IPolicyManager } from "@server/platform/policy/policy/contracts";
import type { IPolicyRegistry } from "@server/platform/policy/policy/contracts";
import type { IPolicyEvaluator } from "@server/platform/policy/policy/contracts";
import type { IPolicyEnforcementEngine } from "@server/platform/policy/policy/contracts";
import {
  createPolicyReport,
  type PolicyDecision,
  type PolicyDescriptor,
  type PolicyEvaluation,
  type PolicyReport,
} from "@server/platform/policy/policy/models";
import { createPolicyReportGeneratedEvent } from "@server/platform/policy/policy/events";

/** Orchestrates policy registration, evaluation, enforcement and reporting. */
export class PolicyManager implements IPolicyManager {
  constructor(
    private readonly registry: IPolicyRegistry,
    private readonly evaluator: IPolicyEvaluator,
    private readonly enforcementEngine: IPolicyEnforcementEngine,
  ) {}

  registerPolicy(policy: PolicyDescriptor): PolicyDescriptor {
    return this.registry.register(policy);
  }

  evaluatePolicy(policyId: string): PolicyEvaluation {
    const policy = this.requirePolicy(policyId);
    return this.evaluator.evaluate(policy);
  }

  enforcePolicy(policyId: string): PolicyDecision {
    const evaluation = this.evaluatePolicy(policyId);
    return this.enforcementEngine.enforce(evaluation);
  }

  listPolicies(category?: PolicyDescriptor["category"]): readonly PolicyDescriptor[] {
    return this.registry.list(category);
  }

  generatePolicyReport(): PolicyReport {
    const policies = this.registry.list();
    const evaluations = this.evaluator.evaluateAll(policies);
    const report = createPolicyReport({ evaluations });
    createPolicyReportGeneratedEvent(report);
    return report;
  }

  private requirePolicy(policyId: string): PolicyDescriptor {
    const policy = this.registry.get(policyId);
    if (!policy) {
      throw new Error(`Policy not found: ${policyId}`);
    }
    return policy;
  }
}
