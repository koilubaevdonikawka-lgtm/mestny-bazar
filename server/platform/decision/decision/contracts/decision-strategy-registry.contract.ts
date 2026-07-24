import type { DecisionStrategyKind } from "@server/platform/decision/decision/models";

/** Contract for decision strategy registry. */
export interface IDecisionStrategyRegistry {
  list(): readonly DecisionStrategyKind[];
  resolve(strategy: DecisionStrategyKind): { threshold: number; allowExperimental: boolean };
}
