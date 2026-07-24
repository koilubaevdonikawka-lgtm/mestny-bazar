/** DI tokens for the lifecycle platform. */
export const LifecycleTokens = {
  LifecyclePlatform: Symbol.for("lifecycle.platform"),
  LifecycleManager: Symbol.for("lifecycle.manager"),
  LifecycleRegistry: Symbol.for("lifecycle.registry"),
  LifecycleStateEngine: Symbol.for("lifecycle.stateEngine"),
  LifecycleTransitionEngine: Symbol.for("lifecycle.transitionEngine"),
  LifecycleOrchestrator: Symbol.for("lifecycle.orchestrator"),
  LifecycleValidator: Symbol.for("lifecycle.validator"),
  RecoveryPlanner: Symbol.for("lifecycle.recoveryPlanner"),
} as const;

export type LifecycleToken = (typeof LifecycleTokens)[keyof typeof LifecycleTokens];
