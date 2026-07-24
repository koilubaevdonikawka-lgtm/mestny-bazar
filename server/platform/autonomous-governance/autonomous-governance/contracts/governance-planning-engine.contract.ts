import type {
  GovernancePlan,
  GovernancePlanKind,
} from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Contract for governance planning (metadata only). */
export interface IGovernancePlanningEngine {
  generate(kind?: GovernancePlanKind): GovernancePlan;
}
