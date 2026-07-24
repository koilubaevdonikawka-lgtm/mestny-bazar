import type { IPolicyEvaluator } from "@server/platform/governance/governance/contracts";
import type { PolicyDescriptor, PolicyResult } from "@server/platform/governance/governance/models";
import {
  createPolicyResult,
  createPolicyViolation,
  PolicySeverity,
} from "@server/platform/governance/governance/models";
import type { ScenarioRunner } from "@server/platform/testing/testing/runners";

const REQUIRED_SCENARIOS = Object.freeze([
  "checkout",
  "payment",
  "marketplace",
  "moderation",
  "support",
  "analytics",
  "administration",
  "ai",
]);

/** Evaluates testing governance policies using testing platform metadata. */
export class TestingPolicyEvaluator implements IPolicyEvaluator {
  readonly id = "testing-policy-evaluator";
  readonly supportedCategories = ["testing"];

  constructor(private readonly scenarioRunner: ScenarioRunner) {}

  evaluate(descriptor: PolicyDescriptor): PolicyResult {
    const registered = new Set(this.scenarioRunner.list().map((scenario) => scenario.id));
    const violations = REQUIRED_SCENARIOS.filter((scenarioId) => !registered.has(scenarioId)).map(
      (scenarioId) =>
        createPolicyViolation({
          policyId: descriptor.id,
          code: "TEST_SCENARIO_MISSING",
          message: `Required end-to-end scenario "${scenarioId}" is not registered.`,
          severity: PolicySeverity.Warning,
          source: scenarioId,
        }),
    );

    return createPolicyResult({
      policyId: descriptor.id,
      passed: violations.length === 0,
      violations,
    });
  }
}
