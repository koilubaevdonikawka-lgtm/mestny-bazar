import type { IPolicyEnforcementEngine } from "@server/platform/policy/policy/contracts";
import {
  createPolicyDecision,
  type PolicyDecision,
  type PolicyEvaluation,
  type PolicyEnforcementAction,
} from "@server/platform/policy/policy/models";
import { createPolicyEnforcedEvent } from "@server/platform/policy/policy/events";

/** Applies policy enforcement decisions as metadata (no business actions). */
export class PolicyEnforcementEngine implements IPolicyEnforcementEngine {
  enforce(evaluation: PolicyEvaluation): PolicyDecision {
    const action = this.resolveAction(evaluation);
    const decision = createPolicyDecision({
      policyId: evaluation.policyId,
      action,
      message: evaluation.passed
        ? `Policy passed: ${evaluation.reason}`
        : `Policy failed: ${evaluation.reason}`,
      metadata: Object.freeze({
        score: evaluation.score,
        passed: evaluation.passed,
      }),
    });
    createPolicyEnforcedEvent(decision);
    return decision;
  }

  enforceAll(evaluations: readonly PolicyEvaluation[]): readonly PolicyDecision[] {
    return Object.freeze(evaluations.map((evaluation) => this.enforce(evaluation)));
  }

  private resolveAction(evaluation: PolicyEvaluation): PolicyEnforcementAction {
    if (evaluation.passed) {
      return evaluation.score >= 100 ? "allow" : "audit";
    }
    if (evaluation.score > 0) {
      return "warn";
    }
    return "deny";
  }
}
