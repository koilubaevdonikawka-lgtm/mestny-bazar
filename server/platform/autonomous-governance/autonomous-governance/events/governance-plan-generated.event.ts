import type { GovernancePlan } from "@server/platform/autonomous-governance/autonomous-governance/models";

export interface GovernancePlanGeneratedEvent {
  readonly type: "autonomous-governance.plan.generated";
  readonly plan: GovernancePlan;
}

export function createGovernancePlanGeneratedEvent(
  plan: GovernancePlan,
): GovernancePlanGeneratedEvent {
  return Object.freeze({ type: "autonomous-governance.plan.generated", plan });
}
