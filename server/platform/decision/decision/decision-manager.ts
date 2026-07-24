import type { IDecisionManager } from "@server/platform/decision/decision/contracts";
import type { IDecisionRegistry } from "@server/platform/decision/decision/contracts";
import type { IDecisionEngine } from "@server/platform/decision/decision/contracts";
import type { IDecisionEvaluator } from "@server/platform/decision/decision/contracts";
import type { IDecisionStrategyRegistry } from "@server/platform/decision/decision/contracts";
import type { IReasoningEngine } from "@server/platform/decision/decision/contracts";
import type { IConfidenceEngine } from "@server/platform/decision/decision/contracts";
import {
  createDecisionDescriptor,
  createDecisionEvaluation,
  createDecisionResult,
  type DecisionDescriptor,
  type DecisionEvaluation,
  type DecisionReasoning,
  type DecisionResult,
} from "@server/platform/decision/decision/models";
import {
  createDecisionEvaluatedEvent,
  createDecisionMadeEvent,
  createDecisionReplayedEvent,
} from "@server/platform/decision/decision/events";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";

/** Orchestrates platform decision evaluation and execution. */
export class DecisionManager implements IDecisionManager {
  constructor(
    private readonly registry: IDecisionRegistry,
    private readonly decisionEngine: IDecisionEngine,
    private readonly evaluator: IDecisionEvaluator,
    private readonly strategyRegistry: IDecisionStrategyRegistry,
    private readonly reasoningEngine: IReasoningEngine,
    private readonly confidenceEngine: IConfidenceEngine,
    private readonly architectureIntelligence: ArchitectureIntelligencePlatform,
  ) {}

  evaluate(descriptor: DecisionDescriptor): DecisionEvaluation {
    const stored = this.registry.register(createDecisionDescriptor(descriptor));
    const evidence = this.decisionEngine.collectEvidence(stored);
    const passed = this.evaluator.evaluateAll(stored, evidence);
    const evaluation = createDecisionEvaluation({ descriptor: stored, evidence, passed });
    createDecisionEvaluatedEvent(evaluation);
    return evaluation;
  }

  decide(descriptor: DecisionDescriptor): DecisionResult {
    const evaluation = this.evaluate(descriptor);
    const strategy = this.strategyRegistry.resolve(evaluation.descriptor.strategy);
    const risks = this.architectureIntelligence.detectRisks();
    const confidence = this.confidenceEngine.calculate(
      evaluation.descriptor.id,
      evaluation.evidence,
      risks.length,
    );

    const outcome = this.resolveOutcome(evaluation.passed, confidence.confidenceScore, strategy.threshold);
    const result = createDecisionResult({
      id: evaluation.descriptor.id,
      descriptor: evaluation.descriptor,
      outcome,
      summary: `${outcome} decision for ${evaluation.descriptor.subject}`,
      metadata: Object.freeze({
        confidenceScore: confidence.confidenceScore,
        strategy: evaluation.descriptor.strategy,
      }),
    });

    this.registry.storeResult(result);
    this.reasoningEngine.explain(
      result,
      evaluation.evidence,
      Object.freeze(["rule-evaluation", "policy-evaluation", "risk-evaluation", "compatibility-evaluation"]),
    );
    createDecisionMadeEvent(result);
    return result;
  }

  explainDecision(decisionId: string): DecisionReasoning | undefined {
    return this.reasoningEngine.get(decisionId);
  }

  listDecisions(kind?: DecisionDescriptor["kind"]): readonly DecisionResult[] {
    return this.registry.listResults(kind);
  }

  replayDecision(decisionId: string): DecisionResult | undefined {
    const existing = this.registry.getResult(decisionId);
    if (!existing) {
      return undefined;
    }
    const replayed = this.decide(existing.descriptor);
    createDecisionReplayedEvent(replayed);
    return replayed;
  }

  private resolveOutcome(
    passed: boolean,
    confidenceScore: number,
    threshold: number,
  ): DecisionResult["outcome"] {
    if (!passed) {
      return "reject";
    }
    if (confidenceScore >= threshold) {
      return "approve";
    }
    if (confidenceScore >= threshold - 15) {
      return "review";
    }
    return "defer";
  }
}
