/** DI tokens for the policy platform. */
export const PolicyTokens = {
  PolicyPlatform: Symbol.for("policy.platform"),
  PolicyManager: Symbol.for("policy.manager"),
  PolicyRegistry: Symbol.for("policy.registry"),
  PolicyEvaluator: Symbol.for("policy.evaluator"),
  PolicyEnforcementEngine: Symbol.for("policy.enforcementEngine"),
  RuleRegistry: Symbol.for("policy.ruleRegistry"),
  ScopeResolver: Symbol.for("policy.scopeResolver"),
  PolicyExceptionRegistry: Symbol.for("policy.exceptionRegistry"),
} as const;

export type PolicyToken = (typeof PolicyTokens)[keyof typeof PolicyTokens];
