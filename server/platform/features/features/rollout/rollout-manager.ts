import type { IRolloutManager } from "@server/platform/features/features/contracts";
import { createRolloutPlan, type RolloutPlan } from "@server/platform/features/features/models";
import { createRolloutPlannedEvent } from "@server/platform/features/features/events";

/** Manages rollout plans as metadata (no automatic execution). */
export class RolloutManager implements IRolloutManager {
  private readonly plans = new Map<string, RolloutPlan>();

  planRollout(plan: RolloutPlan): RolloutPlan {
    const stored = createRolloutPlan(plan);
    this.plans.set(stored.id, stored);
    createRolloutPlannedEvent(stored);
    return stored;
  }

  getPlan(planId: string): RolloutPlan | undefined {
    return this.plans.get(planId.trim());
  }

  listPlans(featureId?: string): readonly RolloutPlan[] {
    const values = [...this.plans.values()];
    const filtered = featureId
      ? values.filter((plan) => plan.featureId === featureId.trim())
      : values;
    return Object.freeze([...filtered]);
  }
}
