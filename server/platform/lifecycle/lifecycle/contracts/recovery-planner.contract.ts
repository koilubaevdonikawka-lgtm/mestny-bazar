import type { RecoveryPlan, RecoveryPlanKind } from "@server/platform/lifecycle/lifecycle/models";

/** Contract for recovery plan metadata (no execution). */
export interface IRecoveryPlanner {
  planRestart(componentId: string): RecoveryPlan;
  planRecovery(componentId: string): RecoveryPlan;
  planSafeShutdown(componentId: string): RecoveryPlan;
  planRollback(componentId: string): RecoveryPlan;
  plan(kind: RecoveryPlanKind, componentId: string): RecoveryPlan;
}
