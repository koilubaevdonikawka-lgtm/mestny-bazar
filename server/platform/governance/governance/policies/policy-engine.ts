import type { IPolicy, IPolicyEngine, IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { IGovernanceRegistry } from "@server/platform/governance/governance/contracts";
import type { IPolicyEnforcer } from "@server/platform/governance/governance/contracts";
import type {
  GovernanceReport,
  PolicyDescriptor,
  PolicyResult,
} from "@server/platform/governance/governance/models";
import { createGovernanceReport } from "@server/platform/governance/governance/models";
import { RegisteredPolicy } from "@server/platform/governance/governance/policies";
import {
  createPolicyEvaluatedEvent,
  createPolicyViolationDetectedEvent,
  createGovernanceReportGeneratedEvent,
} from "@server/platform/governance/governance/events";

/** Evaluates and manages governance policies. */
export class PolicyEngine implements IPolicyEngine {
  private readonly policies = new Map<string, IPolicy>();
  private readonly evaluators = new Map<string, IPolicyEvaluator>();

  constructor(
    private readonly registry: IGovernanceRegistry,
    private readonly enforcer: IPolicyEnforcer,
    evaluators: readonly IPolicyEvaluator[],
  ) {
    for (const evaluator of evaluators) {
      this.evaluators.set(evaluator.id, evaluator);
    }
  }

  registerPolicy(policy: IPolicy): void {
    this.policies.set(policy.descriptor.id, policy);
    this.registry.registerPolicy(policy.descriptor);
  }

  registerEvaluatorPolicy(descriptor: PolicyDescriptor): void {
    const evaluator = this.evaluators.get(descriptor.evaluatorId);
    if (!evaluator) {
      throw new Error(`Policy evaluator "${descriptor.evaluatorId}" is not registered.`);
    }
    this.registerPolicy(new RegisteredPolicy(descriptor, evaluator));
  }

  async evaluate(policyId: string): Promise<PolicyResult> {
    const policy = this.requirePolicy(policyId);
    if (!policy.descriptor.enabled) {
      return {
        policyId,
        passed: true,
        evaluatedAt: new Date().toISOString(),
        violations: Object.freeze([]),
      };
    }

    const result = await policy.evaluate();
    createPolicyEvaluatedEvent({ policyId, passed: result.passed });
    for (const violation of result.violations) {
      createPolicyViolationDetectedEvent({
        policyId,
        code: violation.code,
        message: violation.message,
      });
    }
    return result;
  }

  async evaluateAll(): Promise<readonly PolicyResult[]> {
    const results: PolicyResult[] = [];
    for (const policy of this.policies.values()) {
      results.push(await this.evaluate(policy.descriptor.id));
    }
    return Object.freeze(results);
  }

  enablePolicy(policyId: string): void {
    this.registry.enablePolicy(policyId);
    const policy = this.policies.get(policyId);
    if (policy) {
      this.policies.set(
        policyId,
        new RegisteredPolicy(
          Object.freeze({ ...policy.descriptor, enabled: true }),
          this.requireEvaluator(policy.descriptor.evaluatorId),
        ),
      );
    }
  }

  disablePolicy(policyId: string): void {
    this.registry.disablePolicy(policyId);
    const policy = this.policies.get(policyId);
    if (policy) {
      this.policies.set(
        policyId,
        new RegisteredPolicy(
          Object.freeze({ ...policy.descriptor, enabled: false }),
          this.requireEvaluator(policy.descriptor.evaluatorId),
        ),
      );
    }
  }

  listPolicies(): readonly PolicyDescriptor[] {
    return this.registry.listPolicies();
  }

  async generateReport(): Promise<GovernanceReport> {
    const results = await this.evaluateAll();
    const report = createGovernanceReport({ results });
    createGovernanceReportGeneratedEvent({ reportId: report.id, failed: report.failed });
    this.enforcer.enforce(this.enforcer.collectViolations(results));
    return report;
  }

  private requirePolicy(policyId: string): IPolicy {
    const policy = this.policies.get(policyId.trim());
    if (!policy) {
      throw new Error(`Policy "${policyId}" is not registered.`);
    }
    return policy;
  }

  private requireEvaluator(evaluatorId: string): IPolicyEvaluator {
    const evaluator = this.evaluators.get(evaluatorId);
    if (!evaluator) {
      throw new Error(`Policy evaluator "${evaluatorId}" is not registered.`);
    }
    return evaluator;
  }
}
