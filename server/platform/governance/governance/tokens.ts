/** DI tokens for the governance platform. */
export const GovernanceTokens = {
  GovernancePlatform: Symbol.for("governance.platform"),
  GovernanceRegistry: Symbol.for("governance.registry"),
  PolicyEngine: Symbol.for("governance.policyEngine"),
  PolicyEnforcer: Symbol.for("governance.policyEnforcer"),
  DependencyPolicyEvaluator: Symbol.for("governance.dependencyPolicyEvaluator"),
  ArchitecturePolicyEvaluator: Symbol.for("governance.architecturePolicyEvaluator"),
  ProviderPolicyEvaluator: Symbol.for("governance.providerPolicyEvaluator"),
  SecurityPolicyEvaluator: Symbol.for("governance.securityPolicyEvaluator"),
  RuntimePolicyEvaluator: Symbol.for("governance.runtimePolicyEvaluator"),
  TestingPolicyEvaluator: Symbol.for("governance.testingPolicyEvaluator"),
  AIPolicyEvaluator: Symbol.for("governance.aiPolicyEvaluator"),
} as const;

export type GovernanceToken = (typeof GovernanceTokens)[keyof typeof GovernanceTokens];
