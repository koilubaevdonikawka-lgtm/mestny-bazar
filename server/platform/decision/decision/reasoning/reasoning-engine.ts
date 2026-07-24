import type { IReasoningEngine } from "@server/platform/decision/decision/contracts";
import {
  createDecisionReasoning,
  type DecisionEvidence,
  type DecisionReasoning,
  type DecisionResult,
} from "@server/platform/decision/decision/models";
import { createDecisionExplainedEvent } from "@server/platform/decision/decision/events";

/** Builds decision trace and explanation (metadata only). */
export class ReasoningEngine implements IReasoningEngine {
  private readonly reasoningStore = new Map<string, DecisionReasoning>();

  explain(
    result: DecisionResult,
    evidence: readonly DecisionEvidence[],
    appliedRules: readonly string[],
  ): DecisionReasoning {
    const trace = Object.freeze([
      `Decision kind: ${result.descriptor.kind}`,
      `Strategy: ${result.descriptor.strategy}`,
      `Outcome: ${result.outcome}`,
      ...evidence.map((item) => `Evidence: ${item.label}=${item.value} (${item.source})`),
    ]);
    const reasoning = createDecisionReasoning({
      decisionId: result.id,
      trace,
      explanation: `Decision ${result.outcome} for ${result.descriptor.subject} based on ${evidence.length} evidence items`,
      appliedRules,
    });
    this.reasoningStore.set(result.id, reasoning);
    createDecisionExplainedEvent(reasoning);
    return reasoning;
  }

  get(decisionId: string): DecisionReasoning | undefined {
    return this.reasoningStore.get(decisionId.trim());
  }
}
