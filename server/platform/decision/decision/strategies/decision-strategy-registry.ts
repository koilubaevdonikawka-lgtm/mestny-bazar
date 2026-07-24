import type { IDecisionStrategyRegistry } from "@server/platform/decision/decision/contracts";
import type { DecisionStrategyKind } from "@server/platform/decision/decision/models";

/** Registry of decision strategies (metadata only). */
export class DecisionStrategyRegistry implements IDecisionStrategyRegistry {
  list(): readonly DecisionStrategyKind[] {
    return Object.freeze(["conservative", "balanced", "aggressive", "experimental"]);
  }

  resolve(strategy: DecisionStrategyKind): { threshold: number; allowExperimental: boolean } {
    switch (strategy) {
      case "conservative":
        return { threshold: 80, allowExperimental: false };
      case "balanced":
        return { threshold: 65, allowExperimental: false };
      case "aggressive":
        return { threshold: 50, allowExperimental: true };
      case "experimental":
        return { threshold: 30, allowExperimental: true };
      default:
        return { threshold: 65, allowExperimental: false };
    }
  }
}
