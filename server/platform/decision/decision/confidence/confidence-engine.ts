import type { IConfidenceEngine } from "@server/platform/decision/decision/contracts";
import {
  createDecisionConfidence,
  type DecisionConfidence,
  type DecisionEvidence,
} from "@server/platform/decision/decision/models";
import { createConfidenceCalculatedEvent } from "@server/platform/decision/decision/events";

/** Calculates decision confidence scores. */
export class ConfidenceEngine implements IConfidenceEngine {
  calculate(
    decisionId: string,
    evidence: readonly DecisionEvidence[],
    riskCount: number,
  ): DecisionConfidence {
    const evidenceScore = Math.min(
      100,
      evidence.reduce((sum, item) => sum + item.weight * 10, 0),
    );
    const riskScore = Math.min(100, riskCount * 15);
    const confidenceScore = Math.max(0, Math.min(100, evidenceScore - riskScore / 2 + 20));

    const confidence = createDecisionConfidence({
      decisionId,
      confidenceScore,
      riskScore,
      evidenceScore,
    });
    createConfidenceCalculatedEvent(confidence);
    return confidence;
  }
}
