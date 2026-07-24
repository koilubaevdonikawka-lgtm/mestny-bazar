import type { RolloutPlan } from "@server/platform/features/features/models";

/** Contract for rollout plan management (metadata only). */
export interface IRolloutManager {
  planRollout(plan: RolloutPlan): RolloutPlan;
  getPlan(planId: string): RolloutPlan | undefined;
  listPlans(featureId?: string): readonly RolloutPlan[];
}
