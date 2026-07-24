import type { IDecisionManager } from "@server/platform/decision/decision/contracts";
import type {
  DecisionDescriptor,
  DecisionEvaluation,
  DecisionReasoning,
  DecisionResult,
} from "@server/platform/decision/decision/models";

/** Public decision platform facade. */
export class DecisionPlatform {
  constructor(private readonly manager: IDecisionManager) {}

  evaluate(descriptor: DecisionDescriptor): DecisionEvaluation {
    return this.manager.evaluate(descriptor);
  }

  decide(descriptor: DecisionDescriptor): DecisionResult {
    return this.manager.decide(descriptor);
  }

  explainDecision(decisionId: string): DecisionReasoning | undefined {
    return this.manager.explainDecision(decisionId);
  }

  listDecisions(kind?: DecisionDescriptor["kind"]): readonly DecisionResult[] {
    return this.manager.listDecisions(kind);
  }

  replayDecision(decisionId: string): DecisionResult | undefined {
    return this.manager.replayDecision(decisionId);
  }
}
