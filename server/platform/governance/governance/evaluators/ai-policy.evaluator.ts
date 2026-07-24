import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";
import {
  createPolicyResult,
  createPolicyViolation,
  PolicySeverity,
} from "@server/platform/governance/governance/models";
import type { AIWorkerRegistry } from "@server/platform/ai/ai/registry";

const REQUIRED_WORKERS = Object.freeze([
  "product-description",
  "product-seo",
  "auto-moderation",
  "support-assistant",
  "analytics-insight",
]);

/** Evaluates AI governance policies using AI platform registry metadata. */
export class AIPolicyEvaluator implements IPolicyEvaluator {
  readonly id = "ai-policy-evaluator";
  readonly supportedCategories = ["ai"];

  constructor(private readonly workerRegistry: AIWorkerRegistry) {}

  evaluate(descriptor: PolicyDescriptor): PolicyResult {
    const available = new Set(this.workerRegistry.getAvailableWorkers());
    const violations = REQUIRED_WORKERS.filter((workerId) => !available.has(workerId)).map(
      (workerId) =>
        createPolicyViolation({
          policyId: descriptor.id,
          code: "AI_WORKER_MISSING",
          message: `Required AI worker "${workerId}" is not registered.`,
          severity: PolicySeverity.Warning,
          source: workerId,
        }),
    );

    return createPolicyResult({
      policyId: descriptor.id,
      passed: violations.length === 0,
      violations,
    });
  }
}
