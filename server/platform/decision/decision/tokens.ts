/** DI tokens for the decision platform. */
export const DecisionTokens = {
  DecisionPlatform: Symbol.for("decision.platform"),
  DecisionManager: Symbol.for("decision.manager"),
  DecisionRegistry: Symbol.for("decision.registry"),
  DecisionEngine: Symbol.for("decision.engine"),
  DecisionEvaluator: Symbol.for("decision.evaluator"),
  DecisionStrategyRegistry: Symbol.for("decision.strategyRegistry"),
  ReasoningEngine: Symbol.for("decision.reasoningEngine"),
  ConfidenceEngine: Symbol.for("decision.confidenceEngine"),
} as const;

export type DecisionToken = (typeof DecisionTokens)[keyof typeof DecisionTokens];
